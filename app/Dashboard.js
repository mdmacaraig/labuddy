import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Heading, FormControl, VStack, Text, Input, InputField, InputSlot, InputIcon, Button, ButtonText, Box } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { router } from 'expo-router';
import LabuddyCard from './labuddycard';

export default function Dashboard() {
  return (
    <GluestackUIProvider config={config}>
      <View style={styles.container}>
        <Box w="$200" p="$4" borderWidth="$1"
            borderRadius="$lg"
            borderColor="$borderLight300">
          <VStack space="xl">
            <Heading>My Labuddies</Heading>
            <LabuddyCard></LabuddyCard>
            <LabuddyCard></LabuddyCard>
            <LabuddyCard></LabuddyCard>
          </VStack>
        </Box>
        <StatusBar style="auto" />
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
