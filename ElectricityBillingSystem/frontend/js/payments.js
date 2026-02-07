// Payments Management System
class PaymentsManager {
    constructor() {
        this.payments = [];
        this.bills = [];
        this.filteredPayments = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.paymentMethodFilter = '';
        this.monthFilter = '';
        this.dateFilter = '';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadPayments();
        this.loadBills();
        this.setupEventListeners();
        this.initializeDateFilters();
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!savedUser) {
            window.location.href = 'login.html';
            return;
        }
    }

    async loadPayments() {
        this.showLoadingState();

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock data - Replace with actual API call later
            this.payments = this.generateMockPayments(25);
            this.applyFilters();
            this.renderPaymentsTable();
            this.updatePagination();
            this.updateStats();
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading payments:', error);
            this.showError('Failed to load payments data');
            this.hideLoadingState();
        }
    }

    async loadBills() {
        // Mock bills data - In real app, fetch from API
        this.bills = [
            { id: 1, billId: 'BILL0001', consumerName: 'Rahul Sharma', amount: 1250, dueDate: '2024-03-31', status: 'Pending' },
            { id: 2, billId: 'BILL0002', consumerName: 'Priya Singh', amount: 4248, dueDate: '2024-03-31', status: 'Pending' },
            { id: 3, billId: 'BILL0003', consumerName: 'Amit Kumar', amount: 282, dueDate: '2024-03-31', status: 'Pending' },
            { id: 4, billId: 'BILL0004', consumerName: 'Sneha Patel', amount: 1560, dueDate: '2024-04-15', status: 'Pending' },
            { id: 5, billId: 'BILL0005', consumerName: 'Raj Verma', amount: 2890, dueDate: '2024-04-15', status: 'Pending' }
        ];

        this.populateBillFilters();
    }

    generateMockPayments(count) {
        const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking'];
        const bills = [
            { id: 1, billId: 'BILL0001', consumerName: 'Rahul Sharma' },
            { id: 2, billId: 'BILL0002', consumerName: 'Priya Singh' },
            { id: 3, billId: 'BILL0003', consumerName: 'Amit Kumar' }
        ];

        return Array.from({ length: count }, (_, i) => {
            const bill = bills[i % bills.length];
            const paymentDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const method = paymentMethods[i % paymentMethods.length];
            const amount = Math.floor(Math.random() * 5000) + 500;

            return {
                id: i + 1,
                paymentId: `PAY${String(i + 1).padStart(4, '0')}`,
                billId: bill.billId,
                consumerName: bill.consumerName,
                paymentDate: paymentDate.toISOString().split('T')[0],
                amount: amount,
                paymentMethod: method,
                transactionId: method === 'Cash' ? 'N/A' : `TXN${String(i + 1).padStart(6, '0')}`,
                receivedBy: ['Admin', 'Operator'][i % 2],
                notes: i % 3 === 0 ? 'Paid in full' : ''
            };
        });
    }

    populateBillFilters() {
        const paymentBill = document.getElementById('paymentBill');
        
        if (paymentBill) {
            paymentBill.innerHTML = '<option value="">Select Bill</option>' +
                this.bills.map(bill => 
                    `<option value="${bill.id}" data-consumer="${bill.consumerName}" data-amount="${bill.amount}" data-due="${bill.dueDate}">
                        ${bill.billId} - ${bill.consumerName} - ₹${bill.amount}
                    </option>`
                ).join('');
        }
    }

    applyFilters() {
        this.filteredPayments = this.payments.filter(payment => {
            const matchesSearch = !this.searchTerm || 
                payment.consumerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                payment.paymentId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                payment.billId.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesPaymentMethod = !this.paymentMethodFilter || 
                payment.paymentMethod === this.paymentMethodFilter;

            const matchesMonth = !this.monthFilter || 
                payment.paymentDate.startsWith(this.monthFilter);

            const matchesDate = !this.dateFilter || 
                payment.paymentDate === this.dateFilter;

            return matchesSearch && matchesPaymentMethod && matchesMonth && matchesDate;
        });
    }

    renderPaymentsTable() {
        const tbody = document.getElementById('paymentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');

        if (this.filteredPayments.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
            loadingState.classList.add('d-none');
            this.updatePaymentsCount();
            return;
        }

        emptyState.classList.add('d-none');
        loadingState.classList.add('d-none');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPayments = this.filteredPayments.slice(startIndex, endIndex);

        tbody.innerHTML = currentPayments.map(payment => `
            <tr>
                <td>
                    <strong>${payment.paymentId}</strong>
                </td>
                <td>
                    <span class="badge bg-secondary">${payment.billId}</span>
                </td>
                <td>
                    <div class="fw-bold">${payment.consumerName}</div>
                </td>
                <td>${this.formatDate(payment.paymentDate)}</td>
                <td>
                    <strong class="text-success">₹${payment.amount.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="badge ${this.getPaymentMethodBadgeClass(payment.paymentMethod)}">
                        <i class="fas ${this.getPaymentMethodIcon(payment.paymentMethod)} me-1"></i>
                        ${payment.paymentMethod}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${payment.transactionId}</small>
                </td>
                <td>
                    <span class="badge bg-info">${payment.receivedBy}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="paymentsManager.viewPayment(${payment.id})" 
                                title="View Payment">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="paymentsManager.editPayment(${payment.id})" 
                                title="Edit Payment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="paymentsManager.deletePayment(${payment.id})" 
                                title="Delete Payment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePaymentsCount();
    }

    getPaymentMethodBadgeClass(method) {
        const classes = {
            'Cash': 'bg-success',
            'Card': 'bg-primary',
            'UPI': 'bg-info',
            'Net Banking': 'bg-warning'
        };
        return classes[method] || 'bg-secondary';
    }

    getPaymentMethodIcon(method) {
        const icons = {
            'Cash': 'fa-money-bill',
            'Card': 'fa-credit-card',
            'UPI': 'fa-mobile-alt',
            'Net Banking': 'fa-laptop'
        };
        return icons[method] || 'fa-money-bill';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN');
    }

    updatePaymentsCount() {
        const countElement = document.getElementById('filteredPaymentsCount');
        if (countElement) {
            countElement.textContent = `${this.filteredPayments.length} payments`;
        }
    }

    updateStats() {
        const totalRevenue = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalPayments = this.payments.length;
        const pendingBills = this.bills.filter(bill => bill.status === 'Pending').length;
        const collectionRate = this.bills.length > 0 ? 
            Math.round((this.payments.length / this.bills.length) * 100) : 0;

        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('totalPayments').textContent = totalPayments;
        document.getElementById('pendingPayments').textContent = pendingBills;
        document.getElementById('collectionRate').textContent = `${collectionRate}%`;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredPayments.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="paymentsManager.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="paymentsManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="paymentsManager.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredPayments.length / this.itemsPerPage)) return;
        
        this.currentPage = page;
        this.renderPaymentsTable();
        this.updatePagination();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('paymentsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderPaymentsTable();
                this.updatePagination();
            });
        }

        // Payment method filter
        const paymentMethodFilter = document.getElementById('paymentMethodFilter');
        if (paymentMethodFilter) {
            paymentMethodFilter.addEventListener('change', (e) => {
                this.paymentMethodFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderPaymentsTable();
                this.updatePagination();
            });
        }

        // Month filter
        const monthFilter = document.getElementById('monthFilter');
        if (monthFilter) {
            monthFilter.addEventListener('change', (e) => {
                this.monthFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderPaymentsTable();
                this.updatePagination();
            });
        }

        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.dateFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderPaymentsTable();
                this.updatePagination();
            });
        }

        // Bill selection
        const paymentBill = document.getElementById('paymentBill');
        if (paymentBill) {
            paymentBill.addEventListener('change', (e) => {
                const selectedOption = paymentBill.options[paymentBill.selectedIndex];
                if (selectedOption.value) {
                    document.getElementById('consumerInfo').value = selectedOption.getAttribute('data-consumer');
                    document.getElementById('billAmount').value = `₹${selectedOption.getAttribute('data-amount')}`;
                    document.getElementById('dueDate').value = this.formatDate(selectedOption.getAttribute('data-due'));
                    document.getElementById('paymentAmount').value = selectedOption.getAttribute('data-amount');
                } else {
                    document.getElementById('consumerInfo').value = '';
                    document.getElementById('billAmount').value = '';
                    document.getElementById('dueDate').value = '';
                    document.getElementById('paymentAmount').value = '';
                }
            });
        }

        // Record payment button
        const recordPaymentBtn = document.getElementById('recordPaymentBtn');
        if (recordPaymentBtn) {
            recordPaymentBtn.addEventListener('click', () => {
                this.recordNewPayment();
            });
        }

        // Export payments button
        const exportPaymentsBtn = document.getElementById('exportPaymentsBtn');
        if (exportPaymentsBtn) {
            exportPaymentsBtn.addEventListener('click', () => {
                this.exportPayments();
            });
        }
    }

    initializeDateFilters() {
        // Set current month as default
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        document.getElementById('monthFilter').value = currentMonth;
        this.monthFilter = currentMonth;

        // Set payment date to today
        document.getElementById('paymentDate').valueAsDate = now;
    }

    recordNewPayment() {
        const form = document.getElementById('recordPaymentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const billId = document.getElementById('paymentBill').value;
        const bill = this.bills.find(b => b.id == billId);
        
        if (!bill) {
            this.showToast('Please select a valid bill', 'error');
            return;
        }

        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
        const billAmount = parseFloat(bill.amount);

        if (paymentAmount > billAmount) {
            this.showToast('Payment amount cannot exceed bill amount', 'error');
            return;
        }

        const newPayment = {
            id: this.payments.length + 1,
            paymentId: `PAY${String(this.payments.length + 1).padStart(4, '0')}`,
            billId: bill.billId,
            consumerName: bill.consumerName,
            paymentDate: document.getElementById('paymentDate').value,
            amount: paymentAmount,
            paymentMethod: document.getElementById('paymentMethod').value,
            transactionId: document.getElementById('transactionId').value || 'N/A',
            receivedBy: document.getElementById('receivedBy').value,
            notes: document.getElementById('paymentNotes').value
        };

        // Update bill status if paid in full
        if (paymentAmount === billAmount) {
            bill.status = 'Paid';
        }

        this.payments.unshift(newPayment);
        this.applyFilters();
        this.renderPaymentsTable();
        this.updatePagination();
        this.updateStats();

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('recordPaymentModal'));
        modal.hide();
        form.reset();
        this.initializeDateFilters();

        this.showToast('Payment recorded successfully!', 'success');
    }

    viewPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            this.showToast(`Viewing payment: ${payment.paymentId}`, 'info');
            // In real app, would show payment details modal
        }
    }

    editPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            this.showToast(`Editing payment: ${payment.paymentId}`, 'warning');
            // In real app, would open edit modal
        }
    }

    deletePayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment && confirm(`Are you sure you want to delete payment: ${payment.paymentId}?`)) {
            this.payments = this.payments.filter(p => p.id !== paymentId);
            this.applyFilters();
            this.renderPaymentsTable();
            this.updatePagination();
            this.updateStats();
            this.showToast('Payment deleted successfully!', 'success');
        }
    }

    exportPayments() {
        this.showToast('Exporting payments data...', 'info');
        // In real app, would generate and download CSV/Excel file
    }

    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('paymentsTableBody');
        
        if (loadingState) loadingState.classList.remove('d-none');
        if (emptyState) emptyState.classList.add('d-none');
        if (tbody) tbody.innerHTML = '';
    }

    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.classList.add('d-none');
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

// Initialize payments manager
let paymentsManager;
document.addEventListener('DOMContentLoaded', () => {
    paymentsManager = new PaymentsManager();
});