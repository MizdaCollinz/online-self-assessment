var visitDurations = []; // Entries are [websitename,totalvisits]
var tagDurations = {}; // Object with Tag names as keys, total visit duration as values e.g Social Network 
var sites = 6;

// Line graph data storage
// 14 days data
var lineData14days = [];
var lineLabels14days =[];
var lineValues14days = [];
// 12 weeks data
var lineData12weeks = [];
var xLabel12weeks = [];
var lineLabels12weeks =[];
var lineValues12weeks = [];


// Bundles dataset
function bundleLineData(dateSpan) {
    if (dateSpan === '14') {
        lineData14days.push(lineLabels14days)
        lineData14days.push(lineValues14days)
    } else if (dateSpan === '12') {
        lineData12weeks.push(lineLabels12weeks)
        lineData12weeks.push(lineValues12weeks)
    }
}

// Calculates 14 days
async function prefetchDays() {
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }
    console.log("prefetching days");
    await generateDatasets(sites, 14, lineLabels14days, lineValues14days);    
    console.log("finished prefetching days");
}


// Calculates 12 weeks
async function prefetchWeeks() {
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }
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

// Return the total visit duration of a single day
async function getSingleDayVisits(website, day) {
    
        let singleDayTotal = await getWebsite(website).then(function (resolved) {
            let visits = resolved.visits;
            let duration = 0;
    
            visits.forEach(function (element) {
                //console.log(day);
                duration += getSingleDayVisitDuration(element, day);
            }, this);
    
            return duration;
        });
    
        return singleDayTotal;
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

// Generates datasets for line graph plot
async function generateDatasets(sites, dateSpan, datasetLabels, datasetValues) {
// Iterates through top 6 sites
    for (i = 0; i < sites; i++) {
        // Adds each line for each website
        let tempWebsiteVar = visitDurations[i][0];
        datasetLabels.push(cutName(tempWebsiteVar));

        // Iterates through specified dateSpan of history depending on if 14 days or 12 weeks
        let websiteValues = [];
        if (dateSpan === 14) {
            for (let j = 0; j < dateSpan; j++) {
                curDate = new Date();
                curDate.setDate(curDate.getDate() - dateSpan + 1 + j);
                await getSingleDayVisits(tempWebsiteVar, curDate).then(function(resolve) {
                    websiteValues.push(resolve);
                });
            }

            datasetValues.push(websiteValues);

        } else if (dateSpan === 12) {
            for (let j = 0; j < dateSpan*7; j++) {
                curDate = new Date();
                curDate.setDate(curDate.getDate() - dateSpan*7 + 1 + j);
                //console.log(curDate);
                await getSingleDayVisits(tempWebsiteVar, curDate).then(function(resolve) {
                    websiteValues.push(resolve);
                });
            }

            finalWebsiteValues = convertDurationDaysToWeeks(websiteValues);
            console.log(finalWebsiteValues);
            datasetValues.push(finalWebsiteValues);
        }
    }
}

function convertDurationDaysToWeeks(inputDays) {
    let resultValues = [];
    let totalDays = inputDays.length;
    let counter = 0;
    while (counter < totalDays) {
        let i = 0;
        let sum = 0;
        for (i; i < 7; i++) {
            sum = sum + inputDays[counter];
            counter++;
        }
        resultValues.push(sum);
    }

    return resultValues;
}

function getLineBundle(dateSpan) {
    if (dateSpan === '14') {
        return lineData14days;
    } else if (dateSpan === '12') {
        return lineData12weeks;
    }
}

async function fetchInitialData() {
    await calculateTotals();
}

async function fetchLineGraphData() {
    await prefetchDays();
    await prefetchWeeks();
    bundleLineData('14');
    bundleLineData('12');
}
