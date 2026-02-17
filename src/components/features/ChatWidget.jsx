import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';

const ChatWidget = ({ isOpen, onClose }) => {
    const { activeChatId, getConversation, sendMessage } = useChat();
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);

    const conversation = activeChatId ? getConversation(activeChatId) : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim() && activeChatId) {
            sendMessage(activeChatId, messageText.trim(), 'customer');
            setMessageText('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-brand-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {conversation && (
                        <>
                            <img
                                src={conversation.participants.artistAvatar}
                                alt={conversation.participants.artist}
                                className="w-10 h-10 rounded-full bg-white"
                            />
                            <div>
                                <h3 className="font-bold">{conversation.participants.artist}</h3>
                                <p className="text-xs opacity-90">Artist</p>
                            </div>
                        </>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {conversation?.messages.map((message) => {
                    if (message.type === 'product_context') {
                        return (
                            <div key={message.id} className="flex justify-center">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={message.productImage}
                                            alt="Product"
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-600 font-semibold">Product Inquiry</p>
                                            <p className="text-sm text-gray-700">{message.text.replace('Inquiry about: ', '')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    const isCustomer = message.sender === 'customer';
                    return (
                        <div key={message.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${isCustomer
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}>
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${isCustomer ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWidget;
