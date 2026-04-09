import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import Icon from 'react-native-vector-icons/Ionicons'; 
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import StatusScreen from '../screens/StatusScreen'; 

export type RootStackParamList = {
  MainTabs: undefined;
  Chat: { contactId: string; name: string }; 
};

export type TabParamList = {
  Chats: undefined;
  Status: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#075E54' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#075E54',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 65, // Increased height for icons + text
          paddingBottom: 8,
          borderTopWidth: 0, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        // --- ICON LOGIC ---
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Status') {
            iconName = focused ? 'ellipse-outline' : 'ellipse-outline'; // WhatsApp uses a ring
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Chats" 
        component={HomeScreen} 
        options={{ title: 'Messages' }} 
      />
      <Tab.Screen 
        name="Status" 
        component={StatusScreen} 
        options={{ title: 'Status' }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: '#075E54' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen as any} 
        options={{
          headerLeftContainerStyle: { paddingLeft: 0 },
          headerLeft: () => null, 
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;