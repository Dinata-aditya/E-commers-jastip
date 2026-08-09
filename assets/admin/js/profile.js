/**
 * profile.js
 * - Load profil dari store_profile table + user_metadata
 * - Simpan nama, bio, avatar ke store_profile table
 * - Upload foto ke Supabase Storage
 * - Ganti password via Supabase Auth
 */
import { supabase, uploadProductImage } from '../../js/supabase-client.js';
import { getStoreProfile, updateStoreProfile } from './api.js';

/* ── Toast ────────────────────────────────────────────────── */
const showToast = (msg, type = 'success') => {
    const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };
    const t = Object.assign(document.createElement('div'), { textContent: msg });
    Object.assign(t.style, {
        position: 'fixed', bottom: '28px', right: '28px',
        background: colors[type] || colors.success,
        color: '#fff', padding: '13px 22px', borderRadius: '10px',
        fontWeight: '500', fontSize: '0.9rem', zIndex: '9999',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)', opacity: '1',
        transition: 'opacity .4s ease',
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
};

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

    /* 1. Cek session */
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }

    const user  = session.user;
    const email = user.email || '';

    /* 2. Load store_profile dari database */
    const profile = await getStoreProfile();

    const storedName      = profile?.name      || user.user_metadata?.full_name || email.split('@')[0];
    const storedBio       = profile?.bio        || '';
    const storedAvatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName.slice(0,2).toUpperCase())}&background=4F46E5&color=fff&size=128`;
    const storedWa        = profile?.whatsapp   || '6283164959116';

    /* 3. Isi UI */
    const set     = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? ''; };

    set('display-name', storedName);
    set('bio', storedBio);
    set('display-email', email);

    setText('card-display-name', storedName);
    setText('card-email', email);

    const setAvatar = (src) => {
        ['avatar-preview', 'profile-avatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = src;
        });
    };
    setAvatar(storedAvatarUrl);

    /* 4. Preview avatar sebelum upload */
    const avatarInput = document.getElementById('avatar-input');
    avatarInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran foto maksimal 2MB.', 'warning');
            avatarInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatar(ev.target.result);
        reader.readAsDataURL(file);
    });

    /* 5. Simpan profil → store_profile table */
    document.getElementById('form-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-profile');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        try {
            const newName = document.getElementById('display-name').value.trim();
            const newBio  = document.getElementById('bio').value.trim();
            let   newAvatarUrl = storedAvatarUrl;

            /* Upload foto baru jika ada */
            const file = avatarInput?.files[0];
            if (file) {
                const uploaded = await uploadProductImage(file);
                if (uploaded) {
                    newAvatarUrl = uploaded;
                } else {
                    showToast('Gagal upload foto.', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Profil';
                    return;
                }
            }

            /* Simpan ke store_profile */
            await updateStoreProfile({
                name:       newName,
                bio:        newBio,
                avatar_url: newAvatarUrl,
                email:      email,
            });

            /* Update user_metadata juga agar topbar ikut update */
            await supabase.auth.updateUser({
                data: { full_name: newName, name: newName, avatar_url: newAvatarUrl }
            });

            /* Update UI */
            setText('card-display-name', newName);
            setAvatar(newAvatarUrl);
            showToast('Profil berhasil disimpan!');

        } catch (err) {
            showToast(err.message || 'Gagal menyimpan profil.', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Profil';
        }
    });

    /* 6. Ganti password */
    document.getElementById('form-password')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn         = document.getElementById('btn-save-password');
        const newPass     = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (newPass.length < 8) {
            showToast('Password minimal 8 karakter.', 'warning');
            return;
        }
        if (newPass !== confirmPass) {
            showToast('Konfirmasi password tidak cocok.', 'danger');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        const { error } = await supabase.auth.updateUser({ password: newPass });

        if (error) {
            showToast(error.message || 'Gagal update password.', 'danger');
        } else {
            showToast('Password berhasil diperbarui!');
            document.getElementById('form-password').reset();
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-key"></i> Update Password';
    });

    /* 7. Toggle show/hide password */
    const togglePass = (btnId, inputId, iconId) => {
        document.getElementById(btnId)?.addEventListener('click', () => {
            const input = document.getElementById(inputId);
            const icon  = document.getElementById(iconId);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            if (icon) icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        });
    };
    togglePass('toggle-new-pass',     'new-password',     'icon-new-pass');
    togglePass('toggle-confirm-pass', 'confirm-password', 'icon-confirm-pass');

    /* 8. Logout mobile */
    document.getElementById('btn-logout-mobile')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin keluar?')) {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }
    });
});
