import { api } from '../utils/api';
import { Platform } from 'react-native';

class AppConfigService {
  async checkVersion() {
    try {
      const platform = Platform.OS; // 'android' or 'ios'
      const response = await api.get(`/api/app-config/version-check?platform=${platform}`);
      return response.data;
    } catch (error) {
      console.error('Check version error:', error);
      throw error;
    }
  }
}

export default new AppConfigService();
