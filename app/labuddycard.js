import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Heading, Text, Box, Progress, ProgressFilledTrack } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

export default function LabuddyCard({labuddy}) {
    const color_weight = labuddy.color_weight
    const white_weight = labuddy.white_weight
    const color_weight_limit = labuddy.color_weight_limit
    const white_weight_limit = labuddy.white_weight_limit
    return (
        <GluestackUIProvider config={config}>
            <Box w="$72" p="$4" borderWidth="$1" h="$200"
                borderRadius="$lg"
                borderColor="$borderLight300">
                <Heading>Labuddy Name</Heading>
                <Text></Text>
                <Progress value={(white_weight/white_weight_limit) * 100} w={200} size="md" h={20} bg="#dddddd">
                    <ProgressFilledTrack h={20} bg="#aaaaaa" />
                </Progress>
                <Progress value={(color_weight/color_weight_limit) * 100} w={200} size="md" h={20} bg="$orange100">
                    <ProgressFilledTrack h={20} bg="$orange500" />
                </Progress>
            </Box>
            <StatusBar style="auto" />
        </GluestackUIProvider>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 8,
        borderRadius: 4,
    },
    invalid: {
        borderColor: 'red',
    },
    button: {
        backgroundColor: '#028391'
    },
    progbar: {
        transform: [{rotateX: '60deg'}],
    }
});