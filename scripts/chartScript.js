//Script used for building chart.js charts

//Set of colours to be used for charts
const colours = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 
'rgba(198, 40, 40, 0.2)', 'rgba(26, 35, 126, 0.2)', 'rgba(0, 96, 100, 0.2)' ];
const borderColours = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
'rgba(198, 40, 40, 1)', 'rgba(26, 35, 126, 1)', 'rgba(0, 96, 100, 1)' ];
var lineChart = null;

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
    if (lineChart != null) {
        lineChart.destroy();
    }
    
    lineChart = new Chart(context, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: datasetsArray
        },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date - Day/Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Minutes Spent'
                    }
                }]
            }

        }
    });

    return lineChart;
}

// Builds a bar graph with the provided x axis labels, and the y axis values
function buildBarGraph(context, labels, values) {
    return barChart = new Chart(context, {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Visits to Domain',
                backgroundColor: colours[1],
                borderColor: borderColours[1],
                borderWidth: 1,
                data: values
            }]
        }, 
        options: {
            scaleShowValues: true,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
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
    
    return url;
}