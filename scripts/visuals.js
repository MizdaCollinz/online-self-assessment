//Produce a chart of visit totals
function chartTotals() {

    //Retrieve top 6 most visited sites from history
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }

    let labels = [];
    let values = [];

    for (let i = 0; i < sites; i++) {
        labels.push(visitDurations[i][0]);
        values.push(visitDurations[i][1]);
    }

    //Retrieve tag data
    let tagset = Object.keys(tagDurations);
    let tagvalues = [];
    for (let tag of tagset) {
        tagvalues.push(tagDurations[tag]);
    }

    let totalContext = document.getElementById("totalChart").getContext('2d');
    let myChart = buildChart(totalContext, 'doughnut', labels, values);

    let tagContext = document.getElementById("tagChart").getContext('2d');
    let tagChart = buildChart(tagContext, 'doughnut', tagset, tagvalues);

}


//Produce a table of the visit totals
function buildTables() {

    let totalTable = document.getElementById("totalTable");
    let total = 0;
    for (let site of visitDurations){
        total += site[1]; //Build a total of all visit durations
    }

    let includedPercentage = 0;
    for (let i=0; i<8; i++) {
        let name = visitDurations[i][0];
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

function buildRow(name, value) {

    let row = document.createElement('tr');

    let nameCell = document.createElement('td');
    let nameNode = document.createTextNode(name);
    nameCell.appendChild(nameNode);

    let perCell = document.createElement('td');
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
    let lineBundle = getLineBundle(time);
    let lineChart = buildSingleLineGraph(lineContext, lineBundle[0], lineBundle[1], lineBundle[2], 1);
    
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
        buildInitialLineGraph();
        
        
    });
}

//Fetch data, build visuals
setup();