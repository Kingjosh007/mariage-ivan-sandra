var apiLink = "https://mock-test-api.herokuapp.com/";
var weddingHeadInfos = document.getElementById("weddingHeadInfos");

var themeColor1Elts = document.querySelectorAll(".themecolor1");
var themeColor1TxtElts = document.querySelectorAll(".themecolor1-text");
var themeColor2Elts = document.querySelectorAll(".themecolor2");
var themeColor2TxtElts = document.querySelectorAll(".themecolor2-text");

var majorRoutes = ["weddingInfos", "ceremonySettings", "guests", "tables"];

let weddingInfos = {};

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
  weddingHeadInfos.innerHTML = `<span id="wedsNames" style="margin-left: 50px;" class="text-white">${json.groomsName + " & " + json.maidsName} <i class="fa fa-heart" style="color: red; margin-left: 10px;"></i> </span>`;
}

function updateColorThemes() {
    let json = getFromLocalStorage("ceremonySettings");
      let color1 = json.themeColor1;
      let color2 = json.themeColor2;

      themeColor1Elts = document.querySelectorAll(".themecolor1");
      themeColor1TxtElts = document.querySelectorAll(".themecolor1-text");
      themeColor2Elts = document.querySelectorAll(".themecolor2");
      themeColor2TxtElts = document.querySelectorAll(".themecolor2-text");

      for (let i = 0; i < themeColor1Elts.length; i++) {
        themeColor1Elts[i].style.backgroundColor = color1;
      }
      for (let i = 0; i < themeColor1TxtElts.length; i++) {
        themeColor1Elts[i].style.color = color1;
      }
      for (let i = 0; i < themeColor2Elts.length; i++) {
        themeColor2Elts[i].style.backgroundColor = color2;
      }
      for (let i = 0; i < themeColor2TxtElts.length; i++) {
        themeColor2Elts[i].style.color = color2;
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


function showNotification(notificationMsg, notificationPos="bottom middle", notificationType="succes"){
    $.notify(notificationMsg, {
        className: notificationType,
        globalPosition: notificationPos
    });
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'omit',
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

// Example PUT method implementation:
async function putData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'omit',
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }