import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  ActivityIndicator
} from 'react-native';

import { getItem, setItem } from '../data/storage'; 
import { Contact, Message } from '../types/navigation';
import MessageBubble from '../components/MessageBubble';
import { chatStyles as styles } from '../styles/globalStyles';

const ChatScreen = ({ route }: any) => {
  const contactId = route?.params?.contactId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history when screen opens
  useEffect(() => {
    if (contactId) loadMessages();
  }, [contactId]);

  const loadMessages = async () => {
    const storedData = await getItem();
    if (storedData) {
      const currentContact = storedData.find((c: Contact) => c.id === contactId);
      if (currentContact) {
        setMessages(currentContact.messages || []);
      }
    }
    setLoading(false);
  };

  const handleUpdateMessage = async (messageId: string, action: 'delete' | 'react', emojiValue?: string) => {
    const storedData = await getItem();
    if (!storedData) return;

    const updatedContacts = storedData.map((contact: Contact) => {
      if (contact.id === contactId) {
        let newMessages = [...contact.messages];
        if (action === 'delete') {
          newMessages = newMessages.filter(m => m.id !== messageId);
        } else if (action === 'react' && emojiValue) {
          newMessages = newMessages.map(m => 
            m.id === messageId ? { ...m, emoji: [emojiValue] } : m
          );
        }
        return { ...contact, messages: newMessages };
      }
      return contact;
    });

    await setItem(updatedContacts);
    const updatedChat = updatedContacts.find((c: Contact) => c.id === contactId);
    if (updatedChat) setMessages(updatedChat.messages);
  };

  const handleSend = async () => {
    if (newMessage.trim() === '' || !contactId) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender_id: 'me', // Matches 'isMe' check in MessageBubble
      content: newMessage,
      ischeck: false,
      attachment: [],
      emoji: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update UI immediately
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setNewMessage('');

    // Persist to AsyncStorage
    const storedData = await getItem();
    if (storedData) {
      const updatedContacts = storedData.map((c: Contact) => 
        c.id === contactId ? { ...c, messages: updatedMessages, lastMessage: newMessage } : c
      );
      await setItem(updatedContacts);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#075E54" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E5DDD5' }}>
      <FlatList
        ref={flatListRef}
        // data is reversed because the list is inverted
        data={[...messages].reverse()} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble 
            item={item} 
            onAction={(action, emoji) => handleUpdateMessage(item.id, action, emoji)}
          />
        )}
        inverted={true} 
        contentContainerStyle={{ padding: 10, paddingTop: 20 }}
        initialNumToRender={15}
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
              placeholderTextColor="#999"
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