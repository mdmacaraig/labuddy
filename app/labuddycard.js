import { StatusBar } from 'expo-status-bar';
import { Heading, Text, Box, Progress, ProgressFilledTrack } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

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