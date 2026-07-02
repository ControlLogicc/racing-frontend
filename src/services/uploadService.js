import api from './api';

// POST /api/uploads/images — OWNER, JOCKEY, ADMIN, STAFF
// Response: { imageUrl: "/uploads/images/{uuid}.{ext}" } — path tương đối, phục vụ qua static resource /uploads/images/**
export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/uploads/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
