/* search.js */
export const initSearch = (callback) => {
    const searchForm = document.getElementById('product-search-form');
    const searchInput = document.getElementById('product-search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            callback(searchInput.value);
        });
    }
};

/* filter.js */
export const initCategoryFilter = (callback) => {
    const filterInputs = document.querySelectorAll('input[name="category"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            callback(e.target.value);
        });
    });
};