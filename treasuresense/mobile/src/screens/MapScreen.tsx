import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zone, MapRegion } from '../types';
import { zonesApi } from '../api/zones';
import { ZoneMarker } from '../components/ZoneMarker';
import { ZoneDetailSheet } from '../components/ZoneDetailSheet';
import { UserLocationButton } from '../components/UserLocationButton';
import { LoadingOverlay } from '../components/LoadingOverlay';

const { width, height } = Dimensions.get('window');

MapboxGL.setAccessToken(process.env.MAPBOX_TOKEN || '');

export const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fetch zones based on visible map region
  const { data: zones, isLoading, refetch } = useQuery({
    queryKey: ['zones', mapRegion],
    queryFn: () => zonesApi.getNearby({
      lat: mapRegion.latitude,
      lng: mapRegion.longitude,
      radius: calculateRadius(mapRegion),
    }),
  });

  // Calculate radius from map region
  const calculateRadius = (region: MapRegion): number => {
    const latDelta = region.latitudeDelta;
    // Rough conversion: 1 degree lat ~ 111km
    return Math.round((latDelta * 111000) / 2);
  };

  // Handle map region change
  const onRegionChange = useCallback((region: MapRegion) => {
    setMapRegion(region);
  }, []);

  // Handle zone marker press
  const onZonePress = useCallback((zone: Zone) => {
    setSelectedZone(zone);
  }, []);

  // Close zone detail
  const onCloseDetail = useCallback(() => {
    setSelectedZone(null);
  }, []);

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (userLocation) {
      // Animate to user location
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/dark-v11"
        onRegionDidChange={onRegionChange}
        compassEnabled
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          centerCoordinate={[mapRegion.longitude, mapRegion.latitude]}
          zoomLevel={12}
        />

        <MapboxGL.UserLocation
          visible
          onUpdate={(location) => {
            setUserLocation([location.coords.longitude, location.coords.latitude]);
          }}
        />

        {/* Zone Markers */}
        {zones?.map((zone) => (
          <ZoneMarker
            key={zone.id}
            zone={zone}
            onPress={() => onZonePress(zone)}
          />
        ))}

        {/* Heat Map Layer */}
        <MapboxGL.HeatmapLayer
          id="zoneHeatmap"
          sourceID="zonesSource"
          style={{
            heatmapRadius: 30,
            heatmapOpacity: 0.6,
            heatmapColor: [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'rgb(0, 255, 255)',
              0.4, 'rgb(0, 255, 0)',
              0.6, 'rgb(255, 255, 0)',
              0.8, 'rgb(255, 126, 0)',
              1, 'rgb(255, 0, 0)',
            ],
          }}
        />
      </MapboxGL.MapView>

      {/* User Location Button */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.locationButton, { top: insets.top + 60 }]}
      >
        <UserLocationButton onPress={centerOnUser} />
      </Animated.View>

      {/* XP Progress (top bar) */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.xpBar, { top: insets.top + 10 }]}
      >
        <View style={styles.xpContainer}>
          <Text style={styles.levelText}>LVL 5</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: '65%' }]} />
          </View>
          <Text style={styles.xpText}>2,450 / 3,000</Text>
        </View>
      </Animated.View>

      {/* Zone Detail Sheet */}
      {selectedZone && (
        <ZoneDetailSheet
          zone={selectedZone}
          onClose={onCloseDetail}
          userLocation={userLocation}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  map: {
    width,
    height,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
  },
  xpBar: {
    position: 'absolute',
    left: 16,
    right: 80,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  levelText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
  },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  xpText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 8,
  },
});
