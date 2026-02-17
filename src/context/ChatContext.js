import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    // Listen to conversations where the current user is a participant
    useEffect(() => {
        if (!currentUser) {
            setConversations([]);
            setActiveChatId(null);
            return;
        }

        console.log('Setting up conversations listener for user:', currentUser.uid);

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                console.log('Conversations snapshot received:', snapshot.docs.length, 'conversations');
                const convs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('Parsed conversations:', convs);
                setConversations(convs);
            },
            (error) => {
                console.error('Error fetching conversations:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                // If it's an index error, the error message will contain a link to create the index
                if (error.code === 'failed-precondition') {
                    console.error('INDEX REQUIRED! Check the error message above for a link to create the index.');
                }
            }
        );

        return unsubscribe;
    }, [currentUser]);

    const startConversation = async (artist, product = null) => {
        if (!currentUser) {
            console.error('Cannot start conversation: No user logged in');
            return;
        }

        if (!artist.uid) {
            console.error('Cannot start conversation: Artist UID is missing', artist);
            alert('Unable to start conversation: Artist information is incomplete. Please try refreshing the page.');
            return;
        }

        // Check if conversation already exists
        const existingConv = conversations.find(c =>
            c.participants.includes(artist.uid)
        );

        let chatId = existingConv?.id;

        if (!existingConv) {
            // Create new conversation
            const convData = {
                participants: [currentUser.uid, artist.uid],
                participantNames: {
                    [currentUser.uid]: currentUser.displayName,
                    [artist.uid]: artist.name
                },
                updatedAt: serverTimestamp(),
                lastMessage: product ? `Inquiry about: ${product.title}` : 'Started a conversation'
            };

            console.log('Creating new conversation:', convData);
            const docRef = await addDoc(collection(db, 'conversations'), convData);
            chatId = docRef.id;
        }

        if (product) {
            // Send product context message
            await sendMessage(chatId, `Inquiry about: ${product.title}`, 'product_context', {
                productId: product.id,
                productImage: product.image,
                productTitle: product.title
            });
        }

        setActiveChatId(chatId);
        return chatId;
    };

    const sendMessage = async (chatId, text, type = 'text', metadata = {}) => {
        if (!currentUser) return;

        const messageData = {
            chatId,
            text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            timestamp: serverTimestamp(),
            type,
            ...metadata
        };

        // Add message to subcollection
        await addDoc(collection(db, 'conversations', chatId, 'messages'), messageData);

        // Update conversation last message and timestamp
        await updateDoc(doc(db, 'conversations', chatId), {
            lastMessage: text,
            updatedAt: serverTimestamp()
        });
    };

    const getMessages = (chatId, callback) => {
        const q = query(
            collection(db, 'conversations', chatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });
    };

    const value = {
        conversations,
        activeChatId,
        setActiveChatId,
        startConversation,
        sendMessage,
        getMessages
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
