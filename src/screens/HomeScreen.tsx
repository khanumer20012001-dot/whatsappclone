import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  TextInput, 
  Text, 
  SafeAreaView 
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { getItem } from '../data/storage';  
import { Contact } from '../types/navigation';
import ContactItem from '../components/ContactItem';
import { homeStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  // Load data from AsyncStorage
  const loadData = async () => {
    try {
      const data = await getItem(); 
      // Sort contacts so the one with the newest message is at the top
      const sortedData = [...data].sort((a, b) => {
        if (!a.messages.length) return 1;
        if (!b.messages.length) return -1;
        return b.messages[b.messages.length - 1].id > a.messages[a.messages.length - 1].id ? 1 : -1;
      });

      setContacts(sortedData);
      setFilteredContacts(sortedData);
    } catch (error) {
      console.error("Home Screen Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // refresh the list every time the user navigates back to Home
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  if (loading) {
    return (
      <View style={homeStyles.center}>
        <ActivityIndicator size="large" color="#075E54" />
        <Text style={{ marginTop: 10, color: '#075E54' }}>Loading Chats...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={homeStyles.container}>
      {/* WhatsApp Style Search Bar */}
      <View style={homeStyles.searchContainer}>
        <TextInput
          style={homeStyles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ContactItem
            item={item}
            onPress={() => navigation.navigate('Chat', {
              contactId: item.id,
              name: item.name
            })}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No conversations found</Text>
          </View>
        }
        // Optimization for smooth scrolling
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;