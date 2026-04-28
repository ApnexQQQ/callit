import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Prediction } from '../types';
import { AccuracyBadge } from './AccuracyBadge';

const { height, width } = Dimensions.get('window');

interface VideoCardProps {
  prediction: Prediction;
  isActive: boolean;
}

export function VideoCard({ prediction, isActive }: VideoCardProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActive, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved_true':
        return '#22c55e';
      case 'resolved_false':
        return '#ef4444';
      default:
        return '#eab308';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved_true':
        return '✓ Correct';
      case 'resolved_false':
        return '✗ Wrong';
      default:
        return '⏳ Pending';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={togglePlay} style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: prediction.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isActive && isPlaying}
          isMuted={false}
        />
      </TouchableOpacity>

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>❤️</Text>
            <Text style={styles.actionCount}>{prediction.likes + (isLiked ? 1 : 0)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{prediction.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionCount}>{prediction.shares}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {prediction.user.username[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.username}>@{prediction.user.username}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prediction.status) }]}>
              <Text style={styles.statusText}>{getStatusText(prediction.status)}</Text>
            </View>
          </View>

          <Text style={styles.caption}>{prediction.caption}</Text>
          
          <View style={styles.predictionBox}>
            <Text style={styles.predictionLabel}>🔮 PREDICTION</Text>
            <Text style={styles.predictionText}>{prediction.predictionText}</Text>
            <Text style={styles.outcomeDate}>Outcome: {new Date(prediction.outcomeDate).toLocaleDateString()}</Text>
          </View>

          <View style={styles.accuracyRow}>
            <AccuracyBadge accuracy={prediction.user.accuracy} size="small" />
            <Text style={styles.accuracyLabel}>Predictor Accuracy</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#000',
  },
  videoContainer: {
    width,
    height,
  },
  video: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  rightActions: {
    position: 'absolute',
    right: 10,
    bottom: 150,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    fontSize: 28,
  },
  likedIcon: {
    transform: [{ scale: 1.2 }],
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  bottomInfo: {
    paddingRight: 80,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  predictionBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 12,
  },
  predictionLabel: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  outcomeDate: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyLabel: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 8,
  },
});
