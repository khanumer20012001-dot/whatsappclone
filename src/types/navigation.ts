/**
 * Represents a single message within a conversation.
 */
export interface Message {
  id: string;
  sender_id: string;   // Use 'u1', 'u2', etc., or 'me' for the current user
  content: string;     
  ischeck: boolean;    // Corresponds to the blue/grey ticks (read receipts)
  attachment: string[]; 
  emoji: string[];      // Array of strings to store multiple reactions if needed
  timestamp: string;    // Formatted time (e.g., "10:00 AM")
}

/**
 * Represents a contact/user in the chat list.
 */
export interface Contact {
  id: string;
  name: string;
  avatar: string;      // URL to the profile image
  phone: string; //
  lastMessage: string; // The text preview shown in the Home Screen
  messages: Message[]; // The full history of messages for this specific chat
}

/**
 * Defines the parameters expected by each screen in the stack.
 */
export type RootStackParamList = {
  Home: undefined;     // Home screen takes no parameters
  Chat: { 
    contactId: string; // Required to filter messages in ChatScreen
    name: string       // Used to set the header title dynamically
    phoneNumber: string; 
  };
};