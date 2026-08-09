/**
 * multi-image-upload.js
 * Mengelola upload hingga 5 gambar per produk dengan fitur crop.
 * Menggunakan Cropper.js (dimuat via CDN di HTML).
 */

const MAX_IMAGES = 5;
const MAX_SIZE   = 1200; // px — sisi terpanjang
const QUALITY    = 0.85; // 85% kualitas JPEG

/* ── Auto Compress ───────────────────────────────────────── */
/**
 * Resize + compress gambar ke maks 1200px, quality 85%.
 * @param {File} file
 * @returns {Promise<File>} File terkompresi
 */
const compressImage = (file) => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // Hitung dimensi baru — pertahankan aspect ratio
            if (width > MAX_SIZE || height > MAX_SIZE) {
                if (width >= height) {
                    height = Math.round((height / width) * MAX_SIZE);
                    width  = MAX_SIZE;
                } else {
                    width  = Math.round((width / height) * MAX_SIZE);
                    height = MAX_SIZE;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width  = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; } // fallback ke original
                const compressed = new File(
                    [blob],
                    file.name.replace(/\.[^.]+$/, '.jpg'),
                    { type: 'image/jpeg' }
                );
                resolve(compressed);
            }, 'image/jpeg', QUALITY);
        };

        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
};

// State: array of { file: File|null, url: string|null, cropped: Blob|null, isExisting: bool }
let imageSlots = [];
let cropperInstance = null;
let activeCropIndex = null;

/* ── Public API ──────────────────────────────────────────── */

/**
 * Init multi-image upload UI.
 * @param {string[]} existingUrls - URL gambar yang sudah ada (saat edit)
 */
export const initMultiImageUpload = (existingUrls = []) => {
    imageSlots = [];

    // Isi slot dengan gambar existing
    existingUrls.forEach(url => {
        if (imageSlots.length < MAX_IMAGES) {
            imageSlots.push({ file: null, url, cropped: null, isExisting: true });
        }
    });

    renderSlots();
    bindCropModal();
};

/**
 * Ambil array File/Blob yang siap diupload (gambar baru/cropped).
 * Gambar existing dikembalikan sebagai null (tidak perlu re-upload).
 * @returns {{ slots: Array, existingUrls: string[] }}
 */
export const getImageData = () => {
    const newFiles  = imageSlots.map(s => s.cropped || s.file);  // Blob atau File
    const existingUrls = imageSlots
        .filter(s => s.isExisting && s.url)
        .map(s => s.url);
    return { newFiles, existingUrls };
};

/**
 * Ambil jumlah gambar saat ini.
 */
export const getImageCount = () => imageSlots.length;

/* ── Render ──────────────────────────────────────────────── */
const renderSlots = () => {
    const grid = document.getElementById('multi-image-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Render slot yang sudah terisi
    imageSlots.forEach((slot, i) => {
        const div = document.createElement('div');
        div.className = 'img-slot filled';
        div.innerHTML = `
            <img src="${slot.url || URL.createObjectURL(slot.file)}" alt="Foto ${i + 1}">
            ${i === 0 ? '<span class="main-badge">Utama</span>' : ''}
            <div class="slot-actions">
                <button type="button" class="slot-btn crop-btn" data-index="${i}" title="Crop">
                    <i class="fa-solid fa-crop-simple"></i>
                </button>
                <button type="button" class="slot-btn remove-btn" data-index="${i}" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(div);
    });

    // Render tombol tambah jika belum penuh
    if (imageSlots.length < MAX_IMAGES) {
        const addDiv = document.createElement('div');
        addDiv.className = 'img-slot add-slot';
        addDiv.innerHTML = `
            <input type="file" id="multi-file-input" accept="image/jpeg,image/png,image/webp" multiple class="hidden-input">
            <label for="multi-file-input" class="add-slot-label">
                <i class="fa-solid fa-plus"></i>
                <span>Tambah Foto</span>
                <small>${imageSlots.length}/${MAX_IMAGES}</small>
            </label>
        `;
        grid.appendChild(addDiv);
        // Bind file input
        const fileInput = document.getElementById('multi-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
    }

    // Bind crop & remove buttons
    grid.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', () => openCropper(Number(btn.dataset.index)));
    });
    grid.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeSlot(Number(btn.dataset.index)));
    });
};

/* ── File Select ─────────────────────────────────────────── */
const handleFileSelect = async (e) => {
    const files   = Array.from(e.target.files);
    const remaining = MAX_IMAGES - imageSlots.length;
    const toAdd   = files.slice(0, remaining);

    for (const file of toAdd) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" terlalu besar. Maks 10MB.`);
            continue;
        }

        // Auto compress sebelum masuk slot
        const compressed = await compressImage(file);
        imageSlots.push({
            file:       compressed,
            url:        URL.createObjectURL(compressed),
            cropped:    null,
            isExisting: false,
        });
    }

    e.target.value = '';
    renderSlots();
};

/* ── Remove ──────────────────────────────────────────────── */
const removeSlot = (index) => {
    imageSlots.splice(index, 1);
    renderSlots();
};

/* ── Crop Modal ──────────────────────────────────────────── */
const openCropper = (index) => {
    activeCropIndex = index;
    const slot = imageSlots[index];
    const src = slot.url || (slot.file ? URL.createObjectURL(slot.file) : null);
    if (!src) return;

    const modal = document.getElementById('crop-modal');
    const cropImg = document.getElementById('crop-image');
    if (!modal || !cropImg) return;

    cropImg.src = src;
    modal.classList.add('active');

    // Destroy existing cropper
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }

    // Init Cropper.js setelah gambar load
    cropImg.onload = () => {
        cropperInstance = new Cropper(cropImg, {
            aspectRatio: 1,        // Square default
            viewMode: 2,
            autoCropArea: 0.9,
            movable: true,
            zoomable: true,
            rotatable: true,
            scalable: false,
        });
    };
};

const bindCropModal = () => {
    const modal       = document.getElementById('crop-modal');
    const btnConfirm  = document.getElementById('btn-crop-confirm');
    const btnCancel   = document.getElementById('btn-crop-cancel');
    const btnFree     = document.getElementById('btn-ratio-free');
    const btn11       = document.getElementById('btn-ratio-1-1');
    const btn43       = document.getElementById('btn-ratio-4-3');
    const btnRotL     = document.getElementById('btn-rotate-left');
    const btnRotR     = document.getElementById('btn-rotate-right');

    if (!modal) return;

    btnCancel?.addEventListener('click', closeCropModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCropModal();
    });

    // Ratio buttons
    btnFree?.addEventListener('click', () => cropperInstance?.setAspectRatio(NaN));
    btn11?.addEventListener('click',   () => cropperInstance?.setAspectRatio(1));
    btn43?.addEventListener('click',   () => cropperInstance?.setAspectRatio(4 / 3));

    // Rotate
    btnRotL?.addEventListener('click', () => cropperInstance?.rotate(-90));
    btnRotR?.addEventListener('click', () => cropperInstance?.rotate(90));

    // Confirm crop
    btnConfirm?.addEventListener('click', () => {
        if (!cropperInstance || activeCropIndex === null) return;

        const canvas = cropperInstance.getCroppedCanvas({ width: 800, height: 800, imageSmoothingQuality: 'high' });
        canvas.toBlob(blob => {
            if (!blob) return;
            // Beri nama pada Blob agar upload bisa deteksi extension
            const namedBlob = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const slot = imageSlots[activeCropIndex];
            slot.cropped = namedBlob;
            slot.url     = URL.createObjectURL(namedBlob);
            slot.isExisting = false;
            closeCropModal();
            renderSlots();
        }, 'image/jpeg', 0.88);
    });
};

const closeCropModal = () => {
    const modal = document.getElementById('crop-modal');
    modal?.classList.remove('active');
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
    activeCropIndex = null;
};
