import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { Box, GluestackUIProvider, Text, Heading } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { config } from '@gluestack-ui/config';
import { useRouter, Link } from "expo-router";
import SignupForm from './SignupForm';

export default function App() {
  const router = useRouter()
  return (
    <GluestackUIProvider config={config}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <Heading size="xl">Sign up to Labuddy</Heading>
          <Box w='$72'>
            <SignupForm></SignupForm>
            <Text>Already have an account?</Text>
            <Link href="/Login" asChild>
              <Pressable>
                <Text color="#028391">Login</Text>
              </Pressable>
            </Link>
          </Box>


          <StatusBar style="auto" />
        </View>
      </KeyboardAvoidingView>
    </GluestackUIProvider>
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
