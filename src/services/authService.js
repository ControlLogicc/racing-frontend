import apiClient from './apiClient';

export const loginApi = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};