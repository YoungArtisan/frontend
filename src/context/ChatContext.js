import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState(() => {
        const savedConversations = localStorage.getItem('youngArtisanChats');
        return savedConversations ? JSON.parse(savedConversations) : [];
    });

    const [activeChatId, setActiveChatId] = useState(null);

    // Save to localStorage whenever conversations change
    useEffect(() => {
        localStorage.setItem('youngArtisanChats', JSON.stringify(conversations));
    }, [conversations]);

    const startConversation = (artist, product) => {
        // Check if conversation with this artist already exists
        const existingConversation = conversations.find(
            conv => conv.participants.artist === artist.name
        );

        if (existingConversation) {
            // Add product context message to existing conversation
            const productContextMessage = {
                id: Date.now(),
                sender: 'system',
                type: 'product_context',
                text: `Inquiry about: ${product.title}`,
                productId: product.id,
                productImage: product.image,
                timestamp: new Date().toISOString()
            };

            setConversations(prev =>
                prev.map(conv =>
                    conv.id === existingConversation.id
                        ? { ...conv, messages: [...conv.messages, productContextMessage] }
                        : conv
                )
            );

            setActiveChatId(existingConversation.id);
            return existingConversation.id;
        } else {
            // Create new conversation
            const newConversation = {
                id: Date.now(),
                participants: {
                    customer: 'Customer', // In real app, this would be the logged-in user
                    artist: artist.name,
                    artistAvatar: artist.avatar
                },
                messages: [
                    {
                        id: Date.now(),
                        sender: 'system',
                        type: 'product_context',
                        text: `Inquiry about: ${product.title}`,
                        productId: product.id,
                        productImage: product.image,
                        timestamp: new Date().toISOString()
                    }
                ],
                lastMessageTime: new Date().toISOString()
            };

            setConversations(prev => [...prev, newConversation]);
            setActiveChatId(newConversation.id);
            return newConversation.id;
        }
    };

    const sendMessage = (conversationId, text, sender = 'customer') => {
        const newMessage = {
            id: Date.now(),
            sender,
            type: 'text',
            text,
            timestamp: new Date().toISOString()
        };

        setConversations(prev =>
            prev.map(conv =>
                conv.id === conversationId
                    ? {
                        ...conv,
                        messages: [...conv.messages, newMessage],
                        lastMessageTime: new Date().toISOString()
                    }
                    : conv
            )
        );
    };

    const getConversation = (conversationId) => {
        return conversations.find(conv => conv.id === conversationId);
    };

    const value = {
        conversations,
        activeChatId,
        setActiveChatId,
        startConversation,
        sendMessage,
        getConversation
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
