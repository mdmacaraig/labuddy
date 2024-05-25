import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { Box, GluestackUIProvider, Text, Heading } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { config } from '@gluestack-ui/config';
import { useRouter, Link } from "expo-router";
import LoginForm from './LoginForm';

export default function Login() {
    return (
        
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.container}>
            <Heading size="xl">Log in</Heading>
            <Box w='$72'>
              <LoginForm></LoginForm>
            </Box>
            <StatusBar style="auto" />
          </View>
        </KeyboardAvoidingView>
      
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: 'auto',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });