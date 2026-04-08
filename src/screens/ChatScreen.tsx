import * as React from 'react';
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  Image,
  ActivityIndicator
} from 'react-native';

import { getItem, setItem } from '../data/storage'; 
import { Contact, Message } from '../types/navigation';
import MessageBubble from '../components/MessageBubble';
import { chatStyles as styles } from '../styles/globalStyles';

const ChatScreen = ({ route, navigation }: any) => {
  const { contactId, name } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() && navigation.goBack()} 
          style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingVertical: 5 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: 'white', fontSize: 32, fontWeight: '200', marginRight: 8 }}>‹</Text>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dfe5e7', overflow: 'hidden', marginRight: 10 }}>
            {contact?.avatar ? <Image source={{ uri: contact.avatar }} style={{ width: '100%', height: '100%' }} /> : null}
          </View>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{name}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, contact, name]);

  useEffect(() => {
    if (contactId) loadMessages();
  }, [contactId]);

  const loadMessages = async () => {
    const storedData = await getItem();
    if (storedData) {
      const currentContact = storedData.find((c: Contact) => c.id === contactId);
      if (currentContact) {
        setContact(currentContact);
        setMessages(currentContact.messages || []);
      }
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    const content = newMessage.trim();
    const newMsg: Message = {
      id: Date.now().toString(),
      content: content,
      sender_id: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ischeck: false,
      emoji: [],
      attachment: [],
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setNewMessage('');

    setTimeout(async () => {
      try {
        const storedData = await getItem();
        const updatedContacts = storedData.map((c: Contact) => {
          if (c.id === contactId) {
            return { 
              ...c, 
              messages: updatedMessages, 
              lastMessage: content 
            };
          }
          return c;
        });
        await setItem(updatedContacts);
      } catch (e) {
        console.error("Storage Error:", e);
      }
    }, 0);
  };

  const handleUpdateMessage = async (messageId: string, action: 'delete' | 'react', emojiValue?: string) => {
    let newMessages = [...messages];
    if (action === 'delete') {
      newMessages = newMessages.filter(m => m.id !== messageId);
    } else if (action === 'react' && emojiValue) {
      newMessages = newMessages.map(m => 
        m.id === messageId ? { ...m, emoji: [emojiValue] } : m
      );
    }
    setMessages(newMessages);

    setTimeout(async () => {
      const storedData = await getItem();
      const updatedContacts = storedData.map((c: Contact) => {
        if (c.id === contactId) {
          const newestText = newMessages.length > 0 ? newMessages[newMessages.length - 1].content : "No messages yet";
          return { ...c, messages: newMessages, lastMessage: newestText };
        }
        return c;
      });
      await setItem(updatedContacts);
    }, 0);
  };

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble 
      item={item} 
      onAction={(action, emoji) => handleUpdateMessage(item.id, action, emoji)}
    />
  ), [messages]); 

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#075E54" /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E5DDD5' }}>
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()} 
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted={true} 
        contentContainerStyle={{ padding: 10, paddingTop: 20 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              multiline
              value={newMessage}
              onChangeText={setNewMessage}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.6 }]}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;