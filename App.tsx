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
    
    // found at the top of your AndroidManifest or build.gradle
    const pkg = "com.whatsappclone"; 
    
    let targetIcon = 'DefaultAlias'; 

    if (month === 6 && (date >= 15 && date <= 18)) {
      targetIcon = 'EidAlias';
    } else if (month === 12 && (date >= 24 && date <= 26)) {
      targetIcon = 'ChristmasAlias';
    }

    try {
      const currentIconPath = await getIcon();
      
      // Use the full path for the switch
      const fullTarget = `${pkg}.${targetIcon}`;

      if (currentIconPath && !currentIconPath.includes(targetIcon)) {
        console.log(`Switching to: ${fullTarget}`);
        await changeIcon(targetIcon); 
        
        setTimeout(() => {
          BackHandler.exitApp();
        }, 1000);
      }
    } catch (error: any) {
      console.warn("Native Switch Warning:", error.message);
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