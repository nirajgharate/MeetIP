import api from '../api/api';

// GET all chats for the authenticated user
export const getUserChats = async () => {
  const res = await api.get('/chat');
  return res.data;
};

// POST to create a new chat or retrieve an existing one
export const createChat = async (receiverId) => {
  const res = await api.post('/chat', { receiverId });
  return res.data;
};

// ✅ UPDATED: Support for both Text and File (FormData)
export const sendMessage = async (chatId, data) => {
  // If 'data' is FormData (from Step 12.4), we send it directly.
  // Axios will automatically handle the 'multipart/form-data' headers.
  const res = await api.post('/chat/message', data);
  return res.data;
};

// GET all messages for a specific chat node
export const getMessages = async (chatId) => {
  const res = await api.get(`/chat/message/${chatId}`);
  return res.data;
};

// ✅ UPDATED: Update message status to 'seen'
export const markMessagesAsSeen = async (chatId) => {
  // Matching the endpoint structure for message status updates
  const res = await api.post(`/chat/message/seen/${chatId}`);
  return res.data;
};

// Create a new group chat
export const createGroup = async (groupData) => {
  const res = await api.post('/chat/group', groupData);
  return res.data;
};