
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

        let tags = resolved.tags;

        return [duration,tags];
        
    });
    return total;
}   

//Produce a chart of visit totals
async function chartTotals(){

    
    let visitDurations = [];
    let tagDurations = {};

    //Retrieve list of websites (keys in local storage)
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
        let total = await getTotalVisits(key);

        console.log(total);

        let value = total[0];
        let tags = total[1];

        for(let tag of tags){
            if(tagDurations[tag] == undefined){
                tagDurations[tag] = 0;
            }
            tagDurations[tag] += parseInt(value);
        }
        
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

    //Retrieve tag data
    console.log(tagDurations);
    let tagset = Object.keys(tagDurations);
    let tagvalues = [];
    for(let tag of tagset){
        tagvalues.push(tagDurations[tag]);
    }

    console.log(tagset);
    console.log(tagvalues);

    let totalContext = document.getElementById("totalChart").getContext('2d');
    let myChart = buildChart(totalContext, 'doughnut', labels, values);

    let tagContext = document.getElementById("tagChart").getContext('2d');
    let tagChart = buildChart(tagContext,'doughnut', tagset, tagvalues);

}

chartTotals();

