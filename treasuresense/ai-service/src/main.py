from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime
import joblib
import os

from services.terrain import TerrainAnalyzer
from services.historical import HistoricalDataService
from services.scoring import ProbabilityScorer

app = FastAPI(title="TreasureSense AI Service")

# Initialize services
terrain_analyzer = TerrainAnalyzer()
historical_service = HistoricalDataService()
scorer = ProbabilityScorer()

class LocationRequest(BaseModel):
    lat: float
    lng: float

class ZoneAnalysis(BaseModel):
    probability_score: float
    confidence: float
    factors: dict
    explanation: str
    recommendations: List[str]
    nearby_discoveries: int

class ImageVerification(BaseModel):
    authenticity_score: float
    checks: dict
    detected_objects: List[str]
    verification: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/analyze", response_model=ZoneAnalysis)
async def analyze_location(request: LocationRequest):
    """
    Analyze a location for treasure hunting probability.
    Returns a score 0-100 with explanations and recommendations.
    """
    try:
        # 1. Get terrain analysis
        terrain_features = await terrain_analyzer.analyze(
            request.lat, 
            request.lng
        )
        
        # 2. Get historical context
        historical_data = await historical_service.get_context(
            request.lat, 
            request.lng
        )
        
        # 3. Check nearby discoveries
        nearby_discoveries = await historical_service.count_nearby_discoveries(
            request.lat, 
            request.lng, 
            radius_km=2.0
        )
        
        # 4. Calculate probability score
        score_result = scorer.calculate_score(
            terrain_features,
            historical_data,
            nearby_discoveries
        )
        
        # 5. Generate explanation
        explanation = generate_explanation(
            score_result,
            historical_data,
            terrain_features
        )
        
        # 6. Generate recommendations
        recommendations = generate_recommendations(
            terrain_features,
            historical_data
        )
        
        return ZoneAnalysis(
            probability_score=round(score_result['total_score'], 1),
            confidence=round(score_result['confidence'], 2),
            factors={
                'historical': round(score_result['historical_score'], 0),
                'terrain': round(score_result['terrain_score'], 0),
                'proximity': round(score_result['proximity_score'], 0)
            },
            explanation=explanation,
            recommendations=recommendations,
            nearby_discoveries=nearby_discoveries
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-image", response_model=ImageVerification)
async def verify_image(image_url: str):
    """
    Verify authenticity of a discovery image.
    Checks EXIF, GPS consistency, and AI artifacts.
    """
    try:
        from services.image_verification import ImageVerifier
        
        verifier = ImageVerifier()
        result = await verifier.verify(image_url)
        
        return ImageVerification(
            authenticity_score=round(result['score'], 1),
            checks=result['checks'],
            detected_objects=result['objects'],
            verification="PASSED" if result['score'] > 80 else "REVIEW"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/zone-insights/{zone_id}")
async def get_zone_insights(zone_id: str):
    """
    Get detailed AI insights for a specific zone.
    """
    try:
        # Load zone data from cache or DB
        zone_data = await historical_service.get_zone_data(zone_id)
        
        return {
            "terrain_analysis": zone_data.get('terrain_summary', ''),
            "historical_data": zone_data.get('historical_summary', ''),
            "recommendations": zone_data.get('recommendations', []),
            "best_times": zone_data.get('best_times', ['Morning', 'Late afternoon']),
            "equipment_suggestions": zone_data.get('equipment', ['Metal detector', 'Pinpointer'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_explanation(score_result: dict, historical: dict, terrain: dict) -> str:
    """Generate human-readable explanation of the score."""
    score = score_result['total_score']
    
    if score >= 80:
        base = "Excellent location!"
    elif score >= 60:
        base = "Good potential here."
    elif score >= 40:
        base = "Moderate potential."
    else:
        base = "Lower probability area."
    
    reasons = []
    
    if historical.get('nearby_sites'):
        reasons.append(f"nearby {historical['nearby_sites'][0]['type']}")
    
    if terrain.get('features', {}).get('water_proximity'):
        reasons.append("water access")
    
    if score_result['proximity_score'] > 70:
        reasons.append("previous discoveries in area")
    
    if reasons:
        return f"{base} Factors: {', '.join(reasons)}."
    
    return base

def generate_recommendations(terrain: dict, historical: dict) -> List[str]:
    """Generate hunting recommendations based on analysis."""
    recommendations = []
    
    terrain_features = terrain.get('features', {})
    
    # Terrain-based recommendations
    if terrain_features.get('slope') == 'gentle':
        recommendations.append("Check gentle slopes where items may have settled")
    
    if terrain_features.get('vegetation') == 'sparse':
        recommendations.append("Sparse vegetation makes detecting easier")
    
    if terrain_features.get('soil_type') in ['sandy', 'loamy']:
        recommendations.append("Good soil conditions for preservation")
    
    # Historical-based recommendations
    if historical.get('era') == 'colonial':
        recommendations.append("Look near old foundations or cellar holes")
    
    if historical.get('trade_route_proximity'):
        recommendations.append("Search along historical travel corridors")
    
    # Default recommendations if list is short
    if len(recommendations) < 3:
        defaults = [
            "Search near tree lines where people rested",
            "Check areas with disturbed soil patterns",
            "Focus on natural gathering spots"
        ]
        recommendations.extend(defaults[:3-len(recommendations)])
    
    return recommendations[:5]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
