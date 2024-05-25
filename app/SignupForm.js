import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import supabase from "../lib/supabase";
import { useRouter } from "expo-router";

const SignupForm = () => {
    const navigation = useNavigation();
    const [isTouchedEmail, setIsTouchedEmail] = useState(false);
    const [isTouchedContactNumber, setIsTouchedContactNumber] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(undefined);
    const [isContactNumberValid, setIsContactNumberValid] = useState(undefined);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        contact_number: "",
    });

    const validateContactNumberFormat = (contact_number) => {
        return contact_number.match(/^[0-9]{11}$/);
    };

    const validateContactNumber = (value) => {
        setIsContactNumberValid(undefined);
        if (value === '') return;
        validateContactNumberFormat(value) ? setIsContactNumberValid(true) : setIsContactNumberValid(false);
    };

    const validateEmailFormat = (email) => {
        return email.match(/^[^@]+@[^@]+\.[^@]+$/);
    };

    const validateEmail = (value) => {
        setIsEmailValid(undefined);
        if (value === '') return;
        validateEmailFormat(value) ? setIsEmailValid(true) : setIsEmailValid(false);
    };

    const handleChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const router = useRouter()

    const doSignUp = async (event) => {
        if (isEmailValid && isContactNumberValid){
        event.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    contact_number: formData.contact_number,
                    display_name: formData.first_name + " " + formData.last_name,
                    phone: formData.contact_number,
                }
            }
        });

        if (error) {
            console.log(error)
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Account successfully created!");
            // IMPORTANT NOTE: Remove this when implementing signup with email verification!
            await supabase.auth.signOut();
            router.push('/Login');
        }
    }
    else{
        Alert.alert("Error", "Invalid email/number");
    }
    };

    return (
        <View>
                
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={formData.first_name}
                    onChangeText={(value) => handleChange('first_name', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChangeText={(value) => handleChange('last_name', value)}
                />
                <TextInput
                    style={[styles.input, isEmailValid === false && styles.invalid, isTouchedEmail && styles.touched]}
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(value) => {
                        handleChange('email', value);
                        validateEmail(value);
                    }}
                    
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry
                />
                <TextInput
                    style={[styles.input, isContactNumberValid === false && styles.invalid, isTouchedContactNumber && styles.touched]}
                    placeholder="Contact Number"
                    value={formData.student_number}
                    onChangeText={(value) => {
                        handleChange('contact_number', value);
                        validateContactNumber(value);
                    }}
                    
                    keyboardType="numeric"
                    
                />
            <Button
                title="SUBMIT"
                variant="outlined"
                onPress={doSignUp}
                style={styles.button}
            ><ButtonText>SUBMIT</ButtonText>
            </Button>
                
            </View>
        );
    };
    
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
        touched: {
            borderColor: 'blue',
        },
        button: {
            backgroundColor: '#028391'
        }
    });
    
    export default SignupForm;
    
