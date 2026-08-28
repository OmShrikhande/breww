import { apiClient } from '../lib/apiClient';

export const getUserProfile = async () => {
  const res = await apiClient('/user/profile');
  return res.data;
};

export const updateSettings = async (settings) => {
  const res = await apiClient('/user/settings', { method: 'PATCH', body: settings });
  return res.data;
};

export const getNotifications = async () => {
  const res = await apiClient('/user/notifications');
  return res.data || [];
};
