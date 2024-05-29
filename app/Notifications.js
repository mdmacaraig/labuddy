import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { Box, GluestackUIProvider, Text, Heading } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { config } from '@gluestack-ui/config';
import { useRouter, Link } from "expo-router";
import LoginForm from './LoginForm';
import supabase from "../lib/supabase";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync(userID) {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        // Get notification permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
            
        // Get expo push token and save to database (if not already)
        const projectID = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
        if (!projectID) {
            handleRegistrationError('Project ID not found');
            return;
        }
        try {
            const pushTokenString = 
                (await Notifications.getExpoPushTokenAsync({ projectId: projectID, })).data;
                //{ projectId: projectID, }

            if (pushTokenString) {
                // Update database table
                const {data, error} = await supabase
                .from("users")
                .update( {expo_push_token: pushTokenString} )
                .eq("id", userID)
                
                if (error) {
                    console.log(error);
                    return;
                }
            } else {
                alert("no expo push token");
            }
            
        } catch (e) {
            handleRegistrationError(`${e}`);
            return;
        }   
    }
    else {
        handleRegistrationError('Must use physical device for push notifications');
        return;
    }
}

export async function sendPushNotification(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'A Labuddy is full!',
        body: 'One of your Labuddies are full, consider taking them out and soon washing them!',
    };

    try {
        const {data: response, error: err} = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (response) console.log(response);
        if (err) console.log(err);
    }
    catch (e) {
        console.log(e)
    }
}

export default function LabuddyNotifs() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {    
        // This listener is fired whenever a notification is received while the app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });
    
        // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });
    
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
      }, []);
      
    return;
}
