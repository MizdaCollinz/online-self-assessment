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

// Return the total visit duration of a single day
async function getSingleDayVisits(website, day) {

    let singleDayTotal = await getWebsite(website).then(function (resolved) {
        let visits = resolved.visits;
        let duration = 0;

        visits.forEach(function (element) {
            duration += getSingleDayVisitDuration(element, day);
        }, this);

        return duration;
    });

    return singleDayTotal;
}

//Retrieve list of websites (keys in local storage)
function getWebsites() {
    return new Promise(
        (resolve, reject) => {
            chrome.storage.local.get(null, function (results) {
                resolve(results);
            });
        }
    )
}

//Calculate totals for visit durations

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

//Produce a chart of visit totals
function chartTotals() {

    //Retrieve top 8 most visited sites from history
    let sites = 8;
    if (visitDurations.length < 8) {
        sites = visitDurations.length;
    }

    let labels = [];
    let values = [];

    for (let i = 0; i < sites; i++) {
        labels.push(cutName(visitDurations[i][0]));
        values.push(visitDurations[i][1]);
    } 

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
    for (let i=0; i<8; i++) {
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

// Produce line grpah of visited websites
function buildLineGraphs() {
    
    // Retrieve top 6 most visited sites from history
    let sites = 6;
    if (visitDurations.length < 6) {
        sites = visitDurations.length;
    }

    let xLabels = [];
    let datasetLabels = [];
    let datasetValues = [];

    // Generate x axis labels
    let dateSpan = 10;
    for (let i = 0; i < dateSpan; i++) {
        let curDate = new Date();
        curDate.setDate(curDate.getDate() - dateSpan + 1 + i);
        //console.log("xLabels entry:" + curDate.getDate() + "/" + curDate.getMonth());
        
        xLabels.push(curDate.getDate() + "/" + curDate.getMonth());
    }


    // Iterates through top 6 sites
    for (i = 0; i < sites; i++) {
        // Adds each line for each website
        let tempWebsiteVar = visitDurations[i][0];
        datasetLabels.push(cutName(tempWebsiteVar));

        
        
        // Iterates through specified dateSpan of history
        let websiteValues = [];
        for (let j = 0; j < dateSpan; j++) {
            curDate = new Date();
            curDate.setDate(curDate.getDate() - dateSpan + 1 + j);

            getSingleDayVisits(tempWebsiteVar, curDate).then(function(resolve) {
                websiteValues.push(resolve);
            });
            
        }
        datasetValues.push(websiteValues);
    }

    let lineContext = document.getElementById("lineGraph").getContext('2d');
    let lineChart = buildSingleLineGraph(lineContext, xLabels, datasetLabels, datasetValues, dateSpan);
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
    let nameNode = document.createTextNode(name);
    nameCell.appendChild(nameNode);

    let perCell = document.createElement('td');
    let perNode = document.createTextNode(value);
    perCell.appendChild(perNode);

    row.appendChild(nameCell);
    row.appendChild(perCell);
    
    return row;
}


//Remove www from url names
function cutName(website){
    let url = website;
    if (url.startsWith("www.")){
        url = url.replace('www.','');
    }
    return url;
}


async function setup() {
    //Let the async functions populate data before proceeding
    await calculateTotals();
    chartTotals();
    buildTables();
    buildLineGraphs();
}

setup();