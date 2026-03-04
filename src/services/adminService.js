import { api } from '../utils/api';

export const adminService = {
  // Product Sync
  syncPrepaid: async () => {
    const response = await api.post('/api/admin/get-product-prepaid');
    return response.data;
  },
  syncPasca: async () => {
    const response = await api.post('/api/admin/get-product-pasca');
    return response.data;
  },

  // Notifications
  sendBroadcast: async (title, body) => {
    const response = await api.post('/api/admin/fcm/all', { title, body });
    return response.data;
  },

  // Account/User Management
  searchUserByPhone: async (phone) => {
    const response = await api.post('/api/user/search-phone', { phone });
    return response.data;
  },
  upgradeToReseller: async (userId) => {
    // Note: The original upgradeToReseller in backend uses Auth::user()
    // but usually admin has a dedicated route. For now we use available.
    const response = await api.post('/api/user/upgrade-reseller');
    return response.data;
  }
};
