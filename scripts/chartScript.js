//Script used for building chart.js charts

//Set of colours to be used for charts
const colours = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'];
const borderColours = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];


// Build a chart with the provided discrete label set and data values
function buildChart(context, chartType, chartLabels, chartData) {

   return new Chart(context, {
        type: chartType, // Pie, Bar
        data: { 
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: getColours(chartData.length),
                borderColor: getBorderColours(chartData.length),
                borderWidth: 0.5
            }]
        }
        
    });

}

// Build a line graph with the provided dataset and specified time span to look over (in days)
function buildSingleLineGraph(context, xLabels, datasetLabels, datasetValues, timeSpan) {
    let datasetsArray = [];
    for (let i = 0; i < datasetLabels.length; i++) {
        datasetsArray.push({
            label: datasetLabels[i],
            data: datasetValues[i],
            fill: false,
            backgroundColor: colours[i],
            borderColor: borderColours[i],
            lineTension: 0.1
        })
    }

    return new Chart(context, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: datasetsArray
        },
        options: {}
    });
}



//Retrieve the specified number of colours for use 
function getColours(quantity){
    if(quantity > colours.length){
        console.error("Exhausted colour pool for chart creation.");
        quantity = colours.length;
    }    
    return colours.slice(0,quantity);
}
//Solid border colour equivalents to match getColours
function getBorderColours(quantity){
    if (quantity > borderColours.length){
        quantity = borderColours.length;
    }
    return borderColours.slice(0, quantity);
}