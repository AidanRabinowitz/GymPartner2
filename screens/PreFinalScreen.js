import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import colorTheme from '../colorTheme';

const PreFinalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState();
  useEffect(() => {
    getAllUserData();
  }, []);

  const { token, isLoading,setToken } = useContext(AuthContext);

  console.log(token)

  useEffect(() => {
    // Check if the token is set and not in loading state
    if (token) {
      // Navigate to the main screen
      navigation.navigate('MainStack', { screen: 'Main' });
    }
  }, [token, navigation]);
  const getAllUserData = async () => {
    try {
      // Define an array to store data for each screen
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Photos',
        'Prompts',
      ]; // Add more screens as needed

      // Define an object to store user data
      let userData = {};

      // Retrieve data for each screen and add it to the user data object
      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          userData = {...userData, ...screenData}; // Merge screen data into user data
        }
      }

      // Return the combined user data
      setUserData(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  };
  const clearAllScreenData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Photos',
      ];
      // Loop through each screen and remove its data from AsyncStorage
      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }
      console.log('All screen data cleared successfully');
    } catch (error) {
      console.error('Error clearing screen data:', error);
    }
  };
  const registerUser = async () => {
    try {
  
      // Send POST request to register the user
      const response = await axios.post('http://192.168.0.12:3000/register', userData);
      
      console.log(response); // Log the response to check the output
      const token = response.data.token; // Extract the token from the response
      
      if (token) {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem('token', token);
        
        // Set token in state (for further use in your app)
        setToken(token);
        
        // Clear screen data (if needed)
        clearAllScreenData();
      } else {
        console.error("Token not found in response");
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };
  
  
  console.log('user data', userData);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: 80}}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            color: 'black',
          }}>
          All set to register
        </Text>
        <Text
          style={{
            fontSize: 33,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            marginRight: 10,
            marginTop: 10,
            color: 'gray',
          }}>
          Setting up your profile for you
        </Text>
      </View>

      <View>
        <LottieView
          source={require('../assets/lifter.mp4.lottie.json')}
          style={{
            height: 260,
            width: 300,
            alignSelf: 'center',
            marginTop: 40,
            justifyContent: 'center',
          }}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

      <Pressable
        onPress={registerUser}
        style={{backgroundColor: '#900C3F', padding: 15, marginTop: 'auto'}}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: 15,
          }}>
          Finish registering
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({});
