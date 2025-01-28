import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GetLocation from 'react-native-get-location';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveRegistrationProgress } from '../registrationUtils';

const LocationScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch location using the GetLocation API
  const getLocation = () => {
    setIsFetching(true);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then((location) => {
        setLocation(location);
        setIsFetching(false);
      })
      .catch((error) => {
        console.warn(error.message);
        setIsFetching(false);
      });
  };

  // Navigate to the next screen
  const handleNext = () => {
    if (location) {
      const formattedLocation = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };
  
      console.log(`Progress saved for screen: ${formattedLocation.location.latitude},${formattedLocation.location.longitude}`);
      
      saveRegistrationProgress('Location', formattedLocation);
      console.log(formattedLocation);
  
      navigation.navigate('Gender'); // Replace 'Gender' with the next screen's name
    } else {
      console.warn('Please get your location first!');
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Current Location:</Text>
        {location ? (
          <Text style={styles.coordinates}>
            Latitude: {location.latitude} {'\n'}
            Longitude: {location.longitude}
          </Text>
        ) : (
          <Text style={styles.placeholder}>Location not available</Text>
        )}

        <TouchableOpacity
          onPress={getLocation}
          style={styles.button}
          disabled={isFetching}
        >
          <Text style={styles.buttonText}>
            {isFetching ? 'Fetching...' : 'Get My Location'}
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <TouchableOpacity onPress={handleNext}>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={45}
              color="#581845"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    marginTop: 90,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'black',
  },
  coordinates: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'black',
  },
  placeholder: {
    fontSize: 15,
    marginTop: 15,
    color: 'gray',
  },
  button: {
    backgroundColor: '#581845',
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationScreen;
