import * as React from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: { contactId: string; name: string }; 
};

// Explicit type for the Chat screen route
type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#075E54' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'WhatsApp' }} 
      />
      
      <Stack.Screen 
        name="Chat" 
        // Cast as 'any' to resolve the internal prop mismatch shown in your screenshot
        component={ChatScreen as any} 
        options={({ route }: ChatScreenProps) => ({ 
          title: route.params?.name || 'Chat' 
        })} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;