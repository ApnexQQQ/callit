import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions, RefreshControl } from 'react-native';
import { VideoCard } from '../components/VideoCard';
import { Prediction } from '../types';

const { height } = Dimensions.get('window');

// Mock data - replace with API call
const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: '1',
    userId: '1',
    user: {
      id: '1',
      username: 'crypto_oracle',
      email: 'test@test.com',
      accuracy: 85,
      totalPredictions: 40,
      correctPredictions: 34,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Bitcoin will hit $100k by end of year! Here\'s why...',
    category: 'Crypto',
    predictionText: 'Bitcoin will reach $100,000 by December 31, 2024',
    outcomeDate: '2024-12-31',
    status: 'pending',
    createdAt: new Date().toISOString(),
    likes: 1234,
    comments: 89,
    shares: 45,
  },
  {
    id: '2',
    userId: '2',
    user: {
      id: '2',
      username: 'sports_guru',
      email: 'test2@test.com',
      accuracy: 72,
      totalPredictions: 25,
      correctPredictions: 18,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'Lakers are winning the championship this year!',
    category: 'Sports',
    predictionText: 'Lakers will win the 2024 NBA Championship',
    outcomeDate: '2024-06-15',
    status: 'resolved_false',
    createdAt: new Date().toISOString(),
    likes: 567,
    comments: 234,
    shares: 89,
  },
  {
    id: '3',
    userId: '3',
    user: {
      id: '3',
      username: 'tech_prophet',
      email: 'test3@test.com',
      accuracy: 91,
      totalPredictions: 55,
      correctPredictions: 50,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'Apple is releasing VR glasses next month!',
    category: 'Tech',
    predictionText: 'Apple will announce VR glasses in March 2024',
    outcomeDate: '2024-03-31',
    status: 'resolved_true',
    createdAt: new Date().toISOString(),
    likes: 3456,
    comments: 567,
    shares: 234,
  },
  {
    id: '4',
    userId: '4',
    user: {
      id: '4',
      username: 'election_watcher',
      email: 'test4@test.com',
      accuracy: 68,
      totalPredictions: 30,
      correctPredictions: 20,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    caption: 'My take on the upcoming elections...',
    category: 'Politics',
    predictionText: 'Candidate X will win by a landslide',
    outcomeDate: '2024-11-05',
    status: 'pending',
    createdAt: new Date().toISOString(),
    likes: 890,
    comments: 456,
    shares: 123,
  },
];

export function FeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Fetch new data here
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Prediction; index: number }) => (
    <VideoCard prediction={item} isActive={index === activeIndex} />
  ), [activeIndex]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={MOCK_PREDICTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        vertical
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
