import api from '../api/api.js';

export const getGroupById = async (groupId) => {
  const response = await api.get(`/group/${groupId}`);
  return response.data;
};

export const updateGroup = async (groupId, groupData) => {
  const response = await api.put(`/group/${groupId}`, groupData);
  return response.data;
};

export const removeGroupMember = async (groupId, userId) => {
  const response = await api.delete(`/group/${groupId}/member/${userId}`);
  return response.data;
};
