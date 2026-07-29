import { fetchAdminAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const errorBox = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            // Catatan: Karena backend PHP belum ada, ini adalah simulasi logika
            /*
            const response = await fetchAdminAPI('login.php', {
                method: 'POST',
                body: formData
            });
            */
            
            // Simulasi pengecekan lokal sementara agar Anda bisa mencoba masuk dashboard
            const username = formData.get('username');
            const password = formData.get('password');

            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('admin_logged_in', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorBox.textContent = "Username atau password salah! (Hint: admin / admin123)";
                errorBox.style.display = 'block';
            }
        });
    }
});