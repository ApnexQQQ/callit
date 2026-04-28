import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { aiService } from '../services/ai';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Validation schemas
const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  minScore: z.coerce.number().min(0).max(100).default(30),
});

const visitSchema = z.object({
  zoneId: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
});

// GET /zones/nearby - Get zones near location
router.get('/nearby', authenticate, async (req, res, next) => {
  try {
    const { lat, lng, radius, minScore } = nearbyQuerySchema.parse(req.query);
    const cacheKey = `zones:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`;
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: { zones: JSON.parse(cached) },
        cached: true,
      });
    }

    // Query PostGIS for zones within radius
    const zones = await prisma.$queryRaw`
      SELECT 
        z.id,
        z.probability_score as "probabilityScore",
        z.score_factors as "scoreFactors",
        z.zone_type as "zoneType",
        z.terrain_type as "terrainType",
        z.historical_context as "historicalContext",
        z.nearby_discoveries_count as "nearbyDiscoveriesCount",
        ST_X(z.center::geometry) as lat,
        ST_Y(z.center::geometry) as lng,
        ST_Distance(z.center, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) as distance
      FROM zones z
      WHERE ST_DWithin(
        z.center, 
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
        ${radius}
      )
      AND z.probability_score >= ${minScore}
      AND (z.is_event = false OR z.event_expires_at > NOW())
      ORDER BY z.probability_score DESC, distance ASC
      LIMIT 50
    `;

    // Format response
    const formattedZones = (zones as any[]).map(zone => ({
      id: zone.id,
      center: { lat: zone.lat, lng: zone.lng },
      probabilityScore: parseFloat(zone.probabilityScore),
      scoreFactors: zone.scoreFactors,
      zoneType: zone.zoneType,
      terrainType: zone.terrainType,
      historicalContext: zone.historicalContext,
      nearbyDiscoveriesCount: zone.nearbyDiscoveriesCount,
      distance: Math.round(zone.distance),
    }));

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(formattedZones));

    res.json({
      success: true,
      data: { zones: formattedZones },
    });
  } catch (error) {
    next(error);
  }
});

// GET /zones/:id - Get zone details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `zone:${id}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
      });
    }

    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        discoveries: {
          where: { status: 'VERIFIED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            primaryImageUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Zone not found' },
      });
    }

    // Get AI insights
    const aiInsights = await aiService.getZoneInsights(zone.id);

    const response = {
      id: zone.id,
      probabilityScore: zone.probabilityScore,
      scoreFactors: zone.scoreFactors,
      zoneType: zone.zoneType,
      terrainType: zone.terrainType,
      historicalContext: zone.historicalContext,
      nearbyDiscoveriesCount: zone.nearbyDiscoveriesCount,
      recentDiscoveries: zone.discoveries,
      aiInsights,
    };

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, JSON.stringify(response));

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

// POST /zones/:id/visit - Record zone visit
router.post('/:id/visit', authenticate, rateLimit('zone_visit', 10, 60), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { lat, lng } = visitSchema.parse(req.body);

    // Verify user is actually in the zone
    const zone = await prisma.$queryRaw`
      SELECT id, ST_DWithin(
        center,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        radius_meters
      ) as is_inside
      FROM zones
      WHERE id = ${id}::uuid
    `;

    if (!(zone as any[])[0]?.is_inside) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_IN_ZONE', message: 'You must be inside the zone to visit' },
      });
    }

    // Check if already visited today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVisit = await prisma.zoneVisit.findFirst({
      where: {
        userId,
        zoneId: id,
        createdAt: { gte: today },
      },
    });

    if (existingVisit) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VISITED', message: 'Zone already visited today' },
      });
    }

    // Record visit
    await prisma.zoneVisit.create({
      data: {
        userId,
        zoneId: id,
        location: { type: 'Point', coordinates: [lng, lat] },
      },
    });

    // Award XP
    const xpEarned = 25;
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        totalXpEarned: { increment: xpEarned },
      },
    });

    // Update streak
    const userStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (userStats) {
      const lastDiscovery = userStats.lastDiscoveryDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastDiscovery && lastDiscovery >= yesterday) {
        newStreak = userStats.currentStreak + 1;
      }

      await prisma.userStats.update({
        where: { userId },
        data: {
          zonesVisited: { increment: 1 },
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, userStats.longestStreak),
        },
      });
    }

    res.json({
      success: true,
      data: {
        xpEarned,
        message: `Zone visited! +${xpEarned} XP`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /zones/analyze - AI analyze custom location
router.post('/analyze', authenticate, rateLimit('ai_analyze', 30, 3600), async (req, res, next) => {
  try {
    const { lat, lng } = z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).parse(req.body);

    // Check subscription for free users
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { subscriptionTier: true },
    });

    if (user?.subscriptionTier === 'FREE') {
      // Check daily scan limit
      const scansToday = await redis.get(`scans:${req.user!.id}:${new Date().toISOString().split('T')[0]}`);
      if (scansToday && parseInt(scansToday) >= 5) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'SCAN_LIMIT',
            message: 'Free users limited to 5 scans per day. Upgrade to Premium!',
          },
        });
      }
      await redis.incr(`scans:${req.user!.id}:${new Date().toISOString().split('T')[0]}`);
    }

    // Get AI analysis
    const analysis = await aiService.analyzeLocation(lat, lng);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
