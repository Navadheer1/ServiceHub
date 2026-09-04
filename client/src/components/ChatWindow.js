import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, X, MoreVertical, Phone, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({ bookingId, onClose, socket }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  const currentUserId = user?._id;

  useEffect(() => {
    fetchChatRoom();
  }, [bookingId]);

  useEffect(() => {
    if (chatRoom && socket) {
      socket.emit('join_chat', chatRoom._id);

      socket.on('receive_message', (message) => {
        if (message.chatRoomId === chatRoom._id) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [chatRoom, socket]);

  const fetchChatRoom = async () => {
    try {
      setLoading(true);
      const { data: roomData } = await api.get(`/chat/room/${bookingId}`);
      setChatRoom(roomData);

      const { data: messagesData } = await api.get(`/chat/messages/${roomData._id}`);
      setMessages(messagesData);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat:', err);
      setError(err.response?.data?.message || 'Could not load chat');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom) return;

    try {
      const { data } = await api.post('/chat/message', {
        chatRoomId: chatRoom._id,
        message: newMessage
      });
      // Socket will handle the update
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  if (loading) return (
    <div className="flex h-[550px] w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white shadow-2xl border border-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="flex h-[550px] w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={onClose} className="mt-4 text-sm font-semibold text-gray-900 hover:underline">Close</button>
    </div>
  );

  return (
    <div className="flex h-[550px] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 font-sans">
      {/* Header - Instagram/Rapido Style */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
            {/* Avatar Placeholder */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-sm">
                {user?.role === 'user' ? 'A' : 'U'}
            </div>
            <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {user?.role === 'user' ? 'Service Agent' : 'Customer'}
                </h3>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    ● Active now
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-50">
                <Phone className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-50">
                <Info className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="rounded-full p-2 text-gray-900 hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white p-4 space-y-1">
        {messages.map((msg, index) => {
          const message = {
            ...msg,
            text: msg.text || msg.message,
            senderId: msg.senderId,
            createdAt: msg.createdAt || msg.timestamp
          };
          
          // LOGIC: Determine if message is from me based on ID and Role
          const myId = String(currentUserId || "");
          const senderId = String(message.senderId || "");
          
          let isMe = false;
          
          // 1. Strict ID Check
          if (myId && senderId && myId === senderId) {
            isMe = true;
          } 
          // 2. Fallback Role Check (Safe for 1-on-1 User-Agent chats)
          else if (user?.role && message.senderType) {
             const myRole = user.role.toUpperCase(); // 'USER' or 'AGENT'
             const msgRole = String(message.senderType).toUpperCase(); 
             if (myRole === msgRole) {
                isMe = true;
             }
          }

          // DEBUG: Uncomment to see values in console
          // console.log(`Msg: ${message.text} | Sender: ${senderId} | Me: ${myId} | isMe: ${isMe}`);

          return (
             <div key={index} className={`flex w-full mb-2 ${isMe ? "justify-end" : "justify-start items-end"}`}> 
               
               {/* Avatar for received messages (Left side) */}
               {!isMe && (
                 <div className="flex-shrink-0 mr-2 mb-1">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {user?.role === 'user' ? 'A' : 'U'}
                    </div>
                 </div>
               )}

               <div 
                 className={`max-w-[75%] px-5 py-3 text-[15px] leading-relaxed relative shadow-sm
                   ${isMe 
                     ? "bg-black text-white rounded-3xl rounded-br-md ml-auto" 
                     : "bg-gray-100 text-gray-900 rounded-3xl rounded-bl-md mr-auto" 
                   }`} 
               > 
                 <p>{message.text}</p>
               </div> 
             </div> 
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {chatRoom?.chatStatus === 'ACTIVE' ? (
        <div className="p-3 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-2 shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors">
                     <MoreVertical className="h-5 w-5" />
                </div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-sm font-medium px-2"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Send className="h-4 w-4 ml-0.5" />
                </button>
            </form>
        </div>
      ) : (
          <div className="border-t border-gray-100 bg-gray-50 p-4 text-center text-sm font-medium text-gray-500">
              Chat session ended.
          </div>
      )}
    </div>
  );
}