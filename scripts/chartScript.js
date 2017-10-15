//Script used for building chart.js charts

//Set of colours to be used for charts
const colours = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 
'rgba(198, 40, 40, 0.2)', 'rgba(26, 35, 126, 0.2)', 'rgba(0, 96, 100, 0.2)' ];
const borderColours = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
'rgba(198, 40, 40, 1)', 'rgba(26, 35, 126, 1)', 'rgba(0, 96, 100, 1)' ];


// Build a chart with the provided discrete label set and data values
function buildChart(context, chartType, chartLabels, chartData, extras) {

    let chartJson = Object.assign({ //Combine extras object into defined one
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
        
    }, extras);

    console.log(chartJson);

   return new Chart(context, chartJson);

}

function buildPieChart(context, chartLabels, chartData){

    //Set tooltips to show name and percentage
    let extras = {
        options: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let dataset = data.datasets[0];
                        let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });
                        
                        let currentName = data.labels[tooltipItem.index];
                        let currentValue = dataset.data[tooltipItem.index];
                        let percentage = (currentValue*100/total).toFixed(2);
                
                        return `${currentName} - ${percentage}%`;
                    }
                }
            }
        }  
    } 

    return buildChart(context,'doughnut',chartLabels,chartData,extras);

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

//Remove www from url names
function cutName(website){
    let url = website;
    if (url.startsWith("www.")){
        url = url.replace('www.','');
    }
    console.log(url);
    
    return url;
}