const BASE_URL = 'http://localhost:8082/api';

const getHeaders = () => {
    const token = localStorage.getItem('chatToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json, text/plain, */*'
    };
};

export const api = {
    get: async (endpoint) => {
        const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Fetch failed');
        
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    },
    post: async (endpoint, body, method = 'POST') => {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Action failed');

        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }
};
