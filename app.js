const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function loadDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;
            renderStats(data);
            renderCharts(data);
        }
    });
}

function renderStats(data) {
    // Basic counting logic - ensures no "Goof ups" with empty rows
    const totalHC = data.length;
    const uniqueBatches = [...new Set(data.map(d => d.Batch))].filter(Boolean).length;
    
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();
    document.getElementById('stat-batches').innerText = uniqueBatches;
    
    // Example: calculating attrition if you have a 'Status' column
    const exits = data.filter(d => d.Status === 'Exit').length;
    const attrRate = totalHC > 0 ? ((exits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + '%';
}

function renderCharts(data) {
    // Line Chart: Monthly Trend
    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Headcount',
                data: [65, 78, 90, 85, 110, 125], // Map your data here
                borderColor: '#2563eb',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.05)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Pie Chart: PKT Attempts
    new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: {
            labels: ['1st Att', '2nd Att', '3rd Att'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: { cutout: '70%' }
    });
}

loadDashboard();
