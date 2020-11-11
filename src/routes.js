import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Login from './pages/login';
import Dashboard from './pages/dashboard';

const NavStack = createStackNavigator({
  Login,
  Dashboard
}, {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: "#4b63a0"
    },
    headerTintColor: "#FFF"
  }
});

const App = createAppContainer(NavStack);

export default App;