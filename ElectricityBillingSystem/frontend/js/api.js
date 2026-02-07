// API Service - Simple Version
const API_BASE = 'http://localhost:5000/api';

class APIService {
    async getConsumers() {
        const response = await fetch(`${API_BASE}/consumers`);
        return await response.json();
    }

    async addConsumer(data) {
        const response = await fetch(`${API_BASE}/consumers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async getBills() {
        const response = await fetch(`${API_BASE}/bills`);
        return await response.json();
    }

    async generateBill(data) {
        const response = await fetch(`${API_BASE}/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async getPayments() {
        const response = await fetch(`${API_BASE}/payments`);
        return await response.json();
    }

    async recordPayment(data) {
        const response = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async getDashboardStats() {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        return await response.json();
    }
}

const apiService = new APIService();