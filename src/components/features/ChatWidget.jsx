import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
    const { currentUser } = useAuth();
    const {
        isChatOpen,
        setIsChatOpen,
        activeChatId,
        activeMessages,
        draftChat,
        sendMessage,
        closeChat,
        getConversationById,
        currentSessionProduct
    } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const currentConversation = activeChatId ? getConversationById(activeChatId) : null;
    const otherParticipant = currentConversation
        ? Object.keys(currentConversation.participantNames).find(uid => uid !== currentUser?.uid)
        : draftChat?.artist.uid;

    const otherParticipantName = currentConversation
        ? currentConversation.participantNames[otherParticipant]
        : draftChat?.artist.name;

    const productContext = currentConversation?.productContext || draftChat?.product;

    // Handle multi-product history for customer view
    const discussedProducts = currentConversation?.discussedProducts || {};

    // Build product list
    const allProductsMap = { ...discussedProducts };
    if (currentSessionProduct && !allProductsMap[currentSessionProduct.id]) {
        allProductsMap[currentSessionProduct.id] = currentSessionProduct;
    }
    if (draftChat?.product && !allProductsMap[draftChat.product.id]) {
        allProductsMap[draftChat.product.id] = draftChat.product;
    }
    const productList = Object.values(allProductsMap).sort((a, b) =>
        (b.lastDiscussed?.seconds || 0) - (a.lastDiscussed?.seconds || 0)
    );

    // Local state for actively selected product tab
    const [selectedTabProductId, setSelectedTabProductId] = useState(null);

    // Effect to auto-select product tab based on context
    useEffect(() => {
        // Priority: currentSessionProduct > draft product > most recent
        if (currentSessionProduct) {
            setSelectedTabProductId(currentSessionProduct.id);
        } else if (draftChat?.product) {
            setSelectedTabProductId(draftChat.product.id);
        } else if (productList.length > 0) {
            setSelectedTabProductId(productList[0].id);
        }
    }, [currentSessionProduct, draftChat, productList.length]);

    // Determine the "Active" product for sending messages
    const activeProduct = selectedTabProductId ? allProductsMap[selectedTabProductId] : null;

    // Filter messages by selected product
    const filteredMessages = selectedTabProductId
        ? activeMessages.filter(msg => msg.productId === selectedTabProductId)
        : [];

    // Count messages per product
    const getMessageCount = (productId) => {
        return activeMessages.filter(msg => msg.productId === productId).length;
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    const handleSend = async () => {
        if (!messageInput.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage(messageInput, 'text', null, activeProduct);
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isChatOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {/* Chat Window */}
            <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden animate-slide-up border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-primary to-[#2d7a94] text-white p-4 flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                            🎨
                        </div>
                        <div>
                            <h3 className="font-bold">{otherParticipantName || 'Artist'}</h3>
                            <p className="text-xs text-white/80">Online</p>
                        </div>
                    </div>
                    <button
                        onClick={closeChat}
                        className="hover:bg-white/10 p-2 rounded-full transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Product Context Tabs (Multi-Product UI) */}
                {productList.length > 0 && (
                    <div className="bg-white border-b border-gray-100 flex-shrink-0 animate-fade-in overflow-x-auto custom-scrollbar">
                        <div className="flex items-center p-2 gap-2 min-w-max">
                            {/* Product Tabs */}
                            {productList.map((prod) => {
                                const isActive = selectedTabProductId === prod.id;
                                const msgCount = getMessageCount(prod.id);
                                return (
                                    <div
                                        key={prod.id}
                                        onClick={() => setSelectedTabProductId(prod.id)}
                                        className={`
                                            flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer group relative
                                            ${isActive
                                                ? 'bg-blue-50 border-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                        style={{ maxWidth: isActive ? '100%' : '50px' }}
                                    >
                                        <div className="relative">
                                            <img
                                                src={prod.images?.[0] || prod.image}
                                                alt={prod.title}
                                                className={`
                                                    rounded-lg object-cover transition-all
                                                    ${isActive ? 'w-8 h-8' : 'w-8 h-8 opacity-80 group-hover:opacity-100'}
                                                `}
                                            />
                                            {/* Message count badge */}
                                            {msgCount > 0 && !isActive && (
                                                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                                                    {msgCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Show details only if active */}
                                        {isActive && (
                                            <div className="flex-1 min-w-0 pr-2 animate-fade-in max-w-[200px]">
                                                <p className="text-xs font-bold text-gray-800 truncate">
                                                    {prod.title}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-[10px] text-brand-primary font-bold">
                                                        {prod.price}
                                                    </p>
                                                    <span className="text-[9px] bg-gray-200 text-gray-700 px-1 py-0.5 rounded-full font-bold">
                                                        {msgCount}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {filteredMessages.length === 0 && !draftChat && (
                        <div className="text-center text-gray-400 text-sm mt-8">
                            <i className="fa-solid fa-comments text-3xl mb-2 block"></i>
                            <p>No messages for this product yet</p>
                        </div>
                    )}

                    {filteredMessages.map((message) => {
                        const isOwn = message.senderId === currentUser.uid;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${isOwn
                                            ? 'bg-brand-primary text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {message.text}
                                    </p>
                                    <p
                                        className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'
                                            }`}
                                    >
                                        {message.timestamp?.toDate?.().toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) || 'Just now'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows="1"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-brand-primary resize-none max-h-24 text-sm"
                            style={{ minHeight: '44px' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!messageInput.trim() || sending}
                            className="bg-brand-primary text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                        >
                            {sending ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fa-solid fa-paper-plane"></i>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
