import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
} from 'react-native';
import React ,{useEffect} from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios"
import colorTheme from '../colorTheme';

const BasicInfo = () => {
    const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: 80}}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
          }}>
          You don't have to gym alone.
        </Text>
        <Text
          style={{
            fontSize: 33,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            marginTop: 10,
          }}>
          Find a gym partner in a safe environment.
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
      onPress={() => navigation.navigate("Name")}
        style={{backgroundColor: colorTheme.primary, padding: 15, marginTop: 'auto'}}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: 15,
          }}>
          Enter basic Info
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({});
