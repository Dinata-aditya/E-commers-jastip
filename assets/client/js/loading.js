export const showLoading = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'flex';
};

export const hideLoading = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
};