let visitDurations = []; // Entries are [websitename,totalvisits]
let tagDurations = {}; // Object with Tag names as keys, total visit duration as values e.g Social Network 


//Return duration between two dates
function getTime(startTime, endTime) {
    let diff = endTime.getTime() - startTime.getTime();
    let seconds = diff / 1000;
    return seconds;
}

//Return duration of visit in seconds
function getVisitDuration(visit) {
    let start = new Date(visit.time.start);
    let end = new Date(visit.time.end);
    let duration = getTime(start, end);


    //Case often occurs when the end time is undefined (Tab is still open, the visit is ongoing)
    if (duration < 0) {
        return 0; //Don't return invalid values
    }
    return duration;
}

//Return promise to retrieve information about a website
function getWebsite(website) {
    return new Promise(
        (resolve, reject) => {
            chrome.storage.local.get(`${website}`, function (result) {
                resolve(result[`${website}`]);
            });
        });
}


//Return total visit duration to website
async function getTotalVisits(website) {

    let total = await getWebsite(website).then(function (resolved) {
        let visits = resolved.visits;
        let duration = 0;

        visits.forEach(function (element) {
            duration += getVisitDuration(element);
        }, this);

        let tags = resolved.tags;

        return [duration, tags];

        });

    return total;
}

//Retrieve list of websites (keys in local storage)
function getWebsites(){
    return new Promise(
        (resolve, reject) => {
            chrome.storage.local.get(null, function (results) {
                resolve(results);
            });
        }
    )
}

//Calculate totals for visit durations

async function calculateTotals(){
    let webResults = await getWebsites().then(function (websites) {
        return websites;
    })
    let websiteList = Object.keys(webResults);

    //Iterate through websites with stored visits
    for (let websiteName of websiteList) { 

        let total = await getTotalVisits(websiteName);
        let visitDuration = total[0];
        let tags = total[1];

        //Iterate through tags stored for this website
        for (let tag of tags) { 
            //Add to tag total visit time
            if (tagDurations[tag] == undefined) {
                tagDurations[tag] = 0;
            }
            tagDurations[tag] += parseInt(visitDuration);
        }

        visitDurations.push([websiteName, visitDuration]);
    }

    //Sort map of site to visit duration
    visitDurations.sort(function (a, b) {
        return b[1] - a[1];
    });
}

//Produce a chart of visit totals
async function chartTotals() {

    //Let the async functions populate data before proceeding
    await calculateTotals();

    //Retrieve top 6 most visited sites from history
    let sites = 6;
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


chartTotals();