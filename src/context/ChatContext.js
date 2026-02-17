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
    updateDoc,
    getDocs
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
    const [activeMessages, setActiveMessages] = useState([]);
    const [draftChat, setDraftChat] = useState(null); // { artist, product, messages: [] }
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Listen to conversations where the current user is a participant
    useEffect(() => {
        if (!currentUser) {
            setConversations([]);
            setActiveChatId(null);
            return;
        }

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const convs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setConversations(convs);
            },
            (error) => {
                console.error('Error fetching conversations:', error);
                if (error.code === 'failed-precondition') {
                    console.error('INDEX REQUIRED! Check the error message for a link to create the index.');
                }
            }
        );

        return unsubscribe;
    }, [currentUser]);

    // Listen to messages for the active chat
    useEffect(() => {
        if (!activeChatId) {
            setActiveMessages([]);
            return;
        }

        const messagesRef = collection(db, 'conversations', activeChatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActiveMessages(msgs);
        });

        return unsubscribe;
    }, [activeChatId]);

    const [currentSessionProduct, setCurrentSessionProduct] = useState(null); // The product the user is CURRENTLY looking at/discussing

    // Start a conversation (DRAFT MODE - no Firestore write)
    const startConversation = async (artist, product = null) => {
        if (!currentUser) {
            console.error('Cannot start conversation: No user logged in');
            return;
        }

        if (!artist.uid) {
            console.error('Cannot start conversation: Artist UID is missing', artist);
            alert('Unable to start conversation: Artist information is incomplete.');
            return;
        }

        // Set the current session product explicitly
        if (product) {
            setCurrentSessionProduct(product);
        } else {
            setCurrentSessionProduct(null);
        }

        // Check if conversation already exists
        const existingConv = conversations.find(c =>
            c.participants.includes(artist.uid)
        );

        if (existingConv) {
            // Open existing conversation
            setActiveChatId(existingConv.id);
            setDraftChat(null);
            setIsChatOpen(true);
        } else {
            // Create DRAFT conversation (local only)
            setDraftChat({
                artist,
                product,
                messages: []
            });
            setActiveChatId(null);
            setActiveMessages([]);
            setIsChatOpen(true);
        }
    };

    // Send a message (handles both draft and existing conversations)
    const sendMessage = async (messageText, messageType = 'text', metadata = null, currentProduct = null) => {
        if (!currentUser || !messageText.trim()) return;

        // Determine product data to save/update
        // Priority: Explicitly passed > Session Product > Draft Product
        const productToUse = currentProduct || currentSessionProduct || draftChat?.product;

        const productToSave = productToUse ? {
            id: productToUse.id,
            title: productToUse.title,
            image: productToUse.images?.[0] || productToUse.image,
            price: productToUse.price,
            lastDiscussed: serverTimestamp()
        } : null;

        const messageData = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            text: messageText,
            type: messageType,
            metadata,
            productId: productToSave?.id || null, // NEW: Store which product this message is about
            timestamp: serverTimestamp()
        };

        try {
            // Case 1: Draft conversation (first message)
            if (draftChat) {
                // Prepare initial discussedProducts map
                const discussedProducts = {};
                if (productToSave) {
                    discussedProducts[productToSave.id] = productToSave;
                }

                // Create the conversation in Firestore
                const convData = {
                    participants: [currentUser.uid, draftChat.artist.uid],
                    participantNames: {
                        [currentUser.uid]: currentUser.displayName,
                        [draftChat.artist.uid]: draftChat.artist.name
                    },
                    updatedAt: serverTimestamp(),
                    lastMessage: messageText,
                    // Keeping productContext for backward compatibility / current focus
                    productContext: productToSave || null,
                    discussedProducts // NEW: Map of all products discussed
                };

                const docRef = await addDoc(collection(db, 'conversations'), convData);
                const chatId = docRef.id;

                // Add the message
                await addDoc(collection(db, 'conversations', chatId, 'messages'), messageData);

                // Switch from draft to real conversation
                setActiveChatId(chatId);
                setDraftChat(null);
            }
            // Case 2: Existing conversation
            else if (activeChatId) {
                await addDoc(collection(db, 'conversations', activeChatId, 'messages'), messageData);

                const updateData = {
                    lastMessage: messageText,
                    updatedAt: serverTimestamp()
                };

                // If discussing a product, update specific fields
                if (productToSave) {
                    updateData[`discussedProducts.${productToSave.id}`] = productToSave;
                    updateData['productContext'] = { // Update legacy context too
                        id: productToSave.id,
                        title: productToSave.title,
                        image: productToSave.image,
                        price: productToSave.price
                    };
                }

                await updateDoc(doc(db, 'conversations', activeChatId), updateData);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    // Close chat
    const closeChat = () => {
        setIsChatOpen(false);
        setDraftChat(null);
        // Don't clear activeChatId - keep it for re-opening
    };

    // Get conversation by ID
    const getConversationById = (id) => {
        return conversations.find(c => c.id === id);
    };

    const value = {
        conversations,
        activeChatId,
        setActiveChatId,
        activeMessages,
        draftChat,
        isChatOpen,
        setIsChatOpen,
        startConversation,
        sendMessage,
        closeChat,
        getConversationById,
        currentSessionProduct // Export this
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
