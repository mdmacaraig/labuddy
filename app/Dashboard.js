import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Typography,
    Platform
} from "react-native";
import { useState, useEffect, useRef } from "react";
import {
    KeyboardAvoidingView,
    Heading,
    VStack,
    Text,
    Input,
    InputField,
    Box,
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
    SelectItem,
    ScrollView,
    Switch,
    HStack
} from "@gluestack-ui/themed";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { useNavigation, router } from "expo-router";
import LabuddyCard from "./labuddycard";
import supabase from "../lib/supabase";
import axios from "axios";
import { sendPushNotification, registerForPushNotificationsAsync} from "./notifs.js";

export default function Dashboard() {
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [networks, setNetworks] = useState([]);
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false); // For adding a labuddy
    const [showModal2, setShowModal2] = useState(false); // For creating a network
    const ref = useRef(null);
    const ref2 = useRef(null);

    const [formData, setFormData] = useState({
        wifi_name: "",
        wifi_password: "",
        network_id: "",
        cost: 0,
        perKilo: true,
        maxload: 0
    });

    const handleChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        console.log(formData);
    };

    const handleToggle = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: !value
        }));
        console.log(formData);
    };

    useEffect(() => {
        navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
            console.log("onback");
            // Do your stuff here
            navigation.dispatch(e.data.action);
        });
        const fetchData = async () => {
            await fetchNetworks();
            await getUserMetadata();
            setLoading(false); // Set loading to false after fetching data
        };

        fetchData();

        const subscription1 = supabase
            .channel("public:baskets")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "baskets" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();

        const subscription2 = supabase
            .channel("public:network_users")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "network_users" },
                (payload) => {
                    console.log("Change received!", payload);
                    fetchNetworks();
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(subscription1);
            supabase.removeChannel(subscription2);
        };
    }, []);

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

    async function fetchNetworks() {
        //get user data
        const { data: userdata, error: userError } =
            await supabase.auth.getUser();
        //get network that user can access
        const { data: network, error: networkError } = await supabase
            .from("network_users")
            .select("networks(*, baskets(*))")
            .eq("user_id", userdata?.user?.id);

        setNetworks(network || []);
        console.log("networks:", network);
    }

    const doLogout = async (event) => {
        const { error } = await supabase.auth.signOut();
        router.replace("/Login");
    };

    async function addLabuddy(formData) {
        const url = "http://192.168.4.1/connect"; // corrected the URL scheme
        const wifi_settings = {
            network: formData["network_id"],
            ssid: formData["wifi_name"],
            password: formData["wifi_password"]
        };
        try {
            const response = await axios.post(url, wifi_settings, {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            });
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error("Response error:", error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                console.error("Request error:", error.request);
            } else {
                // Something else happened while setting up the request
                console.error("Error:", error.message);
            }
        }
    }

    async function createNetwork(formData) {
        try {
            const name = formData["network_name"];
            const { data, error } = await supabase
                .from("networks")
                .insert([{ name: name, owner_id: metadata.id }])
                .select();
            const new_network_id = data[0].id;
            console.log(new_network_id);

            const { data: network_user, error: networkUserError } =
                await supabase
                    .from("network_users")
                    .insert([
                        { user_id: metadata.id, network_id: new_network_id }
                    ])
                    .select();

            console.log("network_user", network_user);
        } catch (e) {
            console.log(e);
        }
    }

    if (loading) {
        return (
            <GluestackUIProvider config={config}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </GluestackUIProvider>
        );
    }

    return (
        <GluestackUIProvider config={config}>
            <ScrollView style={styles.scroll} p="$5" h='auto'>
                <VStack space="md" style={styles.container} w="auto">
                    <HStack w="auto" space="md" style={styles.hstack}>
                        <Box
                            p="$4"
                            borderWidth="$1"
                            borderRadius="$lg"
                            borderColor="$borderLight300"
                            style={{ flex: 1, minWidth: 200 }}
                        >
                            <VStack space="xl" w='auto'>
                                <Heading>
                                    {metadata?.user_metadata?.first_name}'s
                                    Labuddies
                                </Heading>
                                <Button
                                    style={styles.button}
                                    onPress={async () => await registerForPushNotificationsAsync()}
                                    ref={ref}
                                >
                                <ButtonText>Debug Ask Notifs Permissions</ButtonText>
                                </Button>
                                <Text>Expo push token: {metadata.user_metadata?.expo_push_token}</Text>
                                <Button
                                style={styles.button}
                                onPress={async () => await sendPushNotification(metadata.user_metadata?.expo_push_token)}
                                ref={ref}
                                >
                                <ButtonText>Debug Send Push Notifications</ButtonText>
                                </Button>
                                <Button
                                    style={styles.button}
                                    onPress={() => setShowModal(true)}
                                    
                                >
                                    <ButtonText>Add Labuddy </ButtonText>
                                    <ButtonIcon as={AddIcon} />
                                </Button>
                                <Modal
                                    isOpen={showModal}
                                    onClose={() => {
                                        setShowModal(false);
                                    }}
                                    finalFocusRef={ref}
                                >
                                    <ModalBackdrop />
                                    <ModalContent>
                                        <ModalHeader>
                                            <Heading size="lg">Add Labuddy</Heading>
                                            <ModalCloseButton>
                                                <Icon as={CloseIcon} />
                                            </ModalCloseButton>
                                        </ModalHeader>
                                        <ModalBody>
                                            <KeyboardAvoidingView
                                                behavior={
                                                    Platform.OS === "ios"
                                                        ? "padding"
                                                        : "height"
                                                }
                                                style={{ flex: 1 }}
                                            >
                                                <VStack space="md">
                                                    <Text>
                                                        Add your labuddies here. To
                                                        add a labuddy connect to the
                                                        Access Point of the Labuddy
                                                        you want to connect to.
                                                    </Text>
                                                    <Input
                                                        variant="outline"
                                                        size="md"
                                                        isDisabled={false}
                                                        isInvalid={false}
                                                        isReadOnly={false}
                                                    >
                                                        <InputField
                                                            placeholder="Wifi Name"
                                                            onChangeText={(
                                                                value
                                                            ) => {
                                                                handleChange(
                                                                    "wifi_name",
                                                                    value
                                                                );
                                                            }}
                                                        />
                                                    </Input>
                                                    <Input
                                                        variant="outline"
                                                        size="md"
                                                        isDisabled={false}
                                                        isInvalid={false}
                                                        isReadOnly={false}
                                                    >
                                                        <InputField
                                                            placeholder="Wifi Password"
                                                            onChangeText={(
                                                                value
                                                            ) => {
                                                                handleChange(
                                                                    "wifi_password",
                                                                    value
                                                                );
                                                            }}
                                                        />
                                                    </Input>

                                                    <Select
                                                        onValueChange={(
                                                            network
                                                        ) => {
                                                            handleChange(
                                                                "network_id",
                                                                network
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            variant="outline"
                                                            size="md"
                                                        >
                                                            <SelectInput placeholder="Select Network" />
                                                            <SelectIcon mr="$3">
                                                                <Icon
                                                                    as={
                                                                        ChevronDownIcon
                                                                    }
                                                                />
                                                            </SelectIcon>
                                                        </SelectTrigger>
                                                        <SelectPortal>
                                                            <SelectBackdrop />
                                                            <SelectContent>
                                                                <SelectDragIndicatorWrapper>
                                                                    <SelectDragIndicator />
                                                                </SelectDragIndicatorWrapper>
                                                                {networks.length >
                                                                    0 ? (
                                                                    networks.map(
                                                                        (
                                                                            network
                                                                        ) => (
                                                                            <SelectItem
                                                                                label={
                                                                                    network
                                                                                        .networks
                                                                                        .name
                                                                                }
                                                                                value={
                                                                                    network
                                                                                        .networks
                                                                                        .id
                                                                                }
                                                                                key={
                                                                                    network
                                                                                        .networks
                                                                                        .id
                                                                                }
                                                                            />
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <SelectItem
                                                                        label="No Networks Found"
                                                                        value="None"
                                                                        isDisabled={
                                                                            true
                                                                        }
                                                                    />
                                                                )}
                                                            </SelectContent>
                                                        </SelectPortal>
                                                    </Select>
                                                </VStack>
                                            </KeyboardAvoidingView>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                action="secondary"
                                                mr="$3"
                                                onPress={() => {
                                                    setShowModal(false);
                                                }}
                                            >
                                                <ButtonText>Cancel</ButtonText>
                                            </Button>
                                            <Button
                                                size="sm"
                                                action="positive"
                                                borderWidth="$0"
                                                onPress={() => {
                                                    addLabuddy(formData);
                                                    setShowModal(false);
                                                }}
                                            >
                                                <ButtonText>Add</ButtonText>
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                                <Button
                                    style={styles.button}
                                    onPress={() => setShowModal2(true)}
                                    
                                >
                                    <ButtonText>Create Network </ButtonText>
                                    <ButtonIcon as={AddIcon} />
                                </Button>
                                <Modal
                                    isOpen={showModal2}
                                    onClose={() => {
                                        setShowModal2(false);
                                        handleChange("network_name", "");
                                    }}
                                    finalFocusRef={ref}
                                >
                                    <ModalBackdrop />
                                    <ModalContent>
                                        <ModalHeader>
                                            <Heading size="lg">
                                                Create Network
                                            </Heading>
                                            <ModalCloseButton>
                                                <Icon as={CloseIcon} />
                                            </ModalCloseButton>
                                        </ModalHeader>
                                        <ModalBody>
                                            <KeyboardAvoidingView
                                                behavior={
                                                    Platform.OS === "ios"
                                                        ? "padding"
                                                        : "height"
                                                }
                                                style={{ flex: 1 }}
                                            >
                                                <VStack space="md">
                                                    <Text>
                                                        Create a network for
                                                        Labuddies to connect to! You
                                                        will see all Labuddies
                                                        connected, and everyone else
                                                        connected will see the same.
                                                    </Text>
                                                    <Input
                                                        variant="outline"
                                                        size="md"
                                                        isDisabled={false}
                                                        isInvalid={false}
                                                        isReadOnly={false}
                                                    >
                                                        <InputField
                                                            placeholder="Network Name"
                                                            onChangeText={(
                                                                value
                                                            ) => {
                                                                handleChange(
                                                                    "network_name",
                                                                    value
                                                                );
                                                            }}
                                                        />
                                                    </Input>
                                                </VStack>
                                            </KeyboardAvoidingView>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                action="secondary"
                                                mr="$3"
                                                onPress={() => {
                                                    setShowModal2(false);
                                                }}
                                            >
                                                <ButtonText>Cancel</ButtonText>
                                            </Button>
                                            <Button
                                                size="sm"
                                                action="positive"
                                                borderWidth="$0"
                                                onPress={() => {
                                                    createNetwork(formData);
                                                    setShowModal2(false);
                                                }}
                                            >
                                                <ButtonText>Add</ButtonText>
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                                <HStack space="md">
                                    <Text size="sm">Cost per kilo</Text>
                                    <Switch
                                        isDisabled={false}
                                        isInvalid={false}
                                        onValueChange={(value) => {
                                            handleToggle("perKilo", value);
                                        }}
                                    />
                                    <Text size="sm">Cost per max load</Text>
                                </HStack>
                                <Input
                                    variant="outline"
                                    size="md"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                >
                                    <InputField
                                        placeholder={
                                            formData.perKilo
                                                ? "Cost per kg"
                                                : "Cost per max load"
                                        }
                                        onChangeText={(value) =>
                                            handleChange("cost", value)
                                        }
                                    />
                                </Input>
                                <Input
                                    variant="outline"
                                    size="md"
                                    isDisabled={formData.perKilo}
                                    isInvalid={false}
                                    isReadOnly={false}
                                >
                                    <InputField
                                        placeholder={"Max load in kg"}
                                        onChangeText={(value) =>
                                            handleChange("maxload", value)
                                        }
                                    />
                                </Input>

                            </VStack>
                        </Box>
                        <Box
                            p="$4"
                            borderWidth="$1"
                            borderRadius="$lg"
                            borderColor="$borderLight300"
                            style={{ flex: 2, minWidth: 200 }}
                        >
                            <VStack space="xl">

                                {networks.length > 0 ? (networks.map((network) => (
                                    <View key={network.networks.id}>
                                        <Heading size="sm">Network: {network.networks.name}</Heading>
                                        {network.networks.baskets.length > 0 ? (
                                            <VStack space="sm">
                                                {network.networks.baskets.map(
                                                    (labuddy) => (
                                                        <LabuddyCard
                                                            labuddy={labuddy}
                                                            cost={formData.cost}
                                                            perKilo={formData.perKilo}
                                                            maxload={formData.maxload}
                                                            key={labuddy.id}
                                                        />
                                                    )
                                                )}
                                            </VStack>) : (
                                            <VStack space="sm"><Text>No Labuddies found</Text></VStack>
                                        )}
                                    </View>
                                ))) : (<Text>No Networks found</Text>)}
                            </VStack>
                        </Box>

                    </HStack>
                    <Box
                            w="100%"
                            p="$4"
                            borderWidth="$1"
                            borderRadius="$lg"
                            borderColor="$borderLight300"
                            style={{ flex: 2, minWidth: 200 }}
                        >
                    <Button
                        style={styles.logout}
                        onPress={doLogout}
                    >
                        <ButtonText>Log out</ButtonText>
                    </Button>
                    </Box>
                    <StatusBar style="auto" />
                </VStack>
            </ScrollView>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'column'
    },
    button: {
        backgroundColor: "#028391"
    },
    logout: {
        backgroundColor: "#C70039"
    },
    scroll: {
        flex: 1,
        backgroundColor: "#fff"
    },
    hstack: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    '@media (max-width: 900px)': {
        hstack: {
            flexDirection: 'column', // Stack vertically on smaller screens
        },
    },
});
