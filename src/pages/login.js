import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import api from '../services/api';

// All styles from current page
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 20
  },
  logo: {
    width: 163,
    height: 140,
  },
  slogan: {
    marginTop: 10,
    marginBottom: 20,
    fontStyle: 'italic'
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#8492b5",
    borderRadius: 3,
    height: 40,
    width: '90%',
    padding: 10,
  }
});

export default class Login extends Component {
  // Config navbar
  static navigationOptions = {
    title: 'Acessar',
  };

  // Component's states
  state = {
    email: '',
    password: ''
  };

  async onLogin() {
    // Extract credentials from state
    const { email, password } = this.state;

    try {
      // Request token to api
      const response = await api.post('users/login', { email, password });
      
      // Store token from api
      await AsyncStorage.setItem('@JoinWallet:token', response.data.token);
      await AsyncStorage.setItem('@JoinWallet:email', response.data.user.email);
      await AsyncStorage.setItem('@JoinWallet:name', response.data.user.name);

      // Its all good to go, redirect to dashboard
      const resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'Dashboard' }),
        ],
      });
      this.props.navigation.dispatch(resetAction);
    } catch (err) {
      // Output access error
      Alert.alert('Oops...', 'Houve um problema com o login, verifique suas credenciais!');
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <Image 
          style={styles.logo} 
          source={require('../assets/images/logo-join-wallet.png')}
        />
        <Text style={styles.slogan} >
          Porque juntos somos mais fortes.
        </Text>
        <TextInput
          style={styles.input}
          onChangeText={(email) => this.setState({ email })}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
          placeholder="Senha"
          autoCapitalize="none"
        />
        <Button
          color="#4b63a0"
          title="Entrar"
          accessibilityLabel="Entrar"
          onPress={this.onLogin.bind(this)}
        />
      </View>
    );
  }
}