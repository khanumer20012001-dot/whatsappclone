import * as React from 'react';
import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Alert
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Message } from '../types/navigation';
import { chatStyles as styles } from '../styles/globalStyles';

interface MessageBubbleProps {
  item: Message;
  onAction: (action: 'delete' | 'react', emoji?: string) => void;
}

const MessageBubble = ({ item, onAction }: MessageBubbleProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const isMe = item.sender_id === 'me';
  const quickEmojis = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

  const handleEmojiReaction = (emoji: string) => {
    setMenuVisible(false);
    onAction('react', emoji);
  };

  const handleAction = (action: string) => {
    setMenuVisible(false);
    if (action === 'Copy') {
      Clipboard.setString(item.content);
    } else if (action === 'Delete') {
      onAction('delete');
    } 
  };

  return (
    <View style={{ 
      width: '100%', 
      alignItems: isMe ? 'flex-end' : 'flex-start', 
      paddingHorizontal: 10,
      marginVertical: 4 
    }}>
      <TouchableOpacity 
        onLongPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
        style={[
          styles.messageBubble, 
          isMe ? styles.myBubble : styles.theirBubble
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        
        <View style={styles.bubbleFooter}>
          <Text style={styles.timeText}>{item.timestamp}</Text>
          {isMe && (
            <Text style={[styles.tickText, { color: item.ischeck ? '#34B7F1' : '#8e8e8e' }]}>
              {item.ischeck ? '✓✓' : '✓'}
            </Text>
          )}
        </View>

        {/* Reaction Badge */}
        {item.emoji && item.emoji.length > 0 && (
          <View style={styles.reactionBadge}>
            <Text style={styles.reactionText}>{item.emoji.join('')}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[
            styles.menuContainer, 
            isMe ? styles.menuAlignRight : styles.menuAlignLeft
          ]}>
            {/* Emoji Bar */}
            <View style={styles.emojiBar}>
              {quickEmojis.map((emo) => (
                <TouchableOpacity key={emo} onPress={() => handleEmojiReaction(emo)}>
                  <Text style={styles.emojiSize}>{emo}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Context Menu */}
            <View style={styles.actionBox}>
              <TouchableOpacity onPress={() => handleAction('Copy')} style={styles.actionItem}>
                <Text style={styles.actionLabel}>Copy</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity onPress={() => handleAction('Delete')} style={styles.actionItem}>
                <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MessageBubble;