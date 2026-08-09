/* search.js — Search & Category Filter dengan debounce */

// Debounce helper
const debounce = (fn, delay = 350) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

export const initSearch = (callback) => {
    const searchForm  = document.getElementById('product-search-form');
    const searchInput = document.getElementById('product-search-input');
    if (!searchForm || !searchInput) return;

    // Submit langsung
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        callback(searchInput.value.trim());
    });

    // Debounce saat mengetik
    searchInput.addEventListener('input', debounce(() => {
        callback(searchInput.value.trim());
    }, 350));
};

export const initCategoryFilter = (callback) => {
    // Bind ke existing radio inputs
    const bindRadios = () => {
        document.querySelectorAll('input[name="category"]').forEach(input => {
            input.addEventListener('change', (e) => callback(e.target.value));
        });
    };
    bindRadios();
};
