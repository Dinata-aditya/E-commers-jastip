const API_BASE = '../../backend/api/';

export const showLoading = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'flex';
};

export const hideLoading = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
};

export const fetchAdminAPI = async (endpoint, options = {}) => {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Admin API Error:", error);
        return null;
    } finally {
        hideLoading();
    }
};