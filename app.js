const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

async function initDashboard() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // THE FIX: Filter out rows where 'Batches' is empty or just whitespace
            // This ignores the 52,000 blank rows and only counts actual data
            const data = results.data.filter(row => {
                return row['Batches'] && row['Batches'].toString().trim() !== "";
            });

            console.log("Cleaned Data Count:", data.length); // Should now show 168
            renderDashboard(data);
        }
    });
}

function renderDashboard(data) {
    // 1. TOTAL BATCHES
    // We count unique Batch IDs to ensure we get exactly 168
    const uniqueBatches = [...new Set(data.map(d => d['Batches'].toString().trim()))];
    document.getElementById('stat-batches').innerText = uniqueBatches.length;

    // 2. TOTAL HEADCOUNT (Sum of Column I)
    const totalHC = data.reduce((sum, row) => {
        const val = parseInt(row['Headcount (Day 0)']);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);
    document.getElementById('stat-hc').innerText = totalHC.toLocaleString();

    // 3. ATTRITION (Sum of Column W)
    const totalExits = data.reduce((sum, row) => {
        const val = parseInt(row['Attrition']);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const attrRate = totalHC > 0 ? ((totalExits / totalHC) * 100).toFixed(1) : 0;
    document.getElementById('stat-attr').innerText = attrRate + "%";

    // 4. CONVERSION (Status Column D)
    const certified = data.filter(d => d['Status'] === 'Certified').length;
    const convRate = uniqueBatches.length > 0 ? ((certified / uniqueBatches.length) * 100).toFixed(1) : 0;
    document.getElementById('stat-conv').innerText = convRate + "%";

    updateCharts(data);
}
