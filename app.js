const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbuV6t-gxHvr0aN9asRdWBs0arjftIJ6k5hcpviihyk46Jpcd_9OPueR1LkE1rgS_kVHfoRIKTifxV/pub?gid=2099952935&single=true&output=csv';

let MASTER_DATA = [];

// 1. Fetch Data
async function loadData() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filter: Only rows where Column A (Batches) is NOT empty
            MASTER_DATA = results.data.filter(row => row['Batches'] && row['Batches'].trim() !== "");
            console.log("Connected! Total Batches Found:", MASTER_DATA.length);
            
            initDashboard(MASTER_DATA);
            populateSlicers(MASTER_DATA);
        }
    });
}

// 2. Initialize UI
function initDashboard(data) {
    updateKPIs(data);
    renderCharts(data);
    renderTable(data);
}

// 3. Update the Top KPI Boxes (Mapping to your specific columns)
function updateKPIs(data) {
    const totalBatches = data.length;
    const totalHC = data.reduce((sum, row) => sum + (parseInt(row['Headcount (Day 0)']) || 0), 0);
    const totalExits = data.reduce((sum, row) => sum + (parseInt(row['Attrition']) || 0), 0);
    const avgConv = (data.reduce((sum, row) => sum + (parseFloat(row['Conversion%']) || 0), 0) / totalBatches) * 100;

    // Mapping to the IDs in your HTML
    document.getElementById('hTotal').innerText = totalBatches;
    document.getElementById('hHC').innerText = totalHC.toLocaleString();
    document.getElementById('hAttr').innerText = ((totalExits / totalHC) * 100 || 0).toFixed(1) + "%";
    document.getElementById('hConv').innerText = (avgConv || 0).toFixed(0) + "%";
}

// 4. Populate Slicers (Trainer / Process)
function populateSlicers(data) {
    const trainerList = [...new Set(data.map(d => d['Trainer Name']))].filter(Boolean).sort();
    const trainerDropdown = document.getElementById('slicerBar'); // Or specific dropdown ID
    
    // Simple filter creation logic
    let html = `<select class="dd-btn" onchange="filterData(this.value)">
                    <option value="All">All Trainers</option>`;
    trainerList.forEach(t => { html += `<option value="${t}">${t}</option>`; });
    html += `</select>`;
    
    trainerDropdown.innerHTML += html;
}

// 5. Charting Logic
function renderCharts(data) {
    const months = [...new Set(data.map(d => d['Month']))].filter(Boolean);
    const monthlyHC = months.map(m => data.filter(d => d['Month'] === m).reduce((s, r) => s + (parseInt(r['Headcount (Day 0)']) || 0), 0));

    // Headcount Trend
    new Chart(document.getElementById('chMonthly'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'HC',
                data: monthlyHC,
                borderColor: '#4f8ef7',
                backgroundColor: 'rgba(79, 142, 247, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// 6. Table Logic (Batch Summary)
function renderTable(data) {
    const tbody = document.getElementById('batchTbody');
    tbody.innerHTML = data.slice(0, 20).map(row => `
        <tr>
            <td>${row['Batches']}</td>
            <td>${row['Process Name']}</td>
            <td>${row['Trainer Name']}</td>
            <td>${row['Month']}</td>
            <td><span class="badge bb">${row['Status']}</span></td>
            <td>${row['Headcount (Day 0)']}</td>
            <td>${row['Training End Date']}</td>
            <td>${row['Attrition']}</td>
            <td>${(parseFloat(row['Conversion%']) * 100).toFixed(0)}%</td>
        </tr>
    `).join('');
}

// 7. Filter Handler
window.filterData = (trainer) => {
    const filtered = trainer === "All" ? MASTER_DATA : MASTER_DATA.filter(d => d['Trainer Name'] === trainer);
    initDashboard(filtered);
};

// Start the engine
loadData();
