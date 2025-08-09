import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, ArrowLeft, MessageCircle, User, 
  CheckCircle, Clock, MoreVertical, Phone, Video 
} from 'lucide-react';

const MessagingSystem = ({ 
  user, 
  onNavigate, 
  backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001' 
}) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${backendUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const data = await apiCall('/api/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const data = await apiCall(`/api/conversations/${conversationId}/messages`);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await apiCall('/api/direct-messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: selectedConversation.other_participant.id,
          content: newMessage.trim()
        })
      });

      setNewMessage('');
      await fetchMessages(selectedConversation.conversation_id);
      await fetchConversations(); // Refresh conversation list
    } catch (error) {
      alert(`Error sending message: ${error.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await apiCall(`/api/conversations/search?query=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Start new conversation
  const startConversation = async (userId) => {
    try {
      // Send a welcome message to create the conversation
      await apiCall('/api/direct-messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: userId,
          content: 'Hello! 👋'
        })
      });

      // Refresh conversations and select the new one
      await fetchConversations();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      alert(`Error starting conversation: ${error.message}`);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Within a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-black/40 rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 border-r border-gray-700`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-yellow-400" />
              Messages
            </h2>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="border-b border-gray-700 max-h-40 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((searchUser) => (
                <button
                  key={searchUser.id}
                  onClick={() => startConversation(searchUser.id)}
                  className="w-full p-3 hover:bg-gray-700 flex items-center space-x-3 text-left"
                >
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold">
                    {searchUser.profile_picture ? (
                      <img 
                        src={`${backendUrl}${searchUser.profile_picture.file_url || ''}`} 
                        alt={searchUser.full_name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={searchUser.profile_picture ? 'hidden' : ''}>
                      {searchUser.full_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{searchUser.full_name}</div>
                    <div className="text-sm text-gray-400 capitalize flex items-center">
                      {searchUser.role}
                      {searchUser.is_verified && (
                        <CheckCircle className="w-3 h-3 ml-1 text-green-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">No users found</div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  fetchMessages(conversation.conversation_id);
                }}
                className={`w-full p-4 hover:bg-gray-700 flex items-center space-x-3 text-left border-b border-gray-800 ${
                  selectedConversation?.conversation_id === conversation.conversation_id 
                    ? 'bg-gray-700' 
                    : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold">
                    {conversation.other_participant?.profile_picture ? (
                      <img 
                        src={`${backendUrl}${conversation.other_participant.profile_picture.file_url || ''}`} 
                        alt={conversation.other_participant.full_name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={conversation.other_participant?.profile_picture ? 'hidden' : ''}>
                      {conversation.other_participant?.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white truncate">
                      {conversation.other_participant?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {conversation.last_message_content}
                  </div>
                  <div className="text-xs text-gray-500 capitalize flex items-center mt-1">
                    {conversation.other_participant?.role}
                    {conversation.other_participant?.is_verified && (
                      <CheckCircle className="w-3 h-3 ml-1 text-green-400" />
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : !searchQuery ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Search for users above to start chatting</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold">
                {selectedConversation.other_participant?.profile_picture ? (
                  <img 
                    src={`${backendUrl}${selectedConversation.other_participant.profile_picture.file_url || ''}`} 
                    alt={selectedConversation.other_participant.full_name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={selectedConversation.other_participant?.profile_picture ? 'hidden' : ''}>
                  {selectedConversation.other_participant?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">
                  {selectedConversation.other_participant?.full_name || 'Unknown User'}
                </div>
                <div className="text-sm text-gray-400 capitalize flex items-center">
                  {selectedConversation.other_participant?.role}
                  {selectedConversation.other_participant?.is_verified && (
                    <CheckCircle className="w-3 h-3 ml-1 text-green-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700">
                <Phone className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700">
                <Video className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user.id
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-white'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                    message.sender_id === user.id ? 'text-black/70' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(message.created_at)}</span>
                    {message.sender_id === user.id && (
                      message.read ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendingMessage}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-900">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
            <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingSystem;