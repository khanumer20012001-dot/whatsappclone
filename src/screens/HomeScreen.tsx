import * as React from 'react';
import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { 
  View, FlatList, ActivityIndicator, TextInput, Text, 
  SafeAreaView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import { request, requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { getItem, setItem } from '../data/storage';  
import { Contact } from '../types/navigation';
import ContactItem from '../components/ContactItem';
import { homeStyles, modalStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const [isModalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 20, padding: 5 }}>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const syncAllContacts = async () => {
    try {
      let hasPermission = false;
      if (Platform.OS === 'android') {
        const stats = await requestMultiple([
          PERMISSIONS.ANDROID.READ_CONTACTS,
          PERMISSIONS.ANDROID.WRITE_CONTACTS,
        ]);
        hasPermission = stats[PERMISSIONS.ANDROID.READ_CONTACTS] === RESULTS.GRANTED;
      } else {
        const stat = await request(PERMISSIONS.IOS.CONTACTS);
        hasPermission = stat === RESULTS.GRANTED;
      }

      const localAppContacts = await getItem() || [];
      
      if (hasPermission) {
        const phoneContacts = await Contacts.getAll();
        
        // --- FIX 1: Extract the ACTUAL phone number string from the native contact object ---
        const formattedPhone = phoneContacts.map(c => ({
          id: c.recordID,
          name: `${c.givenName} ${c.familyName}`.trim() || 'Unknown',
          // Grab the first number found in the phoneNumbers array
          phone: c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers[0].number : "", 
          avatar: c.thumbnailPath || `https://ui-avatars.com/api/?name=${c.givenName}+${c.familyName}&background=random`,
          lastMessage: "Synced from phone",
          messages: [],
        }));

        const contactMap = new Map();
        formattedPhone.forEach(c => contactMap.set(c.id, c));
        
        // --- FIX 2: Overwrite IDs with phone numbers if they exist in storage ---
        localAppContacts.forEach((c: Contact) => {
            const existing = contactMap.get(c.id);
            contactMap.set(c.id, { 
                ...c, 
                phone: existing?.phone || c.phone || "" // Ensure phone field is preserved
            });
        });

        const merged = Array.from(contactMap.values());
        sortAndSet(merged);
      } else {
        sortAndSet(localAppContacts);
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortAndSet = (data: Contact[]) => {
    const sorted = [...data].sort((a, b) => {
      const timeA = a.messages?.length > 0 ? Number(a.messages[a.messages.length - 1].id) : 0;
      const timeB = b.messages?.length > 0 ? Number(b.messages[b.messages.length - 1].id) : 0;
      return timeB - timeA || a.name.localeCompare(b.name);
    });
    setContacts(sorted);
    setItem(sorted);
  };

  useEffect(() => {
    if (isFocused) syncAllContacts();
  }, [isFocused]);

  const handleAddContact = async () => {
    if (!firstName.trim() || !phoneNumber.trim()) return;

    const newPhoneContact = {
      givenName: firstName,
      familyName: lastName,
      phoneNumbers: [{ label: 'mobile', number: phoneNumber }],
    };

    const newAppContact: Contact = {
      id: `u${Date.now()}`,
      name: `${firstName} ${lastName}`.trim(),
      phone: phoneNumber, 
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      lastMessage: "No messages yet",
      messages: [],
    };

    try {
      await Contacts.addContact(newPhoneContact);
      const current = await getItem() || [];
      const updated = [newAppContact, ...current];
      sortAndSet(updated);
      
      setFirstName(''); setLastName(''); setPhoneNumber('');
      setModalVisible(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const filteredContacts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    return contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(lowerQuery);
      const hasMessages = c.messages && c.messages.length > 0;
      return lowerQuery.length > 0 ? matchesSearch : hasMessages;
    });
  }, [searchQuery, contacts]);

  const renderItem = useCallback(({ item }: { item: Contact }) => (
    <ContactItem
      item={item}
      // --- FIX 3: Pass the phone number explicitly to the Chat screen ---
      onPress={() => navigation.navigate('Chat', { 
          contactId: item.id, 
          name: item.name, 
          phoneNumber: item.phone 
      })}
    />
  ), [navigation]);

  if (loading) return <View style={homeStyles.center}><ActivityIndicator size="large" color="#075E54" /></View>;

  return (
    <SafeAreaView style={homeStyles.container}>
      <View style={homeStyles.searchContainer}>
        <TextInput
          style={homeStyles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={15}
        windowSize={5}
        contentContainerStyle={{ paddingBottom: 100 }} 
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>
              {searchQuery ? "No contacts found" : "No active conversations"}
            </Text>
          </View>
        }
      />

      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <TouchableOpacity activeOpacity={1} style={modalStyles.bottomSheet}>
              <View style={modalStyles.handle} />
              <Text style={modalStyles.title}>New Contact</Text>
              <TextInput style={modalStyles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} autoFocus />
              <TextInput style={modalStyles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              <TextInput style={modalStyles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
              <TouchableOpacity 
                style={[modalStyles.addButton, { opacity: firstName && phoneNumber ? 1 : 0.5 }]} 
                onPress={handleAddContact}
                disabled={!firstName || !phoneNumber}
              >
                <Text style={modalStyles.addButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;