import { showLoading, hideLoading } from './loading.js';

const API_BASE = '../../backend/api/';

export const fetchAPI = async (endpoint, options = {}) => {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    } finally {
        hideLoading();
    }
};