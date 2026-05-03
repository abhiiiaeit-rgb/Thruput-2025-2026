const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filter to only rows that have a Batch ID in Column A
            const data = results.data.filter(row => row['Batches'] && row['Batches'].trim() !== "");
            console.log("Data Rows Loaded:", data.length);
            renderDashboard(data);
        }
    });
}

function renderDashboard(data) {
    // 1. TOTAL BATCHES (Column A: 'Batches')
    const totalBatches = [...new Set(data.map(d => d['Batches']))].length;
    document.getElementById('stat-batches').innerText = totalBatches;

    // 2. TOTAL HEADCOUNT (Column I: 'Headcount (Day 0)')
    const totalHC = data.reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();

    // 3. ATTRITION (Column W: 'Attrition')
    const totalExits = data.reduce((sum, row) => sum + (parseInt(row['Attrition']) || 0), 0);
    const attrRate = totalHC > 0 ? ((totalExits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + "%";

    // 4. CONVERSION % (Based on 'Status' Column D)
    const certifiedCount = data.filter(d => d['Status'] === 'Certified').length;
    const convRate = totalBatches > 0 ? ((certifiedCount / totalBatches) * 100).toFixed(1) : 0;
    document.getElementById('stat-conv').innerText = convRate + "%";

    updateCharts(data);
}

function updateCharts(data) {
    // Trend Chart using 'Month' (Column F)
    const months = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24'];
    const monthlyHC = months.map(m => {
        return data.filter(d => d['Month'] === m)
                   .reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    });

    const ctx = document.getElementById('lineChart').getContext('2d');
    if (window.trendChart) window.trendChart.destroy();
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Headcount Trend',
                data: monthlyHC,
                borderColor: '#3b82f6',
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        }
    });
}

initDashboard();
