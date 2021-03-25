var apiLink = "https://mock-test-api.herokuapp.com/";
var weddingHeadInfos = document.getElementById("weddingHeadInfos");

var themeColor1Elts = document.querySelectorAll(".themecolor1");
var themeColor1TxtElts = document.querySelectorAll(".themecolor1-text");
var themeColor2Elts = document.querySelectorAll(".themecolor2");
var themeColor2TxtElts = document.querySelectorAll(".themecolor2-text");

var majorRoutes = ["weddingInfos", "ceremonySettings", "guests", "tables"];

let weddingInfos = {};

var defaultTableName = "SANS NOM";

function getAndCacheVar(varName)
{
    fetch(apiLink + "" + varName)
    // Handle success
    .then((response) => response.json()) // convert to json
    .then((json) => {
        console.log(json);
        saveToLocalStorage(varName, json);
        console.log(varName + " saved to LocalStorage successfully");
    }) // print data to console
    .catch((err) => console.log("Failed to saved " + varName, err));
}

function updateWeddingsInfos() {
  let json = getFromLocalStorage("weddingInfos");
  $("#weddingHeadInfos").html(`<span id="wedsNames" style="margin-left: 50px;" class="text-white">${json.groomsName + " & " + json.maidsName} <i class="fa fa-heart" style="color: red; margin-left: 10px;"></i></span>`);
}

function updateColorThemes() {
    let json = getFromLocalStorage("ceremonySettings");
      let color1 = json.themeColor1;
      let color2 = json.themeColor2;

     var themeColor1Elts = document.querySelectorAll(".themecolor1");
      var themeColor1TxtElts = document.querySelectorAll(".themecolor1-text");
      var themeColor2Elts = document.querySelectorAll(".themecolor2");
      var themeColor2TxtElts = document.querySelectorAll(".themecolor2-text");

      for (let i = 0; i < themeColor1Elts.length; i++) {
        themeColor1Elts[i].style.backgroundColor = color1;
      }
      for (let i = 0; i < themeColor1TxtElts.length; i++) {
        themeColor1TxtElts[i].style.color = color1;
      }
      for (let i = 0; i < themeColor2Elts.length; i++) {
        themeColor2Elts[i].style.backgroundColor = color2;
      }
      for (let i = 0; i < themeColor2TxtElts.length; i++) {
        themeColor2TxtElts[i].style.color = color2;
      }
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    let retVal = localStorage.getItem(key);

    if(retVal != null)
        retVal = JSON.parse(retVal)

  return retVal;
}


function showNotification(notificationMsg, notificationType="success", notificationPos="bottom center"){
    $.notify(notificationMsg, {
        className: notificationType,
        globalPosition: notificationPos
    });
}

// Example POST method implementation:
async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors', 
      headers: {
          "Content-type": "application/json"},
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

// Example PUT method implementation:
async function putData(url = "", data = {}) {
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors', 
      headers: {"Content-type": "application/json"},
      credentials: 'omit',
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

// Example DELETE method implementation:
async function deleteData(url = "", id) {
    const response = await fetch(url+"/"+id, {
      method: 'DELETE',
      mode: 'cors', 
      headers: {"Content-type": "application/json"},
      credentials: 'omit'
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  function prefillForm(data){
    for(key in data)
    {
        if(data.hasOwnProperty(key))
            $('input[name='+key+']').val(data[key]);
    }
}

function compareNames( a, b ) {
    if ( a.guestName < b.guestName ){
      return -1;
    }
    if ( a.guestName > b.guestName ){
      return 1;
    }
    return 0;
  }

  function solveTableMatchingConflicts(){
      getAndCacheVar("guests");
      getAndCacheVar("tables");
      let allGuests = getFromLocalStorage("guests");
      let allTables = getFromLocalStorage("tables");
      let problemsCount = 0;
      let problemsSolvedCount = 0;
      if(allGuests != null && allTables != null && allGuests.length > 0 && allTables.length > 0)
      {
         for(let g of allGuests)
         {
             if(g.hasOwnProperty("guestTableId"))
             {
                 let hisTable = allTables.find(t => t.id == g.guestTableId);
                 if(!hisTable["tableGuestsIds"].includes(g.id))
                 {
                    let newT = {};
                    problemsCount++;
                    for(let k in hisTable)
                    {
                        if(k != "tableGuestsIds")
                        newT[k] = hisTable[k];
                    }
                    let newTGI = hisTable["tableGuestsIds"];
                    newTGI.push(g.id);
                    newT["tableGuestsIds"] = newTGI;
                    putData(apiLink + "tables/"+hisTable.id, newT)
                    .then(dt => {
                            console.log("Règlement d'un conflit d'association invité->table");
                            problemsSolvedCount++;
                    })
 
                 }
             }
         }
         for(let t of allTables)
         {
             let allAssociatedGuests = allGuests.filter(ag => t.tableGuestsIds.includes(ag.id));
             let allAssociatedGuestsWithConflict = allAssociatedGuests.filter(ag => !ag.hasOwnProperty("guestTableId") || ag.guestTableId != t.id);
             if(allAssociatedGuestsWithConflict.length > 0)
             {
                let newAssociatedGuests = allAssociatedGuestsWithConflict.map(ag => {
                    let newAg = ag;
                    newAg["guestTableId"] = t.id;
                    return newAg;
                });
                for(let nag of newAssociatedGuests)
                {
                    problemsCount++;
                    putData(apiLink + "guests/"+nag.id, nag)
                    .then(dt => {
                            console.log("Règlement d'un conflit d'association table->invité");
                            problemsSolvedCount++;
                    })
                }
             }
             
         }
         console.log("Règlement de " + problemsSolvedCount + " problèmes " + " d'association de tables sur " + problemsCount + " rencontrés");
      }
      getAndCacheVar("guests");
      getAndCacheVar("tables");
  }