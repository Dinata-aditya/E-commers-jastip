/**
 * validation.js
 * Form validation untuk halaman add-product dan edit-product.
 */

const showFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    clearFieldError(fieldId);
    field.classList.add('input-error');
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.id = `error-${fieldId}`;
    errorEl.textContent = message;
    field.parentElement.appendChild(errorEl);
};

const clearFieldError = (fieldId) => {
    document.getElementById(fieldId)?.classList.remove('input-error');
    document.getElementById(`error-${fieldId}`)?.remove();
};

export const clearAllErrors = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
};

export const validateProductForm = (formId) => {
    clearAllErrors(formId);
    const name       = document.getElementById('product_name')?.value.trim();
    const categoryId = document.getElementById('category_id')?.value;
    const price      = document.getElementById('price')?.value;
    let isValid = true;

    if (!name || name.length < 3) {
        showFieldError('product_name', 'Nama produk wajib diisi dan minimal 3 karakter.');
        isValid = false;
    } else if (name.length > 150) {
        showFieldError('product_name', 'Nama produk maksimal 150 karakter.');
        isValid = false;
    }

    if (!categoryId) {
        showFieldError('category_id', 'Pilih kategori produk terlebih dahulu.');
        isValid = false;
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
        showFieldError('price', 'Harga harus berupa angka lebih dari 0.');
        isValid = false;
    } else if (Number(price) > 100_000_000) {
        showFieldError('price', 'Harga maksimal Rp 100.000.000.');
        isValid = false;
    }

    return isValid;
};

// Inject validation styles
const injectValidationStyles = () => {
    if (document.getElementById('validation-styles')) return;
    const style = document.createElement('style');
    style.id = 'validation-styles';
    style.textContent = `
        .field-error { display:block; color:#ef4444; font-size:0.8rem; margin-top:5px; font-weight:500; }
        .input-error { border-color:#ef4444 !important; background-color:#fff5f5 !important; }
        .input-error:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.15) !important; }
    `;
    document.head.appendChild(style);
};
injectValidationStyles();
