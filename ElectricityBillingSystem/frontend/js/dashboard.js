// Dashboard Management System with Backend
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadDashboardData();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!savedUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = JSON.parse(savedUser);
        this.updateUserInterface();
    }

    updateUserInterface() {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.username;
        }
    }

    async loadDashboardData() {
        this.showLoadingState();

        try {
            // Load stats from backend
            this.stats = await apiService.getDashboardStats();
            
            // Load additional data
            const [consumers, bills, payments] = await Promise.all([
                apiService.getConsumers(),
                apiService.getBills(),
                apiService.getPayments()
            ]);

            this.stats.consumers = consumers;
            this.stats.bills = bills;
            this.stats.payments = payments;

            this.updateDashboardStats();
            this.updateRecentActivity();
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
            this.hideLoadingState();
        }
    }

    updateDashboardStats() {
        // Update stats cards with REAL data from backend
        document.getElementById('totalConsumers').textContent = this.stats.total_consumers?.toLocaleString() || '0';
        document.getElementById('totalBills').textContent = this.stats.total_bills?.toLocaleString() || '0';
        document.getElementById('totalRevenue').textContent = `₹${(this.stats.total_revenue / 1000).toFixed(1)}K` || '₹0';
        document.getElementById('pendingBills').textContent = this.stats.pending_bills?.toLocaleString() || '0';

        this.animateStats();
    }

    animateStats() {
        const statsElements = [
            'totalConsumers',
            'totalBills', 
            'totalRevenue',
            'pendingBills'
        ];

        statsElements.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.5s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }

    updateRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList || !this.stats.payments) return;

        // Show recent payments as activity
        const recentPayments = this.stats.payments.slice(0, 4);
        
        activityList.innerHTML = recentPayments.map(payment => {
            const timeAgo = this.getTimeAgo(payment.payment_date);
            return `
                <div class="activity-item">
                    <div class="activity-icon bg-success">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="activity-content">
                        <h6>Payment received from ${payment.consumer_name}</h6>
                        <p>Amount: ₹${payment.amount_paid} • ${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');

        // If no payments, show default message
        if (recentPayments.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon bg-info">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <h6>No recent activity</h6>
                        <p>Payments will appear here when recorded</p>
                    </div>
                </div>
            `;
        }
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Quick action buttons
        this.setupQuickActions();
    }

    setupQuickActions() {
        const quickActions = document.querySelectorAll('.quick-action-item');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                const actionText = action.querySelector('span').textContent;
                this.showToast(`Navigating to ${actionText}...`, 'info');
                
                setTimeout(() => {
                    const href = action.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                }, 500);
            });
        });
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            this.showToast('Logout successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    showLoadingState() {
        const statsCards = document.querySelectorAll('.stats-card h3');
        statsCards.forEach(card => {
            card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    }

    hideLoadingState() {
        const spinners = document.querySelectorAll('.fa-spinner');
        spinners.forEach(spinner => {
            spinner.remove();
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1060;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showError(message) {
        this.showToast(message, 'error');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});