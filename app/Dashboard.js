import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Typography,
    Platform,
    Pressable
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
import { sendPushNotification, registerForPushNotificationsAsync} from "./Notifications";

export default function Dashboard() {
    const [metadata, setMetadata] = useState(null);
    const [userData, setUserData] = useState(null); // The actual record in "users" table
    const [loading, setLoading] = useState(true);
    const [networks, setNetworks] = useState([]);
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false); // For adding a labuddy
    const [showModal2, setShowModal2] = useState(false); // For creating a network
    const [showModal5, setShowModal5] = useState(false); // For editing labuddy
    const [selectedLabuddy, setSelectedLabuddy] = useState();
    const ref = useRef(null);

    const [formData, setFormData] = useState({
        wifi_name: "",
        wifi_password: "",
        network_id: "",
        cost: 0,
        perKilo: true,
        maxload: 0,
        labuddy_name: "",
        form_white_max: 0,
        form_color_max: 0
    });

    const handleChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        console.log(formData);
    };

    const handleToggle = (name) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: !prevData[name]
        }));
        console.log(formData);
    };

    async function updateSupabase(labuddyid) {
        console.log(formData.labuddy_name);
        if (formData.labuddy_name != "") {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("users")
                .update({ first_name: formData.labuddy_name })
                .eq("id", labuddyid)
                .select("first_name, id");
        }

        if (formData.form_white_max != "" && formData.form_white_max != 0) {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("baskets")
                .update({ white_weight_limit: formData.form_white_max })
                .eq("id", labuddyid)
                .select("white_weight_limit, id");
        }

        if (formData.form_color_max != "" && formData.form_color_max != 0) {
            const { data: lbuddy, error: lbuddyError } = await supabase
                .from("baskets")
                .update({ color_weight_limit: formData.form_color_max })
                .eq("id", labuddyid)
                .select("white_weight_limit, id");
        }
    }

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

        const subscription = supabase
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

            const subscription3 = supabase
            .channel("public:users")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "users" },
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
            supabase.removeChannel(subscription3);
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
            
            // Getting record from "users" table
            const { data: userData, error: userDataError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user?.user.id)
        
            if (userData) setUserData(userData[0])
            if (userDataError) console.log(userDataError)
        }

    }

    async function fetchNetworks() {
        //get user data
        const { data: userdata, error: userError } =
            await supabase.auth.getUser();
        //get network that user can access
        const { data: network, error: networkError } = await supabase
            .from("network_users")
            .select("networks(*, baskets(*, users(*)))")
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
            <ScrollView style={styles.scroll} p="$5" h="auto">
                <VStack space="md" style={styles.container} w="auto">
                    <HStack w="auto" space="md" style={styles.hstack}>
                        <Box
                            p="$4"
                            borderWidth="$1"
                            borderRadius="$lg"
                            borderColor="$borderLight300"
                            style={{ flex: 1, minWidth: 200 }}
                        >
                            <VStack space="xl" w="auto">
                                <Heading>
                                    {metadata?.user_metadata?.first_name}'s
                                    Labuddies
                                </Heading>
                                <Button
                                    style={styles.button}
                                    onPress={async () => await registerForPushNotificationsAsync(metadata?.id)}
                                    ref={ref}
                                >
                                <ButtonText>[Debug] Ask Notifs Perms</ButtonText>
                                </Button>
                                <Text>{userData?.expo_push_token}</Text>
                                <Button
                                style={styles.button}
                                onPress={async () => await sendPushNotification(userData?.expo_push_token)}
                                ref={ref} 
                                >
                                <ButtonText>[Debug] Send Push Notifs</ButtonText>
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
                                            <Heading size="lg">
                                                Add Labuddy
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
                                                        Add your labuddies here.
                                                        To add a labuddy connect
                                                        to the Access Point of
                                                        the Labuddy you want to
                                                        connect to.
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
                                                        Labuddies to connect to!
                                                        You will see all
                                                        Labuddies connected, and
                                                        everyone else connected
                                                        will see the same.
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
                                {networks.length > 0 ? (
                                    networks.map((network) => (
                                        <View key={network.networks.id}>
                                            <Heading size="sm">
                                                Network: {network.networks.name}
                                            </Heading>
                                            {network.networks.baskets.length >
                                                0 ? (
                                                <VStack space="sm">
                                                    {network.networks.baskets.map(
                                                        (labuddy) => (
                                                            <View
                                                                key={labuddy.id}
                                                            >
                                                                <Pressable
                                                                    onPress={() =>{
                                                                        setShowModal5(
                                                                            true
                                                                        )
                                                                        setSelectedLabuddy(labuddy)}
                                                                    }
                                                                    p="$5"
                                                                    bg="$primary500"
                                                                    $hover-bg="$primary400"
                                                                    style={{
                                                                        zIndex: 0
                                                                    }}
                                                                >
                                                                    <LabuddyCard
                                                                        labuddy={
                                                                            labuddy
                                                                        }
                                                                        cost={
                                                                            formData.cost
                                                                        }
                                                                        perKilo={
                                                                            formData.perKilo
                                                                        }
                                                                        maxload={
                                                                            formData.maxload
                                                                        }
                                                                    />
                                                                </Pressable>
                                                                
                                                            </View>
                                                        )
                                                    )}
                                                </VStack>
                                            ) : (
                                                <VStack space="sm">
                                                    <Text>
                                                        No Labuddies found
                                                    </Text>
                                                </VStack>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <Text>No Networks found</Text>
                                )}
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
                        <Button style={styles.logout} onPress={doLogout}>
                            <ButtonText>Log out</ButtonText>
                        </Button>
                    </Box>
                    {showModal5 && selectedLabuddy && (<Modal
                                                                    isOpen={
                                                                        showModal5
                                                                    }
                                                                    onClose={() => {
                                                                        setShowModal5(
                                                                            false
                                                                        );
                                                                    }}
                                                                    finalFocusRef={
                                                                        ref
                                                                    }
                                                                    style={{
                                                                        zIndex: 1000
                                                                    }}
                                                                >
                                                                    <ModalBackdrop />
                                                                    <ModalContent>
                                                                        <ModalHeader>
                                                                            <Heading size="lg">
                                                                                {selectedLabuddy.users ==
                                                                                    null
                                                                                    ? "Labuddy"
                                                                                    : selectedLabuddy.users.first_name}
                                                                            </Heading>
                                                                            <ModalCloseButton>
                                                                                <Icon
                                                                                    as={
                                                                                        CloseIcon
                                                                                    }
                                                                                />
                                                                            </ModalCloseButton>
                                                                        </ModalHeader>
                                                                        <ModalBody
                                                                            style={{
                                                                                zIndex: 1000
                                                                            }}
                                                                        >
                                                                            <VStack space="md">
                                                                                <Heading size="xs">
                                                                                    Edit
                                                                                    Labuddy
                                                                                    Name
                                                                                </Heading>
                                                                                <Input
                                                                                    variant="outline"
                                                                                    size="md"
                                                                                    isDisabled={
                                                                                        false
                                                                                    }
                                                                                    isInvalid={
                                                                                        false
                                                                                    }
                                                                                    isReadOnly={
                                                                                        false
                                                                                    }
                                                                                >
                                                                                    <InputField
                                                                                        placeholder={
                                                                                            selectedLabuddy ==
                                                                                                null
                                                                                                ? "Labuddy"
                                                                                                : selectedLabuddy.users.first_name
                                                                                        }
                                                                                        onChangeText={(
                                                                                            value
                                                                                        ) =>
                                                                                            handleChange(
                                                                                                "labuddy_name",
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </Input>
                                                                                <Heading size="xs">
                                                                                    Edit
                                                                                    Max
                                                                                    Weight
                                                                                    for
                                                                                    White
                                                                                    Clothes
                                                                                </Heading>
                                                                                <Input
                                                                                    variant="outline"
                                                                                    size="md"
                                                                                    isDisabled={
                                                                                        false
                                                                                    }
                                                                                    isInvalid={
                                                                                        false
                                                                                    }
                                                                                    isReadOnly={
                                                                                        false
                                                                                    }
                                                                                >
                                                                                    <InputField
                                                                                        placeholder={selectedLabuddy.white_weight_limit.toString()}
                                                                                        onChangeText={(
                                                                                            value
                                                                                        ) =>
                                                                                            handleChange(
                                                                                                "form_white_max",
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </Input>
                                                                                <Heading size="xs">
                                                                                    Edit
                                                                                    Max
                                                                                    Weight
                                                                                    for
                                                                                    Colored
                                                                                    Clothes
                                                                                </Heading>
                                                                                <Input
                                                                                    variant="outline"
                                                                                    size="md"
                                                                                    isDisabled={
                                                                                        false
                                                                                    }
                                                                                    isInvalid={
                                                                                        false
                                                                                    }
                                                                                    isReadOnly={
                                                                                        false
                                                                                    }
                                                                                >
                                                                                    <InputField
                                                                                        placeholder={selectedLabuddy.color_weight_limit.toString()}
                                                                                        onChangeText={(
                                                                                            value
                                                                                        ) =>
                                                                                            handleChange(
                                                                                                "form_color_max",
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </Input>

                                                                                <Button
                                                                                    size="sm"
                                                                                    action="positive"
                                                                                    borderWidth="$0"
                                                                                    onPress={() => {
                                                                                        updateSupabase(
                                                                                            selectedLabuddy.id
                                                                                        );
                                                                                        setShowModal5(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <ButtonText>
                                                                                        Save
                                                                                    </ButtonText>
                                                                                </Button>
                                                                            </VStack>
                                                                        </ModalBody>
                                                                        <ModalFooter></ModalFooter>
                                                                    </ModalContent>
                                                                </Modal>)}
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
        flexDirection: "column"
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
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%"
    },
    "@media (max-width: 900px)": {
        hstack: {
            flexDirection: "column" // Stack vertically on smaller screens
        }
    }
});
