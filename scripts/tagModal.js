//Initialize modal

$('.modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        let table = document.getElementById('siteTable');
        buildSiteTable(table);
    },
    complete: function() { } // Callback for Modal close
  }
);

//Initialize Dropdown

$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrainWidth: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left', // Displays dropdown with edge aligned to the left of button
    stopPropagation: false // Stops event propagation
  }
);

let buildTable = true;

async function getUntagged(){
    let webResults = await getWebsites().then(function (websites) {
        return websites;
    });
    let websiteList = Object.keys(webResults);
    let untaggedSites = [];

    //Iterate through websites
    for(let websiteName of websiteList){
        let tags = webResults[websiteName].tags;
        if (tags != undefined && tags.length == 0){
            untaggedSites.push(websiteName);
        } 
    }
    return untaggedSites;
}


// Get sites that dont have tags
async function buildSiteTable(table){
    if(buildTable){
        buildTable = false;

        let untaggedSites = await getUntagged();

        for (let site of untaggedSites){

            if (site == undefined || site == ""){
                continue;
            }

            let row = buildRow(cutName(site),'');
            row.getElementsByTagName('td')[0].setAttribute('url',site);
            let col2 = row.getElementsByTagName('td')[1];
            
            let dropdown = createDropdown();
            
            let button = document.createElement('button');
            button.className = "modal-button";
            button.innerText = "Add Tag";
            button.onclick = function(){
                let tr = this.closest('tr');
                let td = tr.getElementsByTagName('td')[0]; //Website name is in first column
                let website = td.getAttribute('url');

                let parent = this.parentElement;
                let dropdown = parent.getElementsByTagName('select')[0];
                let tag = $(dropdown).val();
                
                addNewTag(website, tag);

                parent.innerHTML += "&#10004";
            };
            col2.appendChild(dropdown);
            col2.appendChild(button);
            table.appendChild(row);
        }
    }
    
}

function getTagset(){
    return Object.keys(tagDurations);
}

function createDropdown(){
    let select = document.createElement('select');
    let option = document.createElement('option');
    option.innerText= "Choose Tag";
    option.setAttribute('selected', true);
    option.setAttribute('hidden', true);
    option.setAttribute('disabled', true);
    select.appendChild(option);

    for (let tag of getTagset()){
        if(tag === "Untagged"){ continue; }

        let option = document.createElement('option');
        option.setAttribute('value',tag);
        option.innerText = tag;
        select.appendChild(option);
    }

    return select;
}

function addNewTag(website, tag){

    let newTag = new Promise(function(resolve,reject) {
        chrome.storage.local.get(`${website}`, function(result){
            resolve(result[`${website}`]);
        });
    }).then(function(resolvedObj) {
        let tags = resolvedObj.tags;
        if (tags.includes(tag)){
            return;
        } else {
            if(tags != undefined){
                tags.push(tag);
            }
        }
 
        let object = {};
        object[website] = resolvedObj;
        //Set new tags back in the storage
        chrome.storage.local.set(object);
    });
           
}

    