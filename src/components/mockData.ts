import { Contact, Message } from '../types/navigation';

const generateMockData = () => {
  const contacts: Contact[] = [];
  
  const myPhrases = [
    "Hey! Did you finish the React Native module? 💻",
    "I'm sending the updated APK now 🚀",
    "Check out this design! 🔥",
    "Let's meet at the university library tomorrow 📚",
    "I'll be there in 10 minutes 👍",
    "Did you see the error in the console? ⚠️"
  ];

  const theirPhrases = [
    "Yes, just finished it! 😊",
    "Received it, looks great! 💯",
    "I love the new UI colors ✨",
    "Sure, what time works for you? 🤝",
    "No worries, take your time 🏃‍♂️",
    "Let me check and get back to you 🔍"
  ];

  const emojiPool = ['❤️', '😂', '😮', '😢', '🙌', '🎉'];

  for (let i = 1; i <= 10; i++) {
    const messages: Message[] = [];
    const contactId = i.toString();

    for (let j = 1; j <= 500; j++) {
      const isMe = j % 2 === 0; 
      const randomText = isMe 
        ? myPhrases[Math.floor(Math.random() * myPhrases.length)]
        : theirPhrases[Math.floor(Math.random() * theirPhrases.length)];

      messages.push({
        id: `msg-${i}-${j}`,
        sender_id: isMe ? 'me' : contactId, 
        content: randomText,
        ischeck: isMe ? (j % 3 === 0) : false, 
        attachment: j % 15 === 0 ? ["https://placehold.co/400x400.png"] : [],
        emoji: j % 7 === 0 ? [emojiPool[Math.floor(Math.random() * emojiPool.length)]] : [],
        timestamp: `${8 + (j % 4)}:${10 + (j % 45)} ${j % 2 === 0 ? 'AM' : 'PM'}`,
      });
    }

    contacts.push({
      id: contactId,
      name: `Contact ${i}`,
      status: "Using WhatsApp Clone",
      avatar: "",
      lastMessage: messages[messages.length - 1].content,
      messages: messages,
    });
  }

  return { contacts };
};

export const mockData = generateMockData();