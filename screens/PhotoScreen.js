import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  Button,
  TouchableOpacity,
  Alert,
} from 'react-native';


import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation } from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const PhotoScreen = () => {
  const navigation = useNavigation();
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '', '']);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setSelectedImage(imageUri);
        addImageToSlot(imageUri); // Add the image URI directly
      }
    });
  };

  const handleCameraLaunch = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
  
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        console.log(imageUri);
        setSelectedImage(imageUri);
        addImageToSlot(imageUri); // Add the image URI directly
      }
    });
  };

  const addImageToSlot = (selectedImage) => {
    // Find the first empty slot (empty string in imageUrls)
    const index = imageUrls.findIndex((url) => url === '');
    if (index !== -1) {
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = selectedImage; // Add the selected image URI
      setImageUrls(updatedUrls); // Update the state with the new image URLs
    } else {
      Alert.alert('Image Slots Full', 'You can only add up to 6 images.');
    }
  };

  

  useEffect(() => {
    // Load saved image URLs
    getRegistrationProgress('Photos').then((progressData) => {
      if (progressData && progressData.imageUrls) {
        setImageUrls(progressData.imageUrls);
      }
    });
  }, []);

  const handleNext = () => {
    // Save image URLs before navigating
    saveRegistrationProgress('Photos', { imageUrls });
    navigation.navigate('PreFinal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="photo-camera-back" size={22} color="black" />
        <Image
          style={styles.icon}
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
          }}
        />
      </View>
      <Text style={styles.title}>Pick your videos and photos</Text>
      <View style={styles.imageGrid}>
        {imageUrls.map((url, index) => (
          <Pressable
            key={index}
            style={[
              styles.imageSlot,
              url ? {} : styles.imageSlotEmpty,
            ]}
            onPress={openImagePicker}>
            {url ? (
              <Image
                source={{ uri: url }}
                style={styles.image}
              />
            ) : (
              <EvilIcons name="image" size={22} color="black" />
            )}
          </Pressable>
        ))}
      </View>
      <View style={styles.buttonContainer}>
      <Button title="Choose from Device" onPress={openImagePicker} />
      <Button title="Open Camera" onPress={handleCameraLaunch} />
      </View>
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.8}
        style={styles.nextButton}>
        <MaterialCommunityIcons
          name="arrow-right-circle"
          size={45}
          color="#581845"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 90,
  },
  icon: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  imageSlot: {
    width: '30%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageSlotEmpty: {
    borderWidth: 2,
    borderColor: '#581845',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  nextButton: {
    marginTop: 30,
    alignSelf: 'flex-end',
  },
});

export default PhotoScreen;
