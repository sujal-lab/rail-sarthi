// Global UI Helpers
window.showToast = (msg, type = 'success') => {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="ph-bold ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'} text-2xl"></i><span>${msg}</span>`;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(t);
        setTimeout(() => {
            t.classList.add('fade-out');
            setTimeout(() => t.remove(), 300);
        }, 3000);
    }
};
