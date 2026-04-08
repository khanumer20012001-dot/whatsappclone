import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
  },
  contactContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    height: 80, 
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#dfe5e7',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  // Added back for HomeScreen loading
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    width: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f6f7',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addButton: {
    backgroundColor: '#075E54',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export const chatStyles = StyleSheet.create({
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 2,
    marginRight: 8,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#8e8e8e',
  },
  tickText: {
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#E5DDD5',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    minHeight: 45,
    maxHeight: 120,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#075E54',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -12,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 2,
    elevation: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reactionText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.75,
    backgroundColor: 'transparent',
  },
  menuAlignRight: {
    alignItems: 'flex-end',
  },
  menuAlignLeft: {
    alignItems: 'flex-start',
  },
  emojiBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
    elevation: 10,
  },
  emojiSize: {
    fontSize: 28,
  },
  actionBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    width: '70%',
    elevation: 10,
  },
  actionItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  actionLabel: {
    fontSize: 16,
    color: '#000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  // Added back for ChatScreen loading
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export const statusStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  myStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  myAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dfe5e7',
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#25D366', 
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  plusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  sectionHeader: {
    backgroundColor: '#f5f6f7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#667781', 
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  statusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#25D366', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  viewedCircle: {
    borderColor: '#D1D7DB', 
  },
  statusThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111B21', 
  },
  subText: {
    fontSize: 14,
    color: '#667781',
    marginTop: 3,
  },
  threeDot: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    fontSize: 24,
    color: '#667781',
    fontWeight: 'bold',
  },
  // Added back for StatusScreen loading
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export const viewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullMedia: {
    width: width,
    height: height * 0.85,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    padding: 10
  },
  closeText: {
    color: 'white',
    fontSize: 30,
    fontWeight: '300'
  }
});