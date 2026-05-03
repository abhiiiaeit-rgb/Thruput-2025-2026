const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filter out any rows that don't have a Batch name (cleans the 52k rows)
            const data = results.data.filter(row => row.Batch && row.Batch.trim() !== "");
            console.log("Real Data Loaded:", data.length, "rows");
            
            renderStats(data);
            renderCharts(data);
            populateFilters(data);
        }
    });
}

function renderStats(data) {
    const totalHC = data.length;
    
    // 1. Calculate Batches
    const uniqueBatches = [...new Set(data.map(d => d.Batch))];
    document.getElementById('stat-batches').innerText = uniqueBatches.length;

    // 2. Update Headcount
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();

    // 3. Calculate Attrition % (Looking for 'Exit' in Status column)
    const exits = data.filter(d => d.Status === 'Exit').length;
    const attrRate = totalHC > 0 ? ((exits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + "%";

    // 4. Calculate Conversion % (Looking for 'Yes' in Certified column)
    const certified = data.filter(d => d.Certified === 'Yes').length;
    const convRate = totalHC > 0 ? ((certified / totalHC) * 100).toFixed(0) : 0;
    document.getElementById('stat-conv').innerText = convRate + "%";
}

function renderCharts(data) {
    // Trend Chart Logic: Groups by the 'Month' column
    const months = ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26'];
    const monthlyCounts = months.map(m => data.filter(d => d.Month === m).length);

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    // Destroy previous chart if it exists to prevent overlap
    if(window.myLineChart) window.myLineChart.destroy();
    window.myLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Headcount',
                data: monthlyCounts,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        }
    });

    // PKT Chart Logic: Looking for 1, 2, 3 in 'PKT_Attempt' column
    const p1 = data.filter(d => String(d.PKT_Attempt) === '1').length;
    const p2 = data.filter(d => String(d.PKT_Attempt) === '2').length;
    const p3 = data.filter(d => String(d.PKT_Attempt) === '3').length;

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    if(window.myPieChart) window.myPieChart.destroy();
    window.myPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['1st Att', '2nd Att', '3rd Att'],
            datasets: [{
                data: [p1, p2, p3],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: { cutout: '75%' }
    });
}

function populateFilters(data) {
    const bFilter = document.getElementById('batchFilter');
    const tFilter = document.getElementById('trainerFilter');
    
    const uniqueBatches = [...new Set(data.map(d => d.Batch))].sort();
    const uniqueTrainers = [...new Set(data.map(d => d.Trainer))].sort();

    uniqueBatches.forEach(b => bFilter.add(new Option(b, b)));
    uniqueTrainers.forEach(t => tFilter.add(new Option(t, t)));
}

initDashboard();
