const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

// --- COLUMN MAPPING (Check your Sheet headers!) ---
const COL_BATCH = 'Batch';
const COL_STATUS = 'Status';
const COL_MONTH = 'Month';
const COL_PKT = 'PKT_Attempt';
const COL_CERTIFIED = 'Certified';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;
            console.log("Raw Data:", data[0]); // Check first row in F12 console
            renderStats(data);
            renderCharts(data);
        }
    });
}

function renderStats(data) {
    const totalHC = data.length;
    
    // 1. Total Batches
    const batches = [...new Set(data.map(d => d[COL_BATCH]))].filter(Boolean);
    document.getElementById('stat-batches').innerText = batches.length;

    // 2. Headcount
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();

    // 3. Attrition Rate (Counts rows where Status is 'Exit' or 'Terminated')
    const exits = data.filter(d => d[COL_STATUS] === 'Exit' || d[COL_STATUS] === 'Terminated').length;
    const attrRate = totalHC > 0 ? ((exits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + "%";

    // 4. Avg Conversion (Counts rows where Certified is 'Yes' or 'Pass')
    const pass = data.filter(d => d[COL_CERTIFIED] === 'Yes' || d[COL_CERTIFIED] === 'Pass').length;
    const convRate = totalHC > 0 ? ((pass / totalHC) * 100).toFixed(0) : 0;
    document.getElementById('stat-conv').innerText = convRate + "%";
}

function renderCharts(data) {
    // Trend Chart (Logic to count HC per month)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyHC = months.map(m => data.filter(d => d[COL_MONTH] === m).length);

    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Headcount',
                data: monthlyHC,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } }, responsive: true }
    });

    // PKT Pie Chart
    const p1 = data.filter(d => d[COL_PKT] == '1').length;
    const p2 = data.filter(d => d[COL_PKT] == '2').length;
    const p3 = data.filter(d => d[COL_PKT] == '3').length;

    new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: {
            labels: ['1st Att', '2nd Att', '3rd Att'],
            datasets: [{
                data: [p1, p2, p3],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { cutout: '75%' }
    });
}

initDashboard();
