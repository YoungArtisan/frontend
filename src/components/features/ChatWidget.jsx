import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = ({ isOpen, onClose }) => {
    const { activeChatId, sendMessage, getMessages } = useChat();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeChatId) {
            const unsubscribe = getMessages(activeChatId, (msgs) => {
                setMessages(msgs);
            });
            return unsubscribe;
        }
    }, [activeChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageText.trim() && activeChatId) {
            const text = messageText.trim();
            setMessageText(''); // Clear input immediately for UX
            await sendMessage(activeChatId, text);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col z-[1000] border border-gray-100 animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-brand-primary text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        A
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Artist Chat</h3>
                        <p className="text-[10px] text-white/70 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Usually replies in 1h
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-3">
                        <i className="fa-regular fa-comments text-4xl"></i>
                        <p className="text-sm italic">Start a conversation to discuss your customization needs!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        if (message.type === 'product_context') {
                            return (
                                <div key={message.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 max-w-[90%] mx-auto">
                                    <img src={message.productImage} alt="Product" className="w-12 h-12 object-cover rounded-lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mb-0.5">Product Inquiry</p>
                                        <p className="text-xs font-semibold text-text-dark truncate">{message.productTitle}</p>
                                    </div>
                                </div>
                            );
                        }

                        const isMe = message.senderId === currentUser?.uid;
                        return (
                            <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isMe
                                        ? 'bg-brand-primary text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-text-dark rounded-tl-none shadow-sm'
                                    }`}>
                                    <p>{message.text}</p>
                                    <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Ask about materials, colors..."
                        className="w-full bg-gray-50/80 border border-transparent focus:bg-white focus:border-brand-primary/20 rounded-2xl py-3 pl-4 pr-12 text-sm transition-all focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="absolute right-2 w-8 h-8 flex items-center justify-center bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-30"
                    >
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                    <i className="fa-solid fa-shield-halved mr-1"></i>
                    Payments are safe via YoungArtisan
                </p>
            </form>
        </div>
    );
};

export default ChatWidget;
