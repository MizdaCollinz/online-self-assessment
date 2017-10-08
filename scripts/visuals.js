
//Return duration between two dates
function getTime(startTime, endTime){
    let diff = endTime.getTime() - startTime.getTime();
    let seconds = diff/1000;
    return seconds;
}

//Return duration of visit in seconds
function getVisitDuration(visit){
    let start = new Date(visit.time.start);
    let end = new Date(visit.time.end);
    let duration = getTime(start,end);


    //Case often occurs when the end time is undefined (Tab is still open, the visit is ongoing)
    if(duration < 0){
        return 0; //Don't return invalid values
    }
    return duration;
}

//Return total visit duration to website
async function getTotalVisits(website){

    visitDuration = new Promise( 
        (resolve,reject) => {
            chrome.storage.local.get(`${website}`, function(result) {
                resolve(result[`${website}`]);
            });
        });

    let total = await visitDuration.then(function(resolved){
        let visits = resolved.visits;
        let duration = 0;
        
        visits.forEach(function(element) {
            duration += getVisitDuration(element);
        }, this);

        return duration;
        
    });
    return total;
}   

//Produce a chart of visit totals
async function chartTotals(){

    
    let visitDurations = [];

    websites = new Promise(
        (resolve,reject) => {
            chrome.storage.local.get(null,function(results){
                resolve(results);    
            });
        }
    )

    let results = await websites.then(function(resolved){
        return resolved;
    })

    let keys = Object.keys(results);

    for(let key of keys){
        let value = await getTotalVisits(key);
        visitDurations.push([key,value]); 
    }

    //Sort map of site : visit duration
    visitDurations.sort(function(a,b) {
        return b[1] - a[1];
    })

    //Retrieve top 6 most visited sites from history
    let sites = 6;
    if (visitDurations.length < 6){
        sites = visitDurations.length;
    }

    let labels = [];
    let values = [];

    for (let i=0; i<sites; i++){
        labels.push(visitDurations[i][0]);
        values.push(visitDurations[i][1]);
    }

    console.log(labels);


    let ctx = document.getElementById("myChart").getContext('2d');
    let myChart = buildChart(ctx, 'doughnut', labels, values);

}

chartTotals();

