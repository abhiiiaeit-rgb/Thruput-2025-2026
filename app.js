const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            processData(data);
        }
    });
}

function processData(data) {
    // 1. Update Numbers
    document.getElementById('stat-batches').innerText = [...new Set(data.map(d => d.Batch))].length;
    document.getElementById('stat-hc').innerText = data.length;

    // 2. Line Chart Logic
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Headcount',
                data: [40, 65, 50, 85, 70, 90], // Replace with your actual data mapping
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } }, responsive: true }
    });

    // 3. Pie Chart Logic
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Attempt 1', 'Attempt 2', 'Attempt 3'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        }
    });
}

initDashboard();
