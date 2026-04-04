import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Contact } from '../types/navigation';
import { homeStyles } from '../styles/globalStyles';

interface ContactItemProps {
  item: Contact;
  onPress: () => void;
}

const ContactItem = ({ item, onPress }: ContactItemProps) => {
  // Logic to get the very last message object
  const hasMessages = item.messages && item.messages.length > 0;
  const lastMsg = hasMessages ? item.messages[item.messages.length - 1] : null;

  return (
    <TouchableOpacity style={homeStyles.contactContainer} onPress={onPress} activeOpacity={0.7}>
      
      {/* Profile Image or Initials Placeholder */}
      <View style={homeStyles.avatar}>
        {item.avatar ? (
          <Image 
            source={{ uri: item.avatar }} 
            style={{ width: '100%', height: '100%' }} 
          />
        ) : (
          <View style={[homeStyles.avatar, { 
            backgroundColor: '#dfe5e7', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }]}>
            <Text style={{ color: '#54656f', fontWeight: 'bold', fontSize: 20 }}>
              {item?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>

      {/* Text Information Section */}
      <View style={homeStyles.textContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={homeStyles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {lastMsg && (
            <Text style={homeStyles.timestamp}>
              {lastMsg.timestamp}
            </Text>
          )}
        </View>

        {/* Message Preview Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
          {/* Show blue/grey ticks only if the last message was sent by 'me' */}
          {lastMsg && lastMsg.sender_id === 'me' && (
            <Text style={{ 
              fontSize: 13, 
              color: lastMsg.ischeck ? '#34B7F1' : '#8e8e8e', 
              marginRight: 4,
              fontWeight: '600'
            }}>
              {lastMsg.ischeck ? '✓✓' : '✓'}
            </Text>
          )}
          
          <Text style={homeStyles.lastMessage} numberOfLines={1}>
            {lastMsg ? lastMsg.content : "No messages yet"}
          </Text>
        </View>
      </View>

    </TouchableOpacity>
  );
};

export default ContactItem;