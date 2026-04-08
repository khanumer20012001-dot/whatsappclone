import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { 
  StatusBar, 
  SafeAreaView, 
  StyleSheet, 
  Platform, 
  PermissionsAndroid,
  BackHandler,
  Alert 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { changeIcon, getIcon } from 'react-native-change-icon';

const App = () => {

  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ]);
        } catch (err) {
          console.warn('Permission Error:', err);
        }
      }
    };

    requestInitialPermissions();

    // 2-second delay ensures the Native Bridge is ready on Android 11
    const timer = setTimeout(() => {
      handleDynamicIcon();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDynamicIcon = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    
    let targetIcon = 'DefaultAlias'; 

    // Date Logic
    if (month === 6 && (date >= 15 && date <= 18)) {
      targetIcon = 'EidAlias';
    } 
    else if (month === 12 && (date >= 24 && date <= 26)) {
      targetIcon = 'ChristmasAlias';
    }

    try {
      const currentIconPath = await getIcon();
      
      console.log(`Checking Date: ${month}/${date}`);
      console.log(`Current Active: ${currentIconPath}`);
      console.log(`Target: ${targetIcon}`);

      // Check if the current path contains our target string
      if (currentIconPath && !currentIconPath.includes(targetIcon)) {
        console.log(`Android 11: Initiating switch to ${targetIcon}`);
        
        // 1. Execute the native switch
        await changeIcon(targetIcon);
        
        // 2. IMPORTANT: On Android 11, we force the app to exit.
        // This forces the OS to refresh the launcher shortcuts.
        setTimeout(() => {
          BackHandler.exitApp();
        }, 1000);
        
      } else {
        console.log("Status: Icon already matches system date.");
      }
    } catch (error: any) {
      console.error("Native Switch Failed:", error.message);
    }
  };

  return (
    <NavigationContainer>
      <StatusBar 
        backgroundColor="#075E54" 
        barStyle="light-content" 
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
});

export default App;