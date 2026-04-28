import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { CameraRecorder } from '../components/CameraRecorder';
import { Button } from '../components/Button';

const CATEGORIES = [
  'Sports',
  'Crypto',
  'Stocks',
  'Tech',
  'Politics',
  'Entertainment',
  'Weather',
  'Other',
];

export function CreatePredictionScreen() {
  const navigation = useNavigation();
  const [showCamera, setShowCamera] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [prediction, setPrediction] = useState('');
  const [category, setCategory] = useState('');
  const [outcomeDate, setOutcomeDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVideoRecorded = useCallback((uri: string) => {
    setVideoUri(uri);
    setShowCamera(false);
  }, []);

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!videoUri) {
      Alert.alert('Error', 'Please record or select a video');
      return false;
    }
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return false;
    }
    if (!prediction.trim()) {
      Alert.alert('Error', 'Please enter your prediction');
      return false;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!outcomeDate) {
      Alert.alert('Error', 'Please select an outcome date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    
    // Mock submission - replace with actual API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        'Your prediction has been posted!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  if (showCamera) {
    return (
      <CameraRecorder
        onVideoRecorded={handleVideoRecorded}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Prediction</Text>

      {/* Video Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📹 Video</Text>
        {videoUri ? (
          <View style={styles.videoPreview}>
            <TouchableOpacity
              style={styles.changeVideoButton}
              onPress={() => setVideoUri(null)}
            >
              <Text style={styles.changeVideoText}>Change Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.videoOptions}>
            <TouchableOpacity
              style={styles.videoOption}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.videoOptionIcon}>📷</Text>
              <Text style={styles.videoOptionText}>Record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.videoOption}
              onPress={handlePickVideo}
            >
              <Text style={styles.videoOptionIcon}>🎬</Text>
              <Text style={styles.videoOptionText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Caption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Caption</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's your take?"
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />
        <Text style={styles.charCount}>{caption.length}/200</Text>
      </View>

      {/* Prediction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔮 Your Prediction</Text>
        <TextInput
          style={[styles.textInput, styles.predictionInput]}
          placeholder="What do you predict will happen?"
          placeholderTextColor="#666"
          value={prediction}
          onChangeText={setPrediction}
          multiline
          maxLength={300}
        />
        <Text style={styles.charCount}>{prediction.length}/300</Text>
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Outcome Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Outcome Date</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666"
          value={outcomeDate}
          onChangeText={setOutcomeDate}
        />
        <Text style={styles.hint}>When will we know if your prediction is correct?</Text>
      </View>

      {/* Submit */}
      <Button
        title="Post Prediction"
        onPress={handleSubmit}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  videoOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  videoOption: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  videoOptionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  videoOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoPreview: {
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeVideoButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  changeVideoText: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
  },
  predictionInput: {
    minHeight: 100,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
});
