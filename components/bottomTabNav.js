import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import SearchScreen from '../screens/search';
import TransactionScreen from '../screens/transaction';

const Tab = createMaterialBottomTabNavigator();

export default class BottomTabNav extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Search"
          inactiveColor="tomato"
          activeColor="green"
          barStyle={{ backgroundColor: '#84a98c' }}>
          <Tab.Screen name="Transaction" component={TransactionScreen} />
          <Tab.Screen name="Search" component={SearchScreen} />
          
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
