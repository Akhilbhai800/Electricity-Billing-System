// Reports Management System
class ReportsManager {
    constructor() {
        this.reportData = {};
        this.charts = {};
        this.currentReportType = 'overview';
        this.currentTimePeriod = 'month';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadReportData();
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

    async loadReportData() {
        this.showLoadingState();

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock data - Replace with actual API call later
            this.reportData = this.generateMockReportData();
            this.updateKPICards();
            this.createCharts();
            this.updateDataTables();
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading report data:', error);
            this.showError('Failed to load report data');
            this.hideLoadingState();
        }
    }

    generateMockReportData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking'];
        const connectionTypes = ['Domestic', 'Commercial'];
        const billStatuses = ['Paid', 'Pending', 'Overdue'];
        
        return {
            // KPI Data
            kpis: {
                totalConsumers: 1247,
                totalBills: 856,
                totalRevenue: 1250000,
                collectionRate: 78,
                pendingBills: 42,
                avgConsumption: 245
            },

            // Revenue Data
            revenueData: {
                labels: months,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [45000, 52000, 48000, 61000, 72000, 68000, 75000],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)'
                }]
            },

            // Payment Methods Data
            paymentMethodsData: {
                labels: paymentMethods,
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#28a745', '#007bff', '#6f42c1', '#ffc107']
                }]
            },

            // Consumption Data
            consumptionData: {
                labels: connectionTypes,
                datasets: [{
                    label: 'Average Consumption (Units)',
                    data: [180, 450],
                    backgroundColor: ['#3498db', '#e74c3c']
                }]
            },

            // Bill Status Data
            billStatusData: {
                labels: billStatuses,
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },

            // Top Consumers
            topConsumers: [
                { name: 'Priya Singh', meter: 'MET0002', units: 450, amount: 4248 },
                { name: 'Raj Verma', meter: 'MET0005', units: 380, amount: 2890 },
                { name: 'Rahul Sharma', meter: 'MET0001', units: 320, amount: 1560 },
                { name: 'Amit Kumar', meter: 'MET0003', units: 280, amount: 1250 },
                { name: 'Sneha Patel', meter: 'MET0004', units: 250, amount: 1120 }
            ],

            // Recent Payments
            recentPayments: [
                { id: 'PAY0025', consumer: 'Rahul Sharma', amount: 1250, date: '2024-03-15' },
                { id: 'PAY0024', consumer: 'Priya Singh', amount: 4248, date: '2024-03-14' },
                { id: 'PAY0023', consumer: 'Amit Kumar', amount: 282, date: '2024-03-13' },
                { id: 'PAY0022', consumer: 'Sneha Patel', amount: 1560, date: '2024-03-12' },
                { id: 'PAY0021', consumer: 'Raj Verma', amount: 2890, date: '2024-03-11' }
            ]
        };
    }

    updateKPICards() {
        const kpis = this.reportData.kpis;
        
        document.getElementById('totalConsumers').textContent = kpis.totalConsumers.toLocaleString();
        document.getElementById('totalBills').textContent = kpis.totalBills.toLocaleString();
        document.getElementById('totalRevenue').textContent = `₹${(kpis.totalRevenue / 1000).toFixed(0)}K`;
        document.getElementById('collectionRate').textContent = `${kpis.collectionRate}%`;
        document.getElementById('pendingBills').textContent = kpis.pendingBills;
        document.getElementById('avgConsumption').textContent = kpis.avgConsumption;
    }

    createCharts() {
        this.createRevenueChart();
        this.createPaymentMethodsChart();
        this.createConsumptionChart();
        this.createBillStatusChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: this.reportData.revenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createPaymentMethodsChart() {
        const ctx = document.getElementById('paymentMethodsChart');
        if (!ctx) return;

        this.charts.paymentMethods = new Chart(ctx, {
            type: 'doughnut',
            data: this.reportData.paymentMethodsData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createConsumptionChart() {
        const ctx = document.getElementById('consumptionChart');
        if (!ctx) return;

        this.charts.consumption = new Chart(ctx, {
            type: 'bar',
            data: this.reportData.consumptionData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createBillStatusChart() {
        const ctx = document.getElementById('billStatusChart');
        if (!ctx) return;

        this.charts.billStatus = new Chart(ctx, {
            type: 'pie',
            data: this.reportData.billStatusData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateDataTables() {
        this.updateTopConsumersTable();
        this.updateRecentPaymentsTable();
    }

    updateTopConsumersTable() {
        const tbody = document.getElementById('topConsumersTable');
        if (!tbody) return;

        tbody.innerHTML = this.reportData.topConsumers.map(consumer => `
            <tr>
                <td>${consumer.name}</td>
                <td>${consumer.meter}</td>
                <td>${consumer.units} units</td>
                <td>₹${consumer.amount.toLocaleString()}</td>
            </tr>
        `).join('');
    }

    updateRecentPaymentsTable() {
        const tbody = document.getElementById('recentPaymentsTable');
        if (!tbody) return;

        tbody.innerHTML = this.reportData.recentPayments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.consumer}</td>
                <td>₹${payment.amount.toLocaleString()}</td>
                <td>${this.formatDate(payment.date)}</td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Report type change
        const reportType = document.getElementById('reportType');
        if (reportType) {
            reportType.addEventListener('change', (e) => {
                this.currentReportType = e.target.value;
                this.loadReportData();
            });
        }

        // Time period change
        const timePeriod = document.getElementById('timePeriod');
        if (timePeriod) {
            timePeriod.addEventListener('change', (e) => {
                this.currentTimePeriod = e.target.value;
                this.toggleCustomDateRange();
                this.loadReportData();
            });
        }

        // Revenue chart type
        const revenueChartType = document.getElementById('revenueChartType');
        if (revenueChartType) {
            revenueChartType.addEventListener('change', (e) => {
                if (this.charts.revenue) {
                    this.charts.revenue.destroy();
                    this.reportData.revenueData.datasets[0].type = e.target.value === 'bar' ? 'bar' : 'line';
                    this.createRevenueChart();
                }
            });
        }

        // Generate report button
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // Print reports button
        const printReportsBtn = document.getElementById('printReportsBtn');
        if (printReportsBtn) {
            printReportsBtn.addEventListener('click', () => {
                this.printReports();
            });
        }
    }

    initializeDateFilters() {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        document.getElementById('startDate').valueAsDate = oneMonthAgo;
        document.getElementById('endDate').valueAsDate = now;
        
        this.toggleCustomDateRange();
    }

    toggleCustomDateRange() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (this.currentTimePeriod === 'custom') {
            startDate.disabled = false;
            endDate.disabled = false;
        } else {
            startDate.disabled = true;
            endDate.disabled = true;
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN');
    }

    generateReport() {
        this.showToast('Generating comprehensive report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            this.showToast('Report generated successfully!', 'success');
            
            // In real app, this would download the report
            const reportData = {
                type: this.currentReportType,
                period: this.currentTimePeriod,
                data: this.reportData,
                generatedAt: new Date().toISOString(),
                generatedBy: JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')).username
            };
            
            console.log('Report Data:', reportData);
        }, 3000);
    }

    printReports() {
        this.showToast('Preparing for print...', 'info');
        setTimeout(() => {
            window.print();
        }, 1000);
    }

    exportPDF() {
        this.showToast('Generating PDF report...', 'info');
        // In real app, would generate PDF
    }

    exportExcel() {
        this.showToast('Exporting Excel data...', 'info');
        // In real app, would generate Excel file
    }

    exportCharts() {
        this.showToast('Exporting charts...', 'info');
        // In real app, would export charts as images
    }

    exportFull() {
        this.showToast('Preparing full report package...', 'info');
        // In real app, would create zip with all reports
    }

    showLoadingState() {
        // Add loading indicators to charts
        const charts = document.querySelectorAll('canvas');
        charts.forEach(chart => {
            chart.style.opacity = '0.5';
        });
    }

    hideLoadingState() {
        const charts = document.querySelectorAll('canvas');
        charts.forEach(chart => {
            chart.style.opacity = '1';
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

// Initialize reports manager
let reportsManager;
document.addEventListener('DOMContentLoaded', () => {
    reportsManager = new ReportsManager();
});