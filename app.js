const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filter to ensure we only process rows that have a Batch ID
            const data = results.data.filter(row => row['Batches'] && row['Batches'].trim() !== "");
            renderDashboard(data);
        }
    });
}

function renderDashboard(data) {
    // 1. TOTAL BATCHES: Count unique entries in 'Batches' column
    const totalBatches = [...new Set(data.map(d => d['Batches']))].length;
    document.getElementById('stat-batches').innerText = totalBatches;

    // 2. HEADCOUNT: Sum of 'Headcount (Day 0)' column
    const totalHC = data.reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();

    // 3. ATTRITION: Sum of the 'Attrition' column (Column W)
    const totalExits = data.reduce((sum, row) => sum + (parseInt(row['Attrition']) || 0), 0);
    const attrRate = totalHC > 0 ? ((totalExits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + "%";

    // 4. CONVERSION: Based on 'Status' being 'Certified'
    const certifiedRows = data.filter(d => d['Status'] === 'Certified').length;
    const convRate = totalBatches > 0 ? ((certifiedRows / totalBatches) * 100).toFixed(1) : 0;
    document.getElementById('stat-conv').innerText = convRate + "%";

    renderCharts(data);
    populateFilters(data);
}

function renderCharts(data) {
    // MONTHLY TREND: Uses the 'Month' column (Column F)
    const months = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24'];
    const monthlyHC = months.map(m => {
        return data.filter(d => d['Month'] === m)
                   .reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    });

    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'New Hire Headcount',
                data: monthlyHC,
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
        }
    });
}

function populateFilters(data) {
    const tFilter = document.getElementById('trainerFilter');
    // Unique names from 'Trainer Name' column
    const trainers = [...new Set(data.map(d => d['Trainer Name']))].filter(Boolean).sort();
    trainers.forEach(t => tFilter.add(new Option(t, t)));
}

initDashboard();
