import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { Box, GluestackUIProvider, Text, Heading } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { config } from '@gluestack-ui/config';
import { useRouter, Link } from "expo-router";
import LoginForm from './LoginForm';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const [metadata, setMetadata] = useState();
async function getUserMetadata() {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching data:", userError);
    } else {
        // Handle the case where data might be null
        setMetadata(user?.user || []);
        console.log("metadata is ", { metadata });
    }
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    await getUserMetadata();

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        });
    }

    // Get permission
    if (Device.isDevice) {
        const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
            
        // Get expo push token and save to database
        const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({ projectId, })
            ).data;
            console.log(pushTokenString);
            
            const {data, error} = await supabase
            .from("users")
            .update( {expo_push_token: pushTokenString} )
            .where(id === metadata.id)
            
            if (error) console.log(error);
        } catch (e) {
            handleRegistrationError(`${e}`);
        }   
    }
    else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

async function sendPushNotification(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'A Labuddy is full!',
        body: 'One of your Labuddies are full, consider taking them out and soon washing them!',
        //data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
}