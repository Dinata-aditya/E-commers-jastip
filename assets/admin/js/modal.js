export const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
};

export const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
};

export const initModalCloseEvents = () => {
    const closeButtons = document.querySelectorAll('.close-modal, .cancel-delete');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('show');
        });
    });
};