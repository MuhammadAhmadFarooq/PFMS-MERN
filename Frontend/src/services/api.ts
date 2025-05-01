const BASE_URL = 'http://localhost:4000/api';

export const api = {
    async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return response.json();
    }
};
