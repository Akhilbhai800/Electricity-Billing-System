// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light-theme';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    applyTheme(theme) {
        document.body.className = theme;
        this.updateThemeToggle(theme);
        localStorage.setItem('theme', theme);
    }

    updateThemeToggle(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark-theme') {
                icon.className = 'fas fa-sun';
                themeToggle.title = 'Switch to Light Mode';
            } else {
                icon.className = 'fas fa-moon';
                themeToggle.title = 'Switch to Dark Mode';
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        this.applyTheme(this.currentTheme);
        
        // Show theme change notification
        this.showThemeNotification();
    }

    showThemeNotification() {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.innerHTML = `
            <i class="fas fa-palette me-2"></i>
            Switched to ${this.currentTheme === 'dark-theme' ? 'Dark' : 'Light'} Mode
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);