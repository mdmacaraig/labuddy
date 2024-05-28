import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Heading, Text, Box, Progress, ProgressFilledTrack, VStack } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import supabase from "../lib/supabase";

export default function LabuddyCard({ labuddy, cost}) {
    const color_weight = labuddy.color_weight
    const white_weight = labuddy.white_weight
    const color_weight_limit = labuddy.color_weight_limit
    const white_weight_limit = labuddy.white_weight_limit
    const is_color_full = labuddy.is_color_full
    const is_white_full = labuddy.is_white_full
    const [labuddyMetadata, setMetadata] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            await getLabuddyMetadata();
        };

        fetchData();

    }, []);

    async function getLabuddyMetadata() {
        const { data: lbuddy, error: lbuddyError } = await supabase
            .from('users')
            .select()
            .eq('id', labuddy.id)

        if (lbuddyError) {
            console.error('Error fetching data:', lbuddyError);
        } else {
            // Handle the case where data might be null
            setMetadata(lbuddy[0] || []);
            console.log('metadata is ', { labuddyMetadata });
        }
    }

    return (
        <GluestackUIProvider config={config}>
            
            <Box w="$72" p="$4" borderWidth="$1" h="$200"
                borderRadius="$lg"
                borderColor="$borderLight300">
                    <VStack space ="xs">
                <Heading>{labuddyMetadata == null ?
                ('Labuddy') 
                : (labuddyMetadata.first_name)}</Heading>

                <Progress value={(white_weight / white_weight_limit) * 100} w='auto' size="md" h={20} bg="#dddddd">
                    <ProgressFilledTrack h={20} bg="#aaaaaa" />
                </Progress>
                <Text size="xs">{white_weight} kg / {white_weight_limit} kg {is_white_full ? (' |  White bin full!') : ('')}</Text>
                <Progress value={(color_weight / color_weight_limit) * 100} w='auto' size="md" h={20} bg="$orange100">
                    <ProgressFilledTrack h={20} bg="$orange500" />
                </Progress>
                <Text size="xs">{color_weight} kg / {color_weight_limit} kg {is_color_full ? (' |  Color bin full!') : ('')}</Text>
                <Text size="xs" color="black" bold='true'>Cost: {cost * (white_weight + color_weight)}</Text>
                </VStack>
            </Box>
            
            <StatusBar style="auto" />
        </GluestackUIProvider >
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
        transform: [{ rotateX: '60deg' }],
    }
});