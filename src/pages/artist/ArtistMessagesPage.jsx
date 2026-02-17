import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ArtistMessagesPage = () => {
    const { conversations, activeChatId, setActiveChatId, sendMessage, getMessages } = useChat();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        if (activeChatId) {
            const unsubscribe = getMessages(activeChatId, (msgs) => {
                setMessages(msgs);
            });
            return unsubscribe;
        } else {
            setMessages([]);
        }
    }, [activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageText.trim() && activeChatId) {
            const text = messageText.trim();
            setMessageText('');
            await sendMessage(activeChatId, text);
        }
    };

    const activeConversation = conversations.find(c => c.id === activeChatId);

    return (
        <div className="h-[calc(100vh-73px)] flex">
            {/* Conversations List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <p className="text-sm text-gray-600">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <i className="fa-solid fa-inbox text-4xl mb-3 block"></i>
                            <p>No messages yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {conversations.map((conversation) => {
                                const isSelected = activeChatId === conversation.id;
                                const otherParticipantUid = conversation.participants.find(uid => uid !== currentUser?.uid);
                                const otherParticipantName = conversation.participantNames?.[otherParticipantUid] || 'Customer';

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => setActiveChatId(conversation.id)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-brand-primary' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                                                {otherParticipantName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{otherParticipantName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {conversation.updatedAt?.toDate ? conversation.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">
                                            {conversation.lastMessage}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                                {activeConversation.participantNames?.[activeConversation.participants.find(uid => uid !== currentUser?.uid)]?.[0] || 'C'}
                            </div>
                            <div>
                                <h3 className="font-bold">
                                    {activeConversation.participantNames?.[activeConversation.participants.find(uid => uid !== currentUser?.uid)] || 'Customer'}
                                </h3>
                                <p className="text-sm text-gray-500">Customer</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message) => {
                                if (message.type === 'product_context') {
                                    return (
                                        <div key={message.id} className="flex justify-center">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={message.productImage}
                                                        alt="Product"
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-blue-600 font-semibold mb-1">Product Inquiry</p>
                                                        <p className="text-sm text-gray-700">{message.text.replace('Inquiry about: ', '')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                const isMe = message.senderId === currentUser?.uid;
                                return (
                                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md px-4 py-3 rounded-lg ${isMe
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                            }`}>
                                            <p className="text-sm">{message.text}</p>
                                            <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageText.trim()}
                                    className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <i className="fa-solid fa-comments text-6xl mb-4 block"></i>
                            <p className="text-xl">Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistMessagesPage;
