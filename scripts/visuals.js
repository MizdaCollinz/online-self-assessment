//Produce a chart of visit totals
function chartTotals() {

    //Retrieve top 6 most visited sites from history
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }

    let labels = [];
    let values = [];

    for (let i = 0; i < sites; i++) {
        labels.push(cutName(visitDurations[i][0]));
        values.push(visitDurations[i][1]);
    } 

    //Calculate the total for all other sites
    let total = 0;
    for (i=sites; i< visitDurations.length; i++) {
        total += visitDurations[i][1];
    }
    labels.push("Other");
    values.push(total);

    //Retrieve tag data
    let tagset = Object.keys(tagDurations);
    let tagvalues = [];
    for (let tag of tagset) {
        tagvalues.push(tagDurations[tag]);
    }

    let totalContext = document.getElementById("totalChart").getContext('2d');
    let myChart = buildPieChart(totalContext, labels, values);

    let tagContext = document.getElementById("tagChart").getContext('2d');
    let tagChart = buildPieChart(tagContext, tagset, tagvalues);

}


//Produce a table of the visit totals
function buildTables() {
    let totalTable = document.getElementById("totalTable");
    let total = 0;
    for (let site of visitDurations){
        total += site[1]; //Build a total of all visit durations
    }

    let includedPercentage = 0;
    for (let i=0; i<sites; i++) {
        let name = cutName(visitDurations[i][0]);
        let value = visitDurations[i][1];
        let percentage = value * 100 / total;
        includedPercentage += percentage; //Build total of covered durations, to determine what is leftover
        //Build values into a row and insert into the table
        let row = buildRow(name, `${percentage.toFixed(2)}%`);
        totalTable.appendChild(row);
    }

    let row = buildRow("Other", `${(100-includedPercentage).toFixed(2)}%`);
    totalTable.appendChild(row);
    
    let tagTable = document.getElementById("tagTable");
    let tagSet = Object.keys(tagDurations);

    //Populate Tag Table
    for(let j=0; j<tagSet.length; j++){
        let name = tagSet[j];
        let value = tagDurations[name];

        //Build row and insert
        let row = buildRow(name, fromSeconds(value));
        tagTable.appendChild(row);
    }
}

//Convert seconds to formatted hour/min/sec
function fromSeconds(seconds){
    let m = moment.duration(seconds,'seconds');
    let values = [m.hours(),m.minutes(),m.seconds()];
    return `${values[0]}h ${values[1]}m ${values[2]}s `;
}

//Build a table row HTML element
function buildRow(name, value) {

    let row = document.createElement('tr');

    let nameCell = document.createElement('td');
    nameCell.style.minWidth = "180px";
    nameCell.style.fontWeight = "500";
    let nameNode = document.createTextNode(name);
    nameCell.appendChild(nameNode);

    let perCell = document.createElement('td');
    perCell.style.minWidth = "100px";
    let perNode = document.createTextNode(value);
    perCell.appendChild(perNode);

    row.appendChild(nameCell);
    row.appendChild(perCell);
    
    return row;
}

// Redraws the line graph depending on dropdown input
async function drawLineGraph(time) {
    console.log("time to redraw:" + time);
    let lineContext = document.getElementById("lineGraph").getContext('2d');
    
    // Retrieve top 6 most visited sites from history
    let sites = 6;
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }
    
    let xLabels = [];
    let datasetLabels = [];
    let datasetValues = [];
    
    
    // If time selected is 14 days or 12 weeks
    if (time === '14') {
        xLabels = generatexLabels(14);
        datasetLabels = lineData14days[0];
        datasetValues = lineData14days[1];
    } else if (time === '12') {
        // date span specifed is 12 weeks
        xLabels = generatexLabels(12);
        datasetLabels = lineData12weeks[0];
        datasetValues = lineData12weeks[1];
    }

    console.log("datalabels: " + datasetLabels);
    console.log("datavalues: " + datasetValues);
    let lineChart = buildSingleLineGraph(lineContext, xLabels, datasetLabels, datasetValues, 1);
    
}

// Generates xLabels for line graph depending on how long and what scale it is measured in
function generatexLabels(dateSpan) {
    let xLabels = [];
    if (dateSpan === 14) {
        for (let i = 0; i < dateSpan; i++) {
            let curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan + 1 + i);
            //console.log("xLabels entry:" + curDate.getDate() + "/" + curDate.getMonth());
            
            xLabels.push(curDate.getDate() + "/" + curDate.getMonth());
        }
    } else if (dateSpan === 12) {
        for (let i = 0; i < dateSpan; i++) {
            let curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan*7 + 1 + i*7);
            //console.log("xLabels entry:" + curDate.getDate() + "/" + curDate.getMonth());
            
            xLabels.push(curDate.getDate() + "/" + curDate.getMonth());
        }
    }

    return xLabels;
}

// JQuery for dynamically updating line graph from dropdown selection
$('#14days').click(function() {
    $('#lineGraphDropdownBtn').text("14 days");
    $('#lineGraphDropdownBtn').dropdown('close');
    drawLineGraph('14');
    return false;
});

$('#12weeks').click(function() {
    $('#lineGraphDropdownBtn').text("12 weeks");    
    $('#lineGraphDropdownBtn').dropdown('close');
    drawLineGraph('12');
    return false;
});

async function setup() { 
    await fetchInitialData().then(() => {
        //Build charts and tables
        chartTotals();
        buildTables();
    });
    
    await fetchLineGraphData().then(() => {
        drawLineGraph('14');
    });
}

//Fetch data, build visuals
setup();