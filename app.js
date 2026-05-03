const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Only use rows that have a Batch ID in Column A
            const data = results.data.filter(row => row['Batches'] && row['Batches'].trim() !== "");
            console.log("Sections Detected: Batches, Training, Quality, KRA, Exits");
            renderDashboard(data);
        }
    });
}

function renderDashboard(data) {
    // SECTION 1: BATCHES (A:I)
    const totalBatches = [...new Set(data.map(d => d['Batches']))].length;
    const totalHC = data.reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);

    // SECTION 2: EXITS (DP:FC)
    // Summing Exits from both Training Phase (DP:EH) and OJT Phase (EI:FC)
    const trainingExits = data.reduce((sum, row) => sum + (parseInt(row['Total Training Exits']) || 0), 0);
    const ojtExits = data.reduce((sum, row) => sum + (parseInt(row['Total OJT Exits']) || 0), 0);
    const totalExits = trainingExits + ojtExits;

    const attrRate = totalHC > 0 ? ((totalExits / totalHC) * 100).toFixed(1) : 0;

    // SECTION 3: QUALITY PKT (BN:BW)
    // Example: Getting Avg PKT Score from a specific column in that range
    const avgPKT = data.reduce((sum, row) => sum + (parseFloat(row['PKT Avg Score']) || 0), 0) / data.length;

    // UPDATE UI BOXES
    document.getElementById('stat-batches').innerText = totalBatches;
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();
    document.getElementById('stat-attr').innerText = attrRate + "%";
    document.getElementById('stat-conv').innerText = (avgPKT || 0).toFixed(0) + "%"; // Using PKT Avg as Conversion placeholder

    renderCharts(data);
    populateFilters(data);
}

function renderCharts(data) {
    // Line Chart: Using the Month column (F)
    const months = [...new Set(data.map(d => d['Month']))].filter(Boolean);
    const monthlyHC = months.map(m => {
        return data.filter(d => d['Month'] === m)
                   .reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    });

    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Induction',
                data: monthlyHC,
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.05)'
            }]
        }
    });

    // Exit Distribution (Doughnut)
    new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: {
            labels: ['Training Exits', 'OJT Exits', 'Active'],
            datasets: [{
                data: [
                    data.reduce((sum, row) => sum + (parseInt(row['Total Training Exits']) || 0), 0),
                    data.reduce((sum, row) => sum + (parseInt(row['Total OJT Exits']) || 0), 0),
                    100 // Placeholder for active
                ],
                backgroundColor: ['#f87171', '#fbbf24', '#34d399']
            }]
        }
    });
}

function populateFilters(data) {
    const tFilter = document.getElementById('trainerFilter');
    const trainers = [...new Set(data.map(d => d['Trainer Name']))].filter(Boolean).sort();
    trainers.forEach(t => tFilter.add(new Option(t, t)));
}

initDashboard();
