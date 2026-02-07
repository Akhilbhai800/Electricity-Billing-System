// Bills Management System
class BillsManager {
    constructor() {
        this.bills = [];
        this.consumers = [];
        this.filteredBills = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.statusFilter = '';
        this.monthFilter = '';
        this.consumerFilter = '';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadBills();
        this.loadConsumers();
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

    async loadBills() {
        this.showLoadingState();

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock data - Replace with actual API call later
            this.bills = this.generateMockBills(30);
            this.applyFilters();
            this.renderBillsTable();
            this.updatePagination();
            this.updateStats();
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading bills:', error);
            this.showError('Failed to load bills data');
            this.hideLoadingState();
        }
    }

    async loadConsumers() {
        // Mock consumers data - In real app, fetch from API
        this.consumers = [
            { id: 1, name: 'Rahul Sharma', meterNumber: 'MET0001', connectionType: 'Domestic' },
            { id: 2, name: 'Priya Singh', meterNumber: 'MET0002', connectionType: 'Commercial' },
            { id: 3, name: 'Amit Kumar', meterNumber: 'MET0003', connectionType: 'Domestic' },
            { id: 4, name: 'Sneha Patel', meterNumber: 'MET0004', connectionType: 'Domestic' },
            { id: 5, name: 'Raj Verma', meterNumber: 'MET0005', connectionType: 'Commercial' }
        ];

        this.populateConsumerFilters();
    }

    generateMockBills(count) {
        const statuses = ['Paid', 'Pending', 'Overdue'];
        const consumers = [
            { id: 1, name: 'Rahul Sharma', meterNumber: 'MET0001' },
            { id: 2, name: 'Priya Singh', meterNumber: 'MET0002' },
            { id: 3, name: 'Amit Kumar', meterNumber: 'MET0003' },
            { id: 4, name: 'Sneha Patel', meterNumber: 'MET0004' },
            { id: 5, name: 'Raj Verma', meterNumber: 'MET0005' }
        ];

        return Array.from({ length: count }, (_, i) => {
            const consumer = consumers[i % consumers.length];
            const billDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            const dueDate = new Date(billDate.getTime() + 15 * 24 * 60 * 60 * 1000);
            const status = statuses[i % statuses.length];
            const units = Math.floor(Math.random() * 500) + 50;
            const amount = this.calculateBillAmount(units, consumer.connectionType);

            return {
                id: i + 1,
                billId: `BILL${String(i + 1).padStart(4, '0')}`,
                consumerId: consumer.id,
                consumerName: consumer.name,
                meterNumber: consumer.meterNumber,
                billDate: billDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                previousReading: Math.floor(Math.random() * 1000),
                currentReading: Math.floor(Math.random() * 1000) + 1000,
                unitsConsumed: units,
                amount: amount,
                status: status,
                connectionType: consumer.connectionType || 'Domestic'
            };
        });
    }

    calculateBillAmount(units, connectionType) {
        let amount = 0;
        
        if (connectionType === 'Domestic') {
            if (units <= 100) {
                amount = units * 3.0;
            } else if (units <= 300) {
                amount = 100 * 3.0 + (units - 100) * 5.0;
            } else {
                amount = 100 * 3.0 + 200 * 5.0 + (units - 300) * 7.0;
            }
        } else { // Commercial
            if (units <= 100) {
                amount = units * 5.0;
            } else if (units <= 300) {
                amount = 100 * 5.0 + (units - 100) * 8.0;
            } else {
                amount = 100 * 5.0 + 200 * 8.0 + (units - 300) * 10.0;
            }
        }
        
        // Add GST and other charges
        amount += amount * 0.18; // 18% GST
        amount += 50; // Fixed charges
        
        return Math.round(amount);
    }

    populateConsumerFilters() {
        const consumerFilter = document.getElementById('consumerFilter');
        const billConsumer = document.getElementById('billConsumer');
        
        if (consumerFilter) {
            consumerFilter.innerHTML = '<option value="">All Consumers</option>' +
                this.consumers.map(consumer => 
                    `<option value="${consumer.id}">${consumer.name} (${consumer.meterNumber})</option>`
                ).join('');
        }

        if (billConsumer) {
            billConsumer.innerHTML = '<option value="">Select Consumer</option>' +
                this.consumers.map(consumer => 
                    `<option value="${consumer.id}" data-meter="${consumer.meterNumber}" data-type="${consumer.connectionType}">
                        ${consumer.name} (${consumer.meterNumber})
                    </option>`
                ).join('');
        }
    }

    applyFilters() {
        this.filteredBills = this.bills.filter(bill => {
            const matchesSearch = !this.searchTerm || 
                bill.consumerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                bill.billId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                bill.meterNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.statusFilter || 
                bill.status === this.statusFilter;

            const matchesMonth = !this.monthFilter || 
                bill.billDate.startsWith(this.monthFilter);

            const matchesConsumer = !this.consumerFilter || 
                bill.consumerId.toString() === this.consumerFilter;

            return matchesSearch && matchesStatus && matchesMonth && matchesConsumer;
        });
    }

    renderBillsTable() {
        const tbody = document.getElementById('billsTableBody');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');

        if (this.filteredBills.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
            loadingState.classList.add('d-none');
            this.updateBillsCount();
            return;
        }

        emptyState.classList.add('d-none');
        loadingState.classList.add('d-none');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentBills = this.filteredBills.slice(startIndex, endIndex);

        tbody.innerHTML = currentBills.map(bill => `
            <tr>
                <td>
                    <strong>${bill.billId}</strong>
                </td>
                <td>
                    <div class="fw-bold">${bill.consumerName}</div>
                    <small class="text-muted">ID: ${bill.consumerId}</small>
                </td>
                <td>${bill.meterNumber}</td>
                <td>${this.formatDate(bill.billDate)}</td>
                <td>
                    <span class="${this.isOverdue(bill.dueDate) ? 'text-danger' : ''}">
                        ${this.formatDate(bill.dueDate)}
                    </span>
                </td>
                <td>${bill.unitsConsumed}</td>
                <td>
                    <strong>₹${bill.amount.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(bill.status)}">
                        ${bill.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="billsManager.viewBill(${bill.id})" 
                                title="View Bill">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="billsManager.downloadBill(${bill.id})" 
                                title="Download PDF">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="billsManager.deleteBill(${bill.id})" 
                                title="Delete Bill">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateBillsCount();
    }

    getStatusBadgeClass(status) {
        const classes = {
            'Paid': 'bg-success',
            'Pending': 'bg-warning',
            'Overdue': 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN');
    }

    updateBillsCount() {
        const countElement = document.getElementById('filteredBillsCount');
        if (countElement) {
            countElement.textContent = `${this.filteredBills.length} bills`;
        }
    }

    updateStats() {
        const totalBills = this.bills.length;
        const paidBills = this.bills.filter(bill => bill.status === 'Paid').length;
        const pendingBills = this.bills.filter(bill => bill.status === 'Pending').length;
        const overdueBills = this.bills.filter(bill => bill.status === 'Overdue').length;

        document.getElementById('totalBillsCount').textContent = totalBills;
        document.getElementById('paidBillsCount').textContent = paidBills;
        document.getElementById('pendingBillsCount').textContent = pendingBills;
        document.getElementById('overdueBillsCount').textContent = overdueBills;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredBills.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="billsManager.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="billsManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="billsManager.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredBills.length / this.itemsPerPage)) return;
        
        this.currentPage = page;
        this.renderBillsTable();
        this.updatePagination();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('billsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderBillsTable();
                this.updatePagination();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderBillsTable();
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
                this.renderBillsTable();
                this.updatePagination();
            });
        }

        // Consumer filter
        const consumerFilter = document.getElementById('consumerFilter');
        if (consumerFilter) {
            consumerFilter.addEventListener('change', (e) => {
                this.consumerFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderBillsTable();
                this.updatePagination();
            });
        }

        // Bill consumer selection
        const billConsumer = document.getElementById('billConsumer');
        if (billConsumer) {
            billConsumer.addEventListener('change', (e) => {
                const selectedOption = billConsumer.options[billConsumer.selectedIndex];
                if (selectedOption.value) {
                    document.getElementById('meterNumber').value = selectedOption.getAttribute('data-meter');
                    document.getElementById('connectionType').value = selectedOption.getAttribute('data-type');
                } else {
                    document.getElementById('meterNumber').value = '';
                    document.getElementById('connectionType').value = '';
                }
            });
        }

        // Reading inputs for bill calculation
        const previousReading = document.getElementById('previousReading');
        const currentReading = document.getElementById('currentReading');
        
        if (previousReading && currentReading) {
            const calculateBill = () => {
                const prev = parseInt(previousReading.value) || 0;
                const curr = parseInt(currentReading.value) || 0;
                const units = Math.max(0, curr - prev);
                const connectionType = document.getElementById('connectionType').value;
                
                document.getElementById('unitsConsumed').value = units;
                this.updateBillPreview(units, connectionType);
            };

            previousReading.addEventListener('input', calculateBill);
            currentReading.addEventListener('input', calculateBill);
        }

        // Generate bill button
        const generateBillBtn = document.getElementById('generateBillBtn');
        if (generateBillBtn) {
            generateBillBtn.addEventListener('click', () => {
                this.generateNewBill();
            });
        }

        // Export bills button
        const exportBillsBtn = document.getElementById('exportBillsBtn');
        if (exportBillsBtn) {
            exportBillsBtn.addEventListener('click', () => {
                this.exportBills();
            });
        }
    }

    initializeDateFilters() {
        // Set current month as default
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        document.getElementById('monthFilter').value = currentMonth;
        this.monthFilter = currentMonth;

        // Set bill date to today
        document.getElementById('billDate').valueAsDate = now;
        
        // Set due date to 15 days from now
        const dueDate = new Date(now);
        dueDate.setDate(now.getDate() + 15);
        document.getElementById('dueDate').valueAsDate = dueDate;
    }

    updateBillPreview(units, connectionType) {
        if (!connectionType) {
            this.showToast('Please select a consumer first', 'warning');
            return;
        }

        const amount = this.calculateBillAmount(units, connectionType);
        const baseAmount = amount / 1.18; // Remove GST
        const gst = baseAmount * 0.18;
        const otherCharges = 50;
        const ratePerUnit = connectionType === 'Domestic' ? 
            (units <= 100 ? 3.0 : units <= 300 ? 5.0 : 7.0) :
            (units <= 100 ? 5.0 : units <= 300 ? 8.0 : 10.0);

        document.getElementById('previewUnits').textContent = units;
        document.getElementById('previewRate').textContent = ratePerUnit.toFixed(1);
        document.getElementById('previewBaseAmount').textContent = Math.round(baseAmount).toLocaleString();
        document.getElementById('previewGST').textContent = Math.round(gst).toLocaleString();
        document.getElementById('previewOtherCharges').textContent = otherCharges;
        document.getElementById('previewTotalAmount').textContent = amount.toLocaleString();
    }

    generateNewBill() {
        const form = document.getElementById('generateBillForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const consumerId = document.getElementById('billConsumer').value;
        const consumer = this.consumers.find(c => c.id == consumerId);
        
        if (!consumer) {
            this.showToast('Please select a valid consumer', 'error');
            return;
        }

        const previousReading = parseInt(document.getElementById('previousReading').value);
        const currentReading = parseInt(document.getElementById('currentReading').value);
        const units = currentReading - previousReading;

        if (units < 0) {
            this.showToast('Current reading must be greater than previous reading', 'error');
            return;
        }

        const newBill = {
            id: this.bills.length + 1,
            billId: `BILL${String(this.bills.length + 1).padStart(4, '0')}`,
            consumerId: consumer.id,
            consumerName: consumer.name,
            meterNumber: consumer.meterNumber,
            billDate: document.getElementById('billDate').value,
            dueDate: document.getElementById('dueDate').value,
            previousReading: previousReading,
            currentReading: currentReading,
            unitsConsumed: units,
            amount: this.calculateBillAmount(units, consumer.connectionType),
            status: 'Pending',
            connectionType: consumer.connectionType
        };

        this.bills.unshift(newBill);
        this.applyFilters();
        this.renderBillsTable();
        this.updatePagination();
        this.updateStats();

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('generateBillModal'));
        modal.hide();
        form.reset();
        this.initializeDateFilters();

        this.showToast('Bill generated successfully!', 'success');
    }

    viewBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill) {
            this.showBillDetails(bill);
        }
    }

    showBillDetails(bill) {
        const content = document.getElementById('billDetailsContent');
        content.innerHTML = `
            <div class="bill-header text-center mb-4 p-4 bg-light rounded">
                <h4>ELECTRICITY BILL</h4>
                <p class="mb-0">Bill No: ${bill.billId}</p>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h6>Consumer Information</h6>
                    <p class="mb-1"><strong>Name:</strong> ${bill.consumerName}</p>
                    <p class="b-1"><strong>M
                                        <p class="mb-1"><strong>Meter No:</strong> ${bill.meterNumber}</p>
                    <p class="mb-1"><strong>Connection Type:</strong> ${bill.connectionType}</p>
                </div>
                <div class="col-md-6">
                    <h6>Bill Information</h6>
                    <p class="mb-1"><strong>Bill Date:</strong> ${this.formatDate(bill.billDate)}</p>
                    <p class="mb-1"><strong>Due Date:</strong> ${this.formatDate(bill.dueDate)}</p>
                    <p class="mb-1"><strong>Status:</strong> <span class="badge ${this.getStatusBadgeClass(bill.status)}">${bill.status}</span></p>
                </div>
            </div>

            <div class="consumption-details mb-4">
                <h6>Consumption Details</h6>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Previous Reading</th>
                                <th>Current Reading</th>
                                <th>Units Consumed</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${bill.previousReading} units</td>
                                <td>${bill.currentReading} units</td>
                                <td><strong>${bill.unitsConsumed} units</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bill-calculation">
                <h6>Bill Calculation</h6>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Energy Charges (${bill.unitsConsumed} units)</td>
                                <td>₹${Math.round(bill.amount / 1.18 - 50).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Fixed Charges</td>
                                <td>₹50</td>
                            </tr>
                            <tr>
                                <td>GST (18%)</td>
                                <td>₹${Math.round((bill.amount / 1.18) * 0.18).toLocaleString()}</td>
                            </tr>
                            <tr class="table-active">
                                <td><strong>Total Amount</strong></td>
                                <td><strong>₹${bill.amount.toLocaleString()}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="payment-instructions mt-4 p-3 bg-warning bg-opacity-10 rounded">
                <h6>Payment Instructions</h6>
                <p class="mb-1">• Please pay before due date to avoid late fees</p>
                <p class="mb-1">• Late payment may result in disconnection</p>
                <p class="mb-0">• Payment can be made online or at our office</p>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('viewBillModal'));
        modal.show();
    }

    downloadBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill) {
            this.showToast('Preparing bill for download...', 'info');
            // In real app, this would generate and download PDF
            setTimeout(() => {
                this.showToast('Bill downloaded successfully!', 'success');
            }, 2000);
        }
    }

    printBill() {
        this.showToast('Opening print dialog...', 'info');
        setTimeout(() => {
            window.print();
        }, 500);
    }

    deleteBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill && confirm(`Are you sure you want to delete bill: ${bill.billId}?`)) {
            this.bills = this.bills.filter(b => b.id !== billId);
            this.applyFilters();
            this.renderBillsTable();
            this.updatePagination();
            this.updateStats();
            this.showToast('Bill deleted successfully!', 'success');
        }
    }

    exportBills() {
        this.showToast('Exporting bills data...', 'info');
        // In real app, would generate and download CSV/Excel file
    }

    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('billsTableBody');
        
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

// Initialize bills manager
let billsManager;
document.addEventListener('DOMContentLoaded', () => {
    billsManager = new BillsManager();
});