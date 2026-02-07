// Consumers Management System with Backend
class ConsumersManager {
    constructor() {
        this.consumers = [];
        this.filteredConsumers = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.connectionTypeFilter = '';
        this.statusFilter = '';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadConsumers();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!savedUser) {
            window.location.href = 'login.html';
            return;
        }
    }

    async loadConsumers() {
        this.showLoadingState();

        try {
            // Load consumers from BACKEND API
            this.consumers = await apiService.getConsumers();
            this.applyFilters();
            this.renderConsumersTable();
            this.updatePagination();
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading consumers:', error);
            this.showError('Failed to load consumers data');
            this.hideLoadingState();
            
            // Fallback to mock data if API fails
            this.consumers = this.generateMockConsumers(10);
            this.applyFilters();
            this.renderConsumersTable();
            this.updatePagination();
        }
    }

    generateMockConsumers(count) {
        // Fallback mock data
        const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Raj'];
        const lastNames = ['Sharma', 'Singh', 'Kumar', 'Patel', 'Verma'];
        
        return Array.from({ length: count }, (_, i) => ({
            consumer_id: i + 1,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            meter_number: `MET${String(i + 1).padStart(4, '0')}`,
            connection_type: i % 2 === 0 ? 'Domestic' : 'Commercial',
            address: `Address ${i + 1}`,
            email: `consumer${i + 1}@gmail.com`,
            phone: `987654321${i}`,
            status: 'Active'
        }));
    }

    applyFilters() {
        this.filteredConsumers = this.consumers.filter(consumer => {
            const matchesSearch = !this.searchTerm || 
                consumer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                consumer.meter_number.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesConnectionType = !this.connectionTypeFilter || 
                consumer.connection_type === this.connectionTypeFilter;

            const matchesStatus = !this.statusFilter || 
                consumer.status === this.statusFilter;

            return matchesSearch && matchesConnectionType && matchesStatus;
        });
    }

    renderConsumersTable() {
        const tbody = document.getElementById('consumersTableBody');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');

        if (this.filteredConsumers.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
            loadingState.classList.add('d-none');
            this.updateConsumersCount();
            return;
        }

        emptyState.classList.add('d-none');
        loadingState.classList.add('d-none');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentConsumers = this.filteredConsumers.slice(startIndex, endIndex);

        tbody.innerHTML = currentConsumers.map(consumer => `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input consumer-checkbox" value="${consumer.consumer_id}">
                </td>
                <td>
                    <strong>CONS${String(consumer.consumer_id).padStart(4, '0')}</strong>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="consumer-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style="width: 40px; height: 40px; color: white; font-weight: bold;">
                            ${consumer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div class="fw-bold">${consumer.name}</div>
                            <small class="text-muted">${consumer.email}</small>
                        </div>
                    </div>
                </td>
                <td>${consumer.meter_number}</td>
                <td>
                    <span class="badge ${consumer.connection_type === 'Domestic' ? 'bg-info' : 'bg-warning'}">
                        ${consumer.connection_type}
                    </span>
                </td>
                <td>${consumer.address}</td>
                <td>${consumer.phone}</td>
                <td>
                    <span class="badge ${consumer.status === 'Active' ? 'bg-success' : 'bg-secondary'}">
                        ${consumer.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="consumersManager.viewConsumer(${consumer.consumer_id})" 
                                title="View Consumer">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="consumersManager.editConsumer(${consumer.consumer_id})" 
                                title="Edit Consumer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="consumersManager.deleteConsumer(${consumer.consumer_id})" 
                                title="Delete Consumer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateConsumersCount();
    }

    updateConsumersCount() {
        const countElement = document.getElementById('totalConsumersCount');
        if (countElement) {
            countElement.textContent = `${this.filteredConsumers.length} consumers`;
        }
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredConsumers.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="consumersManager.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="consumersManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="consumersManager.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredConsumers.length / this.itemsPerPage)) return;
        
        this.currentPage = page;
        this.renderConsumersTable();
        this.updatePagination();
        
        // Scroll to top of table
        document.querySelector('.main-content').scrollTop = 0;
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderConsumersTable();
                this.updatePagination();
            });
        }

        // Clear search
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.currentPage = 1;
                this.applyFilters();
                this.renderConsumersTable();
                this.updatePagination();
            });
        }

        // Connection type filter
        const connectionTypeFilter = document.getElementById('connectionTypeFilter');
        if (connectionTypeFilter) {
            connectionTypeFilter.addEventListener('change', (e) => {
                this.connectionTypeFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderConsumersTable();
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
                this.renderConsumersTable();
                this.updatePagination();
            });
        }

        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.consumer-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Save consumer button
        const saveConsumerBtn = document.getElementById('saveConsumerBtn');
        if (saveConsumerBtn) {
            saveConsumerBtn.addEventListener('click', () => {
                this.addNewConsumer();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportConsumers();
            });
        }
    }

    async addNewConsumer() {
        const form = document.getElementById('addConsumerForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const consumerData = {
            name: document.getElementById('consumerName').value,
            address: document.getElementById('address').value,
            meter_number: document.getElementById('meterNumber').value,
            connection_type: document.getElementById('connectionType').value,
            email: document.getElementById('email').value || '',
            phone: document.getElementById('phone').value || ''
        };

        try {
            const result = await apiService.addConsumer(consumerData);
            
            this.showToast('Consumer added successfully!', 'success');
            
            // Reload consumers to show the new one
            this.loadConsumers();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addConsumerModal'));
            modal.hide();
            form.reset();
            
        } catch (error) {
            this.showError('Failed to add consumer: ' + error.message);
        }
    }

    viewConsumer(consumerId) {
        const consumer = this.consumers.find(c => c.consumer_id === consumerId);
        if (consumer) {
            this.showToast(`Viewing consumer: ${consumer.name}`, 'info');
            // In real app, would navigate to consumer details page
        }
    }

    editConsumer(consumerId) {
        const consumer = this.consumers.find(c => c.consumer_id === consumerId);
        if (consumer) {
            this.showToast(`Editing consumer: ${consumer.name}`, 'warning');
            // In real app, would open edit modal
        }
    }

    deleteConsumer(consumerId) {
        const consumer = this.consumers.find(c => c.consumer_id === consumerId);
        if (consumer && confirm(`Are you sure you want to delete consumer: ${consumer.name}?`)) {
            // Note: Backend DELETE API would be implemented here
            this.consumers = this.consumers.filter(c => c.consumer_id !== consumerId);
            this.applyFilters();
            this.renderConsumersTable();
            this.updatePagination();
            this.showToast('Consumer deleted successfully!', 'success');
        }
    }

    exportConsumers() {
        this.showToast('Exporting consumers data...', 'info');
        // In real app, would generate and download CSV/Excel file
    }

    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('consumersTableBody');
        
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

// Initialize consumers manager
let consumersManager;
document.addEventListener('DOMContentLoaded', () => {
    consumersManager = new ConsumersManager();
});