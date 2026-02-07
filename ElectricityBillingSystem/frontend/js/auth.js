// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingLogin();
        this.setupLoginForm();
        this.setupLogoutButtons(); // Logout buttons setup
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    setupLogoutButtons() {
        const logoutButtons = document.querySelectorAll('[id="logoutBtn"], .logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            });
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Simple validation
        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        // Mock authentication (Replace with actual API call later)
        if (this.authenticateUser(username, password)) {
            this.currentUser = {
                username: username,
                role: username === 'admin' ? 'admin' : 'operator',
                loginTime: new Date().toISOString()
            };

            // Save to localStorage if remember me is checked
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            this.showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            this.showAlert('Invalid username or password', 'error');
        }
    }

    authenticateUser(username, password) {
        // Mock users database (Replace with actual backend later)
        const users = {
            'admin': '123456',
            'operator': '123456'
        };

        return users[username] && users[username] === password;
    }

    checkExistingLogin() {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            // Auto-redirect to dashboard if already logged in
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Show logout message
        this.showAlert('Logout successful!', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add styles
        alert.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});

// Add CSS animations for alerts
const alertStyle = document.createElement('style');
alertStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(alertStyle);