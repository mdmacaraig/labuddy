import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Heading, FormControl, VStack, Text, Input, InputField, InputSlot, InputIcon, Button, ButtonText, Box, Progress, ProgressFilledTrack } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { useRouter } from "expo-router";

export default function LabuddyCard() {

    return (
        <GluestackUIProvider config={config}>
            <Box w="$72" p="$4" borderWidth="$1"
                borderRadius="$lg"
                borderColor="$borderLight300">
                <Heading>Labuddy Name</Heading>
                <Text>Labuddy Deets</Text>
                <Progress value={20} w={200} size="md" h={20} bg="$gray100">
                    <ProgressFilledTrack h={20} bg="$gray500" />
                </Progress>
                <Progress value={50} w={200} size="md" h={20} bg="$lime100">
                    <ProgressFilledTrack h={20} bg="$lime500" />
                </Progress>
            </Box>
            <StatusBar style="auto" />
        </GluestackUIProvider>
    );
}