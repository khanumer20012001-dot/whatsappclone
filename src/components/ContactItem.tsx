import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Contact } from '../types/navigation';
import { homeStyles } from '../styles/globalStyles';

interface ContactItemProps {
  item: Contact;
  onPress: () => void;
}

const ContactItem = ({ item, onPress }: ContactItemProps) => {
  const hasMessages = item.messages && item.messages.length > 0;
  const latestMsg = hasMessages ? item.messages[item.messages.length - 1] : null;

  return (
    <TouchableOpacity 
      style={homeStyles.contactContainer} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
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

      <View style={homeStyles.textContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={homeStyles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {latestMsg && (
            <Text style={homeStyles.timestamp}>
              {latestMsg.timestamp}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
          {latestMsg?.sender_id === 'me' && (
            <Text style={{ 
              fontSize: 13, 
              color: latestMsg.ischeck ? '#34B7F1' : '#8e8e8e', 
              marginRight: 4, 
              fontWeight: '600' 
            }}>
              {latestMsg.ischeck ? '✓✓' : '✓'}
            </Text>
          )}
          <Text style={homeStyles.lastMessage} numberOfLines={1}>
            {latestMsg ? latestMsg.content : "No messages yet"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(ContactItem, (prevProps, nextProps) => {
  const prevLast = prevProps.item.messages[prevProps.item.messages.length - 1];
  const nextLast = nextProps.item.messages[nextProps.item.messages.length - 1];

  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevLast?.id === nextLast?.id &&
    prevLast?.content === nextLast?.content &&
    prevLast?.ischeck === nextLast?.ischeck
  );
});