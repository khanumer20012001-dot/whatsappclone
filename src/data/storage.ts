import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Message } from '../types/navigation';
import * as mockDataRaw from './mockData.json';

const STORAGE_KEY = 'chat_data';

const transformInitialData = (): Contact[] => {
  const raw: any = mockDataRaw;
  const users = raw.users || [];
  const messages = raw.messages || [];

  return users.map((user: any) => {
    // FIX: Match messages where sender is 'u9' OR ID starts with 'm9'
    const userMessages: Message[] = messages
      .filter((msg: any) => {
        const userNum = user.id.replace('u', ''); // 'u9' -> '9'
        const isFromUser = msg.sender_id === user.id;
        const isMeToUser = msg.id.startsWith(`m${userNum}`); // matches 'm9' and 'm9_reply'
        
        return isFromUser || isMeToUser;
      })
      .map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        ischeck: msg.isCheck || false, // Mapping JSON 'isCheck' to 'ischeck'
        attachment: msg.attachment || [],
        emoji: msg.emoji || [],
        timestamp: "10:00 AM", 
      }));

    return {
      id: user.id,
      name: user.name,
      avatar: `https://ui-avatars.com/api/?name=${user.name}&background=random`,
      lastMessage: userMessages.length > 0 
        ? userMessages[userMessages.length - 1].content 
        : "No messages yet",
      messages: userMessages,
    };
  });
};

export const setItem = async (value: Contact[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving data:", e);
  }
};

export const getItem = async (): Promise<Contact[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    } else {
      const initialContacts = transformInitialData();
      await setItem(initialContacts);
      return initialContacts;
    }
  } catch (e) {
    console.error("Error reading data:", e);
    return [];
  }
};

export const clearStorage = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};