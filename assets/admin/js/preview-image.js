export const initImagePreview = (inputId, previewContainerId, previewImgId) => {
    const fileInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewContainerId);
    const previewImg = document.getElementById(previewImgId);
    const uploadArea = document.getElementById('upload-area');
    const removeBtn = document.getElementById('remove-image-btn');

    if (fileInput && previewContainer && previewImg) {
        // Saat file dipilih
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewContainer.style.display = 'block';
                    if (uploadArea) uploadArea.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });

        // Saat tombol "Hapus Foto" diklik
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                fileInput.value = ''; // Kosongkan file
                previewImg.src = '';
                previewContainer.style.display = 'none';
                if (uploadArea) uploadArea.style.display = 'flex';
            });
        }
    }
};