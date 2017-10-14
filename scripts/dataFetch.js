let visitDurations = []; // Entries are [websitename,totalvisits]
let tagDurations = {}; // Object with Tag names as keys, total visit duration as values e.g Social Network 

// Line graph data storage
// 14 days data
let lineData14days = [];
let xLabel14days = [];
let lineLabels14days =[];
let lineValues14days = [];
// 12 weeks data
let lineData12weeks = [];
let xLabel12weeks = [];
let lineLabels12weeks =[];
let lineValues12weeks = [];

// Calculates total


// Bundles dataset
function bundleLineData(dateSpan) {
    if (dateSpan === '14') {
        lineData14days.push(xLabel14days);
        lineData14days.push(lineLabels14days)
        lineData14days.push(lineValues14days)
    } else if (dateSpan === '12') {
        lineData12weeks.push(xLabel12weeks);
        lineData12weeks.push(lineLabels12weeks)
        lineData12weeks.push(lineValues12weeks)
    }
}

// Calculates 14 days
async function prefetchDays() {
    let sites = 6;
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }
    xLabel14days = generatexLabels(14);
    console.log("prefetching days");
    await generateDatasets(sites, 14, lineLabels14days, lineValues14days);    
    console.log("finished prefetching days");
}


// Calculates 12 weeks
async function prefetchWeeks() {
    let sites = 6;
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }
    xLabel12weeks = generatexLabels(12);
    console.log("prefetching weeks");    
    await generateDatasets(sites, 12, lineLabels12weeks, lineValues12weeks);
    console.log("finished prefetching weeks");    
    
}

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

// Return single day visit duration in seconds
function getSingleDayVisitDuration(visit, day) {
    let compareDay = new Date(day);
    compareDay.setHours(0,0,0,0);

    let startDay = new Date(visit.time.start);
    let tempStartDay = new Date(visit.time.start);
    tempStartDay.setHours(0,0,0,0);

    let endDay = new Date(visit.time.end);
    let tempEndDay = new Date(visit.time.end);
    tempEndDay.setHours(0,0,0,0);

    // TODO: Need to take into account overlapping days
    if (tempEndDay < compareDay) {
        return 0;
    } else if (tempStartDay > compareDay) {
        return 0;
    } else {
        let duration = getTime(startDay, endDay);
        
        //Case often occurs when the end time is undefined (Tab is still open, the visit is ongoing)
        if (duration < 0) {
            return 0; //Don't return invalid values
        }
        //console.log("A duration:" + duration);
        return duration;
    }
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

// Retrieve list of websites (keys in local storage)
function getWebsites() {
    return new Promise(
        (resolve, reject) => {
            chrome.storage.local.get(null, function (results) {
                resolve(results);
            });
        }
    )
}

// Calculate totals for visit durations
async function calculateTotals() {
    let webResults = await getWebsites().then(function (websites) {
        return websites;
    })
    let websiteList = Object.keys(webResults);
    tagDurations['Untagged'] = 0;

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

        if(tags == undefined || tags.length == 0){
            tagDurations['Untagged'] += parseInt(visitDuration);
        }

        visitDurations.push([websiteName, visitDuration]);
    }

    //Sort map of site to visit duration
    visitDurations.sort(function (a, b) {
        return b[1] - a[1];
    });
}

// Generates xLabels for line graph depending on how long and what scale it is measured in
function generatexLabels(dateSpan) {
    let xLabels = [];
    if (dateSpan === 14) {
        for (let i = 0; i < dateSpan; i++) {
            let curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan + 1 + i);
            console.log("xLabels entry:" + curDate.getDate() + "/" + curDate.getMonth());
            
            xLabels.push(curDate.getDate() + "/" + curDate.getMonth());
        }
    } else if (dateSpan === 12) {
        for (let i = 0; i < dateSpan; i++) {
            let curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan*7 + 1 + i*7);
            console.log("xLabels entry:" + curDate.getDate() + "/" + curDate.getMonth());
            
            xLabels.push(curDate.getDate() + "/" + curDate.getMonth());
        }
    }

    return xLabels;
}

// Generates datasets for line graph plot
async function generateDatasets(sites, dateSpan, datasetLabels, datasetValues) {
// Iterates through top 6 sites
    for (i = 0; i < sites; i++) {
        // Adds each line for each website
        let tempWebsiteVar = visitDurations[i][0];
        console.log(tempWebsiteVar);
        datasetLabels.push(tempWebsiteVar);

        // Iterates through specified dateSpan of history
        let websiteValues = [];
        for (let j = 0; j < dateSpan; j++) {
            curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan + 1 + j);
            //console.log(curDate.getDate());

            await getSingleDayVisits(tempWebsiteVar, curDate).then(function(resolve) {
                websiteValues.push(resolve);
            });
            
        }
        console.log(websiteValues);
        datasetValues.push(websiteValues);
    }
}

function getLineBundle(dateSpan) {
    if (dateSpan === '14') {
        return lineData14days;
    } else if (dateSpan === '12') {
        return lineData12weeks;
    }
}

async function buildInitialLineGraph() {
    let lineContext = document.getElementById("lineGraph").getContext('2d');
    let lineChart = buildSingleLineGraph(lineContext, lineData14days[0], lineData14days[1], lineData14days[2], 1);
    
}

async function fetchInitialData() {
    let calculateTotalPromise = new Promise((resolve, reject) => {
        calculateTotals();
        resolve();
    });

    let prefetchDaysPromise = new Promise((resolve, reject) => {
        prefetchDays();
        resolve();
    })

    calculateTotalPromise.then(() => {
        console.log(visitDurations);
    });
    //await calculateTotals();
    //await prefetchDays();
    await prefetchWeeks();
    await bundleLineData('14');
    await bundleLineData('12');
    console.log("Data: " + lineData14days);
    console.log("Data: " + lineData12weeks);
    console.log(visitDurations);
    
}

// console.log("dataFecth");
// fetchInitialData().then(() => {
//     console.log("finished fetching initial data");
//     //buildInitialLineGraph();
// });