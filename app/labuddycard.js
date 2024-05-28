import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Heading, Text, Box, Progress, ProgressFilledTrack,
    VStack,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonIcon,
    AddIcon,
    CloseIcon,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalBody,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    Icon,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    ChevronDownIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem} from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import supabase from "../lib/supabase";

export default function LabuddyCard({ labuddy }) {
    const color_weight = labuddy.color_weight
    const white_weight = labuddy.white_weight
    const color_weight_limit = labuddy.color_weight_limit
    const white_weight_limit = labuddy.white_weight_limit
    const is_color_full = labuddy.is_color_full
    const is_white_full = labuddy.is_white_full
    const [labuddyMetadata, setMetadata] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const ref = useRef(null);

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
            <Pressable
                    onPress={() => setShowModal(true)}
                    p="$5"
                    bg="$primary500"
                    $hover-bg="$primary400"
                    ref={ref}
                >
                <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
        }}
        finalFocusRef={ref}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{labuddyMetadata == null ?
                ('Labuddy') 
                : (labuddyMetadata.first_name)}</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Elevate user interactions with our versatile modals. Seamlessly
              integrate notifications, forms, and media displays. Make an impact
              effortlessly.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                setShowModal(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              action="positive"
              borderWidth="$0"
              onPress={() => {
                setShowModal(false)
              }}
            >
              <ButtonText>Explore</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
            <Box w="$72" p="$4" borderWidth="$1" h="$200"
                borderRadius="$lg"
                borderColor="$borderLight300">
                <Heading>{labuddyMetadata == null ?
                ('Labuddy') 
                : (labuddyMetadata.first_name)}</Heading>

                <Progress value={(white_weight / white_weight_limit) * 100} w={200} size="md" h={20} bg="#dddddd">
                    <ProgressFilledTrack h={20} bg="#aaaaaa" />
                </Progress>
                <Text>{is_white_full ? ('White bin full!') : ('')}</Text>
                <Progress value={(color_weight / color_weight_limit) * 100} w={200} size="md" h={20} bg="$orange100">
                    <ProgressFilledTrack h={20} bg="$orange500" />
                </Progress>
                <Text>{is_color_full ? ('Color bin full!') : ('')}</Text>
            </Box>
            <StatusBar style="auto" />
            </Pressable>
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
        transform: [{ rotateX: '60deg' }],
    }
});