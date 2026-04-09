import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, Platform, 
  Modal, Dimensions, Alert, AlertButton, PermissionsAndroid 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as ScopedStorage from 'react-native-scoped-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { statusStyles, viewerStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');
const DOWNLOAD_LOG_KEY = '@download_expiry_log';
const STATUS_DIR_KEY = '@whatsapp_status_uri';

const StatusScreen = () => {
  const [myStatuses, setMyStatuses] = useState<any[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAlbumPath = () => `${RNFS.ExternalStorageDirectoryPath}/Pictures/Downloaded Statuses`;

  // 1. Initial Load: Check Permissions and Persisted Folders
  useEffect(() => {
    const initialize = async () => {
      const hasPermission = await requestMediaPermissions();
      if (hasPermission) {
        await fetchWhatsAppStatuses();
        await cleanupExpiredStatuses();
      }
    };
    initialize();
  }, []);

  // 2. Android 13+ Granular Permissions Handler
  const requestMediaPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Number(Platform.Version) >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        return (
          granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      return false;
    }
  };

  // 3. Fetch Statuses with One-Time Folder Selection
  const fetchWhatsAppStatuses = async () => {
    setLoading(true);
    try {
      let savedUri = await AsyncStorage.getItem(STATUS_DIR_KEY);

      if (!savedUri) {
        // If first time, open folder picker
        // Android 11/12 users should navigate to: Android > media > com.whatsapp > WhatsApp > Media > .Statuses
        Alert.alert(
          "Storage Access",
          "Please select the WhatsApp '.Statuses' folder to show recent updates.",
          [{ text: "OK", onPress: async () => triggerFolderPicker() }]
        );
        setLoading(false);
        return;
      }

      await loadFilesFromUri(savedUri);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFolderPicker = async () => {
    try {
      const dir = await ScopedStorage.openDocumentTree(true); // true = persist permission
      if (dir && dir.uri) {
        await AsyncStorage.setItem(STATUS_DIR_KEY, dir.uri);
        await loadFilesFromUri(dir.uri);
      }
    } catch (err) {
      Alert.alert("Permission Denied", "Cannot access statuses without folder permission.");
    }
  };

  const loadFilesFromUri = async (uri: string) => {
    const files = await ScopedStorage.listFiles(uri);
    const albumPath = getAlbumPath();

    const formatted = await Promise.all(
      files
        .filter(f => f.name.endsWith('.mp4') || f.name.endsWith('.jpg'))
        .map(async f => {
          const alreadyDownloaded = await RNFS.exists(`${albumPath}/${f.name}`);
          return {
            id: f.name,
            uri: f.uri,
            name: "WhatsApp Status",
            isVideo: f.name.endsWith('.mp4'),
            downloaded: alreadyDownloaded,
          };
        })
    );
    setFriendStatuses(formatted);
  };

  // 4. Auto-Cleanup (24h Logic)
  const cleanupExpiredStatuses = async () => {
    try {
      const storedData = await AsyncStorage.getItem(DOWNLOAD_LOG_KEY);
      if (!storedData) return;

      let downloadLogs = JSON.parse(storedData);
      const now = Date.now();
      const expirationTime = 24 * 60 * 60 * 1000; 
      const albumPath = getAlbumPath();
      const validLogs = [];

      for (const log of downloadLogs) {
        if (now - log.timestamp > expirationTime) {
          const filePath = `${albumPath}/${log.id}`;
          if (await RNFS.exists(filePath)) {
            await RNFS.unlink(filePath); 
            if (Platform.OS === 'android') RNFS.scanFile(filePath);
          }
        } else {
          validLogs.push(log); 
        }
      }
      await AsyncStorage.setItem(DOWNLOAD_LOG_KEY, JSON.stringify(validLogs));
    } catch (err) {
      console.log("Cleanup Error:", err);
    }
  };

  // 5. Download & Delete Actions
  const handleDownload = async (item: any) => {
    try {
      const albumPath = getAlbumPath();
      if (!(await RNFS.exists(albumPath))) await RNFS.mkdir(albumPath);

      const destPath = `${albumPath}/${item.id}`;
      await RNFS.copyFile(item.uri, destPath);

      const storedData = await AsyncStorage.getItem(DOWNLOAD_LOG_KEY);
      const logs = storedData ? JSON.parse(storedData) : [];
      logs.push({ id: item.id, timestamp: Date.now() });
      await AsyncStorage.setItem(DOWNLOAD_LOG_KEY, JSON.stringify(logs));

      setFriendStatuses(prev =>
        prev.map(s => (s.id === item.id ? { ...s, downloaded: true } : s))
      );

      if (Platform.OS === 'android') RNFS.scanFile(destPath);
      Alert.alert("Saved", "Status will auto-delete in 24 hours.");
    } catch (err) {
      Alert.alert("Error", "Could not save to gallery.");
    }
  };

  const handleDeleteFromMobile = async (item: any) => {
    try {
      const filePath = `${getAlbumPath()}/${item.id}`;
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath);
        if (Platform.OS === 'android') RNFS.scanFile(filePath);
      }

      const storedData = await AsyncStorage.getItem(DOWNLOAD_LOG_KEY);
      if (storedData) {
        let logs = JSON.parse(storedData);
        logs = logs.filter((l: any) => l.id !== item.id);
        await AsyncStorage.setItem(DOWNLOAD_LOG_KEY, JSON.stringify(logs));
      }

      setFriendStatuses(prev =>
        prev.map(s => (s.id === item.id ? { ...s, downloaded: false } : s))
      );
    } catch (err) {
      Alert.alert("Error", "Deletion failed.");
    }
  };

  const openMenu = (item: any, isMine: boolean) => {
    const options: AlertButton[] = [];

    if (isMine) {
      options.push({ 
        text: "Delete Status", 
        style: "destructive", 
        onPress: () => setMyStatuses(prev => prev.filter(s => s.id !== item.id)) 
      });
    } else {
      if (item.downloaded) {
        options.push({ text: "Delete from Mobile", style: "destructive", onPress: () => handleDeleteFromMobile(item) });
      } else {
        options.push({ text: "Download (24h)", onPress: () => handleDownload(item) });
      }
    }

    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Options", "Select an action", options);
  };

  const handleUploadStatus = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
    if (result.didCancel || !result.assets) return;

    const asset = result.assets[0];
    const newStatus = {
      id: String(Date.now()),
      uri: asset.uri ?? '',
      time: 'Just now',
      isVideo: asset.type?.includes('video') ?? false
    };
    setMyStatuses(prev => [newStatus, ...prev]);
  };

  const openStatus = (item: any) => {
    setSelectedStatus(item);
    setIsViewerVisible(true);
  };

  return (
    <View style={statusStyles.container}>
      {/* My Status Section */}
      <TouchableOpacity style={statusStyles.myStatusRow} onPress={handleUploadStatus}>
        <View style={statusStyles.avatarContainer}>
          <View style={[statusStyles.myAvatar, { backgroundColor: '#dfe5e7' }]} />
          <View style={statusStyles.plusIconContainer}><Text style={statusStyles.plusText}>+</Text></View>
        </View>
        <View style={statusStyles.textContainer}>
          <Text style={statusStyles.titleText}>My Status</Text>
          <Text style={statusStyles.subText}>Tap to add update</Text>
        </View>
      </TouchableOpacity>

      {/* My Active Updates */}
      {myStatuses.map((item) => (
        <View key={item.id} style={statusStyles.statusRow}>
          <TouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={() => openStatus(item)}>
            <Image source={{ uri: item.uri }} style={statusStyles.statusThumbnail} />
            <View style={statusStyles.textContainer}>
              <Text style={statusStyles.titleText}>My Update</Text>
              <Text style={statusStyles.subText}>{item.time}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openMenu(item, true)} style={statusStyles.threeDot}>
            <Text style={statusStyles.dotText}>⋮</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={statusStyles.sectionHeader}>Recent Updates</Text>

      {/* Friend Statuses List */}
      <FlatList
        data={friendStatuses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={statusStyles.statusRow}>
            <TouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={() => openStatus(item)}>
              <View style={[statusStyles.statusCircle, { borderColor: item.downloaded ? '#dfe5e7' : '#25D366' }]}>
                <Image source={{ uri: item.uri }} style={statusStyles.statusThumbnail} />
              </View>
              <View style={statusStyles.textContainer}>
                <Text style={statusStyles.titleText}>{item.name}</Text>
                <Text style={statusStyles.subText}>Recently updated</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openMenu(item, false)} style={statusStyles.threeDot}>
              <Text style={statusStyles.dotText}>⋮</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Full Screen Viewer */}
      <Modal visible={isViewerVisible} transparent={false} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={viewerStyles.container}>
          <TouchableOpacity style={viewerStyles.closeButton} onPress={() => setIsViewerVisible(false)}>
            <Text style={viewerStyles.closeText}>✕</Text>
          </TouchableOpacity>
          {selectedStatus?.isVideo ? (
            <Video source={{ uri: selectedStatus.uri }} style={viewerStyles.fullMedia} controls={true} resizeMode="contain" />
          ) : (
            <Image source={{ uri: selectedStatus?.uri }} style={viewerStyles.fullMedia} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default StatusScreen;