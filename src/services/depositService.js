import { api } from '../utils/api';
import { API_URL } from '../utils/const';

class DepositService {
  constructor() {
    this.baseURL = API_URL;
  }

  async createDeposit(token, data) {
    try {
      // Ensure amount is sent as string as per API requirement
      const payload = {
        amount: String(data.amount)
      };
      const response = await api.post('/api/user/deposit', payload);
      return response.data;
    } catch (error) {
      console.error('Deposit error:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('General error:', error.message);
      }
      throw error;
    }
  }
}

export default new DepositService();