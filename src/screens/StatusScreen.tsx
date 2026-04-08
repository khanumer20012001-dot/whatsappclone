import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Platform, Modal, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as ScopedStorage from 'react-native-scoped-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { statusStyles, viewerStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');
const DOWNLOAD_LOG_KEY = '@download_expiry_log';

const StatusScreen = () => {
  const [myStatuses, setMyStatuses] = useState<any[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const getAlbumPath = () => `${RNFS.ExternalStorageDirectoryPath}/Pictures/Downloaded Statuses`;

  useEffect(() => {
    fetchWhatsAppStatuses();
    cleanupExpiredStatuses(); 
  }, []);

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
          const exists = await RNFS.exists(filePath);
          if (exists) {
            await RNFS.unlink(filePath); 
            if (Platform.OS === 'android') RNFS.scanFile(filePath);
            console.log(`Deleted expired status: ${log.id}`);
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

  const handleDownload = async (item: any) => {
    try {
      const albumPath = getAlbumPath();
      const folderExists = await RNFS.exists(albumPath);
      if (!folderExists) await RNFS.mkdir(albumPath);

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
      Alert.alert("Success", "Status saved. It will auto-delete in 24 hours.");
    } catch (err) {
      console.log("Download error:", err);
      Alert.alert("Error", "Could not save to gallery.");
    }
  };

  const fetchWhatsAppStatuses = async () => {
    try {
      const dir = await ScopedStorage.openDocumentTree(true);
      if (dir) {
        const files = await ScopedStorage.listFiles(dir.uri);
        const albumPath = getAlbumPath();

        const formatted = await Promise.all(
          files
            .filter(f => f.name.endsWith('.mp4') || f.name.endsWith('.jpg'))
            .map(async f => {
              const alreadyDownloaded = await RNFS.exists(`${albumPath}/${f.name}`);
              return {
                id: f.name,
                uri: f.uri,
                name: "Friend Status",
                isVideo: f.name.endsWith('.mp4'),
                downloaded: alreadyDownloaded,
              };
            })
        );
        setFriendStatuses(formatted);
      }
    } catch (err) {
      console.log("Scoped Storage Error:", err);
    }
  };

  const handleRemove = async (item: any, isMine: boolean) => {
    Alert.alert("Remove", "Delete this status?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (isMine) {
            setMyStatuses(prev => prev.filter(s => s.id !== item.id));
          } else {
            try {
              await ScopedStorage.deleteFile(item.uri);
              setFriendStatuses(prev => prev.filter(s => s.id !== item.id));
            } catch (err) {
              Alert.alert("Error", "Could not delete.");
            }
          }
        }
      }
    ]);
  };

  const openMenu = (item: any, isMine: boolean) => {
    Alert.alert("Options", "Choose an action", [
      { text: "Download (24h Auto-Delete)", onPress: () => handleDownload(item) },
      { text: "Remove", style: "destructive", onPress: () => handleRemove(item, isMine) },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const handleUploadStatus = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
    if (result.assets && result.assets[0]) {
      const newStatus = {
        id: String(Date.now()),
        uri: result.assets[0].uri,
        time: 'Just now',
        isVideo: result.assets[0].type?.includes('video')
      };
      setMyStatuses(prev => [newStatus, ...prev]);
    }
  };

  const openStatus = (item: any) => {
    setSelectedStatus(item);
    setIsViewerVisible(true);
  };

  return (
    <View style={statusStyles.container}>
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

      <FlatList
        data={friendStatuses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={statusStyles.statusRow}>
            <TouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={() => openStatus(item)}>
              <View style={[
                statusStyles.statusCircle, 
                { borderColor: item.downloaded ? '#dfe5e7' : '#25D366' }
              ]}>
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