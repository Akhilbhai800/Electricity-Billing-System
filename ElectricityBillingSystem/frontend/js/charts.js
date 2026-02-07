// Charts Management System
class ChartManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.createRevenueChart();
        this.createConsumerChart();
        this.setupChartUpdates();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue (in ₹)',
                    data: [45000, 52000, 48000, 61000, 72000, 68000, 75000],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
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
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    createConsumerChart() {
        const ctx = document.getElementById('consumerChart');
        if (!ctx) return;

        this.charts.consumer = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Domestic', 'Commercial', 'Industrial', 'Agricultural'],
                datasets: [{
                    data: [65, 25, 7, 3],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c'
                    ],
                    borderColor: [
                        '#2980b9',
                        '#27ae60',
                        '#d35400',
                        '#c0392b'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}% (${percentage}% of total)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateRevenueChart(period) {
        if (!this.charts.revenue) return;

        let data, labels;
        
        switch(period) {
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [12000, 15000, 18000, 14000, 22000, 19000, 21000];
                break;
            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [45000, 52000, 48000, 61000];
                break;
            case 'year':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = [45000, 52000, 48000, 61000, 72000, 68000, 75000, 71000, 69000, 78000, 82000, 85000];
                break;
        }

        this.charts.revenue.data.labels = labels;
        this.charts.revenue.data.datasets[0].data = data;
        this.charts.revenue.update();
    }

    setupChartUpdates() {
        const revenuePeriod = document.getElementById('revenuePeriod');
        if (revenuePeriod) {
            revenuePeriod.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.value);
            });
        }
    }

    // Method to update charts with real data
    updateChartsWithData(stats) {
        if (this.charts.revenue && stats.revenueData) {
            this.charts.revenue.data.datasets[0].data = stats.revenueData;
            this.charts.revenue.update();
        }

        if (this.charts.consumer && stats.consumerData) {
            this.charts.consumer.data.datasets[0].data = stats.consumerData;
            this.charts.consumer.update();
        }
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChartManager();
});