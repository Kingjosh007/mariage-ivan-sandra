let apiLink = "https://mock-test-api.herokuapp.com/";
let weddingHeadInfos = document.getElementById("weddingHeadInfos");

var themeColor1Elts = document.querySelectorAll(".themecolor1");
var themeColor1TxtElts = document.querySelectorAll(".themecolor1-text");
var themeColor2Elts = document.querySelectorAll(".themecolor2");
var themeColor2TxtElts = document.querySelectorAll(".themecolor2-text");

let weddingInfos = {};

function updateWeddingsInfos() {
    fetch(apiLink + "weddingInfos")
        // Handle success
        .then(response => response.json()) // convert to json
        .then(json => {
            weddingHeadInfos.innerHTML = `<span id="wedsNames" style="margin-left: 50px;" class="text-white">${json.groomsName + " & " + json.maidsName} <i class="fa fa-heart" style="color: red; margin-left: 10px;"></i> </span> `;
        }) // print data to console
        .catch(err => console.log('Request Failed', err))
}

function updateColorThemes() {
    fetch(apiLink + "ceremonySettings")
        // Handle success
        .then(response => response.json()) // convert to json
        .then(json => {
            let color1 = json.themeColor1;
            let color2 = json.themeColor2;

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

        }) // print data to console
        .catch(err => console.log('Request Failed', err))
}

function randomNumberID() {
    return Math.floor(Math.random() * (1000002 - 1 + 1)) + 1;
}


$(document).ready(function() {

    updateWeddingsInfos();
    updateColorThemes();
    document.getElementById('modalSubmit').addEventListener('click', modalSubmit);

    function modalSubmit(e) {
        let guestTempId = randomNumberID();
        let guestName = document.getElementById('guestName').value;
        let guestDescription = document.getElementById('guestDescription').value;
        let guestCategory = document.getElementById('guestCategory').value;

        const guestId = guestTempId + guestName + randomNumberID(); //Used to give each guest a unique id
        if (guestName !== '' && guestDescription !== '') {
            let newguest = {
                id: guestId,
                name: guestName.toUpperCase(),
                category: guestCategory,
                description: guestDescription
            };




        } else {
            alert('All fields are required. Please check your entries again');
        }

        resetForm();
        e.preventDefault();
    }

});



function resetForm() {
    document.getElementById("guestName").value = "";
    document.getElementById("guestDescription").value = "";
    document.getElementById("guestCategory").value = "";
}

function guestFormReset() {
    document.getElementById('modalSubmit').style.display = "block";
    document.getElementById("addNewguestModalLabel").textContent = "New guest Form";
    document.getElementById('editButton').style.display = "none";
}