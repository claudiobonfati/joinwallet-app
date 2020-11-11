import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import api from '../services/api';
import '../helpers/async-foreach';

const styles = StyleSheet.create({ 
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#313641",
    fontFamily: 'Helvetica',
    margin: 15,
    marginBottom: 0,
  },
  listContainer: {
    padding: 15
  },
  productBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#efefef",
    marginBottom: 5,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  productInfo: {
   flex: 1
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  productPrice: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  productButton: {
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#4b63a0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff'
  },
  productButtonText:{
    color: '#fff',
    textAlign: 'center',
    paddingLeft: 5,
    paddingRight: 5
  },
  profileContainer: {
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

class Products extends Component {
  state = {
    products: null
  }

  // When its ready, get products from api and show in screen
  async componentDidMount() {
    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();

    try {
      const categories = await api.get('product-cats', { headers: { Authorization: token }});
    
      await categories.data.forEachAsync(cat => {
        api.post('products/category/'+cat._id, null, { headers: { Authorization: token }})
        .then((response) => {
          cat.products = response.data;
        }).catch((err) => {
          Alert.alert('Oops..', 'Ocorreu um erro ao carregar os produtos, por favor tente novamente!');
        });
      });
      
      setTimeout(() => {
        this.setState({ products: categories.data });
      }, 1000);
    } catch (e) {
      Alert.alert('Oops..', 'Ocorreu um erro ao carregar os produtos, por favor tente novamente!');
    }
  }

  // Go back to login page
  returnToLogin = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Login' }),
      ],
    });

    this.props.navigation.dispatch(resetAction);
  }

  // Insert product to user's cart
  async addToCart(prod) {
    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();

    try {
      await api.post('cart/item', { product: prod._id, amount: 1 }, { headers: { Authorization: token } });

      Alert.alert('Meu Carrinho', 'Produto adicionado!');
    } catch (e) {
      Alert.alert('Oops..', 'Ocorreu um erro, por favor tente novamente!');
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.state.products ? this.state.products.map(cat => (
          <View key={cat._id}>
            <Text style={styles.title}>
              { cat.title? cat.title : " " }
            </Text>  
            <View style={styles.listContainer}>
              {cat.products ? cat.products.map(product => (
                <View 
                  style={styles.productBox} 
                  key={product._id}
                >
                  <View>
                    <Image style={styles.productImage} source={{uri: product.image}} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{product.name}</Text>
                    <Text style={styles.productPrice}>R$ {product.price}</Text>
                    <TouchableOpacity
                      style={styles.productButton}
                      onPress={() => { this.addToCart(product) }}
                      underlayColor='#fff'
                    >
                      <Text style={styles.productButtonText}>Adicionar ao carrinho</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : null}
            </View>
          </View>
        )) : null}
      </ScrollView>
    );
  }
}

class Cart extends Component {
  state = {
    cart: null
  }

  // Update cart items every time user focus in Cart page
  onFocusFunction = async () => {
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    
    try {
      const prods = await api.get('cart', { headers: { Authorization: token }});
          
      setTimeout(() => {
        this.setState({ cart: prods.data });
      }, 500);
    } catch (err) {
      Alert.alert('Oops..', 'Ocorreu um erro ao carregar os produtos, por favor tente novamente! ' + err);
    }  
  }

  // When its ready, get cart items
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.onFocusFunction();
    });

    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();

    try {
      const prods = await api.get('cart', { headers: { Authorization: token }});
          
      setTimeout(() => {
        this.setState({ cart: prods.data });
      }, 500);
    } catch (e) {
      Alert.alert('Oops..', 'Ocorreu um erro ao carregar os produtos, por favor tente novamente!');
    }  
  }

  // Remove event listener for update items
  componentWillUnmount() {
    this._unsubscribe();
  }

  // Return to login page
  returnToLogin = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Login' }),
      ],
    });

    this.props.navigation.dispatch(resetAction);
  }

  // Remove item from user's cart
  async removeFromCart(item) {
    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();

    try {
      await api.delete(`cart/item/${item._id}`, { headers: { Authorization: token } });

      try {
        const prods = await api.get('cart', { headers: { Authorization: token }});
            
        this.setState({ cart: prods.data });
      } catch (e) {
        Alert.alert('Oops..', 'Ocorreu um erro ao carregar os produtos, por favor tente novamente!');
      }  

      Alert.alert('Meu Carrinho', 'Produto removido!');
    } catch (err) {
      Alert.alert('Oops..', 'Ocorreu um erro, por favor tente novamente! ' + err);
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>
          {this.state.cart ? this.state.cart.items.map(item => (
            <View 
              style={styles.productBox} 
              key={item._id}
            >
              <View>
                <Image style={styles.productImage} source={{uri: item.product.image}} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{item.product.name}</Text>
                <Text style={styles.productPrice}>R$ {item.product.price}</Text>
                <TouchableOpacity
                  style={styles.productButton}
                  onPress={() => { this.removeFromCart(item) }}
                  underlayColor='#fff'
                >
                  <Text style={styles.productButtonText}>Remover do carrinho</Text>
                </TouchableOpacity>
              </View>
            </View>
          )) : null}
        </View>
      </ScrollView>
    );
  }
}

class Profile extends Component {
  state = {
    name: null,
    email: null
  }

  // When its ready, get user's data from AsyncStorage
  async componentDidMount() {
    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();
    
    const name = await AsyncStorage.getItem('@JoinWallet:name');
    const email = await AsyncStorage.getItem('@JoinWallet:email');

    this.setState({ name: name });
    this.setState({ email: email });
  }

  // Remove user's data from as AsyncStorage and redirect to login page
  logout = async () => {
    await AsyncStorage.removeItem('@JoinWallet:token');
    await AsyncStorage.removeItem('@JoinWallet:name');
    await AsyncStorage.removeItem('@JoinWallet:email');

    this.returnToLogin();
  }

  // Return to login page
  returnToLogin = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Login' }),
      ],
    });

    this.props.navigation.dispatch(resetAction);
  }

  updateProfile = async () => {
    // Check auth token
    const token = await AsyncStorage.getItem('@JoinWallet:token');
    if (!token)
      this.returnToLogin();

    const name = this.state.name;
    const email = await AsyncStorage.getItem('@JoinWallet:email');

    try {
      await api.patch(`/users/me`, { name, email }, { headers: { Authorization: token } });
      await AsyncStorage.setItem('@JoinWallet:name', name);

      Alert.alert('Meu Perfil', 'Perfil atualizado com sucesso!');
    } catch (err) {
      Alert.alert('Oops..', 'Ocorreu um erro ao atualizar seu perfil. Por favor, tente novamente!');
    }
  }

  render() {
    return (
      <View style={styles.profileContainer} >
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
          value={this.state.email}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          onChangeText={(name) => this.setState({ name })}
          value={this.state.name}
          placeholder="Nome"
        />
        <Button
          color="#4b63a0"
          title="Atualizar"
          accessibilityLabel="Atualizar"
          onPress={this.updateProfile.bind(this)}
        />
        <Button
          color="#4b63a0"
          title="Sair"
          accessibilityLabel="Sair"
          onPress={this.logout.bind(this)}
        />
      </View>
    );
  }
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Produtos') {
              return <Image
                source={ require('../assets/images/icons/shopping-bag.png') }
                style={{
                  width: 25,
                  height: 25,
                  resizeMode: 'contain',
                }}
              />
            } else if (route.name === 'Carrinho') {
              return <Image
                source={ require('../assets/images/icons/shopping-cart.png') }
                style={{
                  width: 25,
                  height: 25,
                  resizeMode: 'contain',
                }}
              />
            } else if (route.name === 'Perfil') {
              return <Image
                source={ require('../assets/images/icons/user.png') }
                style={{
                  width: 25,
                  height: 25,
                  resizeMode: 'contain',
                }}
              />
            }
            return null;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#4b63a0',
          inactiveTintColor: '#777',
        }}
      >
        <Tab.Screen name="Produtos" component={Products} />
        <Tab.Screen name="Carrinho" component={Cart} />
        <Tab.Screen name="Perfil" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}