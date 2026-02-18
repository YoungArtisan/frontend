import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ArtistMessagesPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const {
        conversations,
        activeChatId,
        setActiveChatId,
        activeMessages,
        sendMessage
    } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const currentConversation = conversations.find(c => c.id === activeChatId);
    const otherParticipant = currentConversation
        ? Object.keys(currentConversation.participantNames).find(uid => uid !== currentUser?.uid)
        : null;

    const otherParticipantName = currentConversation
        ? currentConversation.participantNames[otherParticipant]
        : '';

    const productContext = currentConversation?.productContext;

    const [activeProductId, setActiveProductId] = useState(null); // 'all' or specific product ID

    const discussedProducts = currentConversation?.discussedProducts || {};
    // If legacy productContext exists but not in discussedProducts, add it visually
    if (currentConversation?.productContext && !discussedProducts[currentConversation.productContext.id]) {
        discussedProducts[currentConversation.productContext.id] = {
            ...currentConversation.productContext,
            lastDiscussed: currentConversation.updatedAt
        };
    }

    const productList = Object.values(discussedProducts).sort((a, b) =>
        (b.lastDiscussed?.seconds || 0) - (a.lastDiscussed?.seconds || 0)
    );

    // Effect to set active product when conversation changes or messages update
    useEffect(() => {
        if (productList.length > 0) {
            // Auto-select the most recently discussed product (first in sorted list)
            setActiveProductId(productList[0].id);
        } else {
            setActiveProductId(null);
        }
    }, [currentConversation, activeMessages.length, productList.length]); // Added productList.length to dependencies

    // NEW: Filter messages by active product
    const filteredMessages = activeProductId
        ? activeMessages.filter(msg => msg.productId === activeProductId)
        : [];

    // Count messages per product for badges
    const getMessageCount = (productId) => {
        return activeMessages.filter(msg => msg.productId === productId).length;
    };

    // Filter conversations by search
    const filteredConversations = conversations.filter(conv =>
        Object.values(conv.participantNames).some(name =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    // Auto-select first conversation
    useEffect(() => {
        if (!activeChatId && conversations.length > 0) {
            setActiveChatId(conversations[0].id);
        }
    }, [conversations, activeChatId, setActiveChatId]);

    const handleSend = async () => {
        if (!messageInput.trim() || sending) return;

        setSending(true);
        try {
            // Get current active product details if a specific product is selected
            const currentProduct = activeProductId ? discussedProducts[activeProductId] : null;

            await sendMessage(messageInput, 'text', null, currentProduct);
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

    return (
        <div className="fixed inset-0 pt-16 bg-gray-50 flex flex-col">
            <div className="flex-1 container mx-auto px-4 py-6 h-full overflow-hidden">
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Sidebar - Conversations List */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={() => navigate('/artist')}
                                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                        {t('artist.backToDashboard')}
                                    </button>
                                </div>
                                <h1 className="text-xl font-bold text-gray-800">{t('artist.messages')}</h1>
                            </div>

                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-100 flex-shrink-0">
                                <div className="relative">
                                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search messages..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Conversations List - Independent Scroll */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <i className="fa-solid fa-inbox text-4xl mb-3 block"></i>
                                        <p className="text-sm">No conversations yet</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const otherUid = Object.keys(conv.participantNames).find(uid => uid !== currentUser.uid);
                                        const otherName = conv.participantNames[otherUid];
                                        const isActive = conv.id === activeChatId;

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setActiveChatId(conv.id)}
                                                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${isActive ? 'bg-blue-50 border-l-4 border-l-brand-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {otherName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-semibold text-gray-900 truncate">
                                                                {otherName}
                                                            </h4>
                                                            <span className="text-xs text-gray-400">
                                                                {conv.updatedAt?.toDate?.().toLocaleDateString([], {
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                }) || 'Recent'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {conv.lastMessage || 'No messages yet'}
                                                        </p>
                                                        {/* Show icon for active/last product */}
                                                        {conv.productContext && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <img
                                                                    src={conv.productContext.image}
                                                                    alt=""
                                                                    className="w-4 h-4 rounded object-cover"
                                                                />
                                                                <span className="text-xs text-gray-400 truncate">
                                                                    {conv.productContext.title}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Chat View */}
                        <div className="w-2/3 flex flex-col h-full bg-gray-50/50">
                            {activeChatId && currentConversation ? (
                                <>
                                    {/* Chat Header - Fixed */}
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 shadow-sm z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-400 flex items-center justify-center text-white font-bold shadow-md">
                                                {otherParticipantName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{otherParticipantName}</h3>
                                                <p className="text-xs text-green-500 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-flex">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Online
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Context Tabs / History (Multi-Product UI) */}
                                    {productList.length > 0 && (
                                        <div className="bg-white border-b border-gray-100 flex-shrink-0 animate-fade-in overflow-x-auto custom-scrollbar">
                                            <div className="flex items-center p-2 gap-2 min-w-max">
                                                {/* Product Tabs */}
                                                {productList.map((prod) => {
                                                    const isActive = activeProductId === prod.id;
                                                    const msgCount = getMessageCount(prod.id);
                                                    return (
                                                        <div
                                                            key={prod.id}
                                                            onClick={() => setActiveProductId(prod.id)}
                                                            className={`
                                                                flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group relative
                                                                ${isActive
                                                                    ? 'bg-blue-50 border-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                                                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                                }
                                                            `}
                                                            style={{ maxWidth: isActive ? '300px' : '60px' }}
                                                        >
                                                            <div className="relative">
                                                                <img
                                                                    src={prod.image}
                                                                    alt={prod.title}
                                                                    className={`
                                                                        rounded-lg object-cover transition-all
                                                                        ${isActive ? 'w-10 h-10' : 'w-8 h-8 opacity-80 group-hover:opacity-100'}
                                                                    `}
                                                                />
                                                                {/* Message count badge */}
                                                                {msgCount > 0 && !isActive && (
                                                                    <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                                        {msgCount}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Show details only if active */}
                                                            {isActive && (
                                                                <div className="flex-1 min-w-0 animate-fade-in">
                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                        <p className="text-xs font-bold text-gray-800 truncate pr-2">
                                                                            {prod.title}
                                                                        </p>
                                                                        <a
                                                                            href={`/product/${prod.id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] text-brand-primary hover:underline flex-shrink-0"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-[10px] text-brand-primary font-bold">
                                                                            {prod.price}
                                                                        </p>
                                                                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">
                                                                            {msgCount} msg{msgCount !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Tooltip for inactive icons */}
                                                            {!isActive && (
                                                                <div className="hidden group-hover:block absolute z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg -mt-10 whitespace-nowrap">
                                                                    {prod.title} ({msgCount})
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}


                                    {/* Messages Area - Independent Scroll */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50">
                                        {filteredMessages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <i className="fa-solid fa-comments text-4xl text-gray-300"></i>
                                                </div>
                                                <p className="text-lg font-medium text-gray-500">No messages for this product yet</p>
                                                <p className="text-sm">Start the conversation below!</p>
                                            </div>
                                        ) : (
                                            filteredMessages.map((message) => {
                                                const isOwn = message.senderId === currentUser.uid;
                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up group`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] px-5 py-3 shadow-sm transition-all ${isOwn
                                                                ? 'bg-brand-primary text-white rounded-2xl rounded-tr-none'
                                                                : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                                                                }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                                {message.text}
                                                            </p>
                                                            <div className={`text-[10px] mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'text-white/70 justify-end' : 'text-gray-400'
                                                                }`}>
                                                                {message.timestamp?.toDate?.().toLocaleString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) || 'Just now'}
                                                                {isOwn && <i className="fa-solid fa-check-double text-[10px]"></i>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area - Fixed at bottom */}
                                    <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                                        <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message..."
                                                rows="1"
                                                className="flex-1 px-3 py-2 bg-transparent focus:outline-none resize-none max-h-32 text-sm"
                                                style={{ minHeight: '24px' }}
                                            />
                                            <div className="flex items-center gap-2 pb-1 pr-1">
                                                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                                    <i className="fa-solid fa-paperclip"></i>
                                                </button>
                                                <button
                                                    onClick={handleSend}
                                                    disabled={!messageInput.trim() || sending}
                                                    className="bg-brand-primary text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group"
                                                >
                                                    {sending ? (
                                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <i className="fa-solid fa-paper-plane group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <i className="fa-regular fa-comments text-6xl text-brand-primary/20"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Conversations</h2>
                                    <p className="text-gray-500 max-w-sm text-center">Select a conversation from the left to start chatting with your customers.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default ArtistMessagesPage;
