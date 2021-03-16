function randomNumberID() {
    return Math.floor(Math.random() * (1000002 - 1 + 1)) + 1;
}
$(document).ready(function() {
    getguestLists();
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

            //Add new guest to localStorage. The localStorage key for all the guest is guestList'
            if (localStorage.getItem("guestList") === null || localStorage.getItem("guestList") === [] || localStorage.getItem("guestList") === undefined) {
                let guestList = [];
                guestList.push(newguest);
                localStorage.setItem("guestList", JSON.stringify(guestList));
            } else {
                let guestList = JSON.parse(localStorage.getItem("guestList"));
                guestList.push(newguest);
                localStorage.setItem("guestList", JSON.stringify(guestList));
            }
        } else {
            alert('All fields are required. Please check your entries again');
        }
        getguestLists();

        resetForm();
        e.preventDefault();
    }

}); //DocumentBody end tag

//get the data stored in the localStorage for display on load
function getguestLists() {
    if (localStorage.getItem("guestList") === null) {
        alert("Your dashboard is currently empty. Use the add button to add new guests.");
        document.getElementById("search").disabled = true;
    } else {
        document.getElementById("search").disabled = false;
        let guestList = JSON.parse(localStorage.getItem("guestList"));
        let guestDisplay = document.getElementById('guestDisplay');
        //Display result
        guestDisplay.innerHTML = '';
        for (let i = 0; i < guestList.length; i++) {
            let id = guestList[i].id;
            let name = guestList[i].name;
            let category = guestList[i].category;
            let description = guestList[i].description;

            guestDisplay.innerHTML += '<li class="list-group-item"><strong>' + name + '</strong><p>' + category + '</p><p>' + description + '</p><p><a' +
                ' href="#" onclick="editguest(\'' + id + '\')" data-toggle="modal" data-target="#addNewguestModal">' +
                '<i class="fa fa-edit green-text darken-2 "></i>&nbsp;Edit</a> &nbsp;&nbsp; ' +
                '<a href="#" id="deleteId" onclick="deleteguest(\'' + id + '\')"><i class="fa fa-trash' +
                ' red-text' +
                ' darken-2"></i>&nbsp;' +
                ' Delete</a>' +
                ' </p>' +
                '</li>';
        }
    }
}


// deleting the main bookmark.
function deleteguest(id) {
    let guestList = JSON.parse(localStorage.getItem("guestList"));
    for (let i = 0; i < guestList.length; i++) {
        if (guestList[i].id === id) {
            guestList.splice(i, 1);
            //console.log(result);
        }
    }
    localStorage.setItem("guestList", JSON.stringify(guestList)); //reset the values in the local storage
    getguestLists(); // to quickly display what is remaining from local storage.
}

// Editing a guest
function editguest(id) {
    "use strict";
    document.getElementById('modalSubmit').style.display = "none";
    document.getElementById("addNewguestModalLabel").textContent = "Edit guest";

    let tempId = id;
    let parentDiv = document.getElementById('modalFooter');
    let guestList = JSON.parse(localStorage.getItem("guestList"));


    if (parentDiv.contains(document.getElementById("editButton"))) {
        document.getElementById('editButton').disabled = false;
    } else {
        let editButton = document.createElement('button');
        editButton.id = "editButton";
        editButton.className = "fa fa-hdd-o btn btn-outline-primary btn-sm m-2";
        editButton.textContent = " Save data";
        parentDiv.appendChild(editButton);
    }
    for (let i = 0; i < guestList.length; i++) {
        if (guestList[i].id === id) {
            document.getElementById("guestName").value = guestList[i].name;
            document.getElementById("guestDescription").value = guestList[i].description;
            document.getElementById("guestCategory").value = guestList[i].category;
        }
    }

    document.getElementById("editButton").addEventListener("click", function() {
        addguest();
        let guestList = JSON.parse(localStorage.getItem("guestList"));
        for (let i = 0; i < guestList.length; i++) {
            if (guestList[i].id === tempId) {
                guestList.splice(i, 1);
            }
        }
        localStorage.setItem("guestList", JSON.stringify(guestList));
        getguestLists();
        resetForm();
        document.getElementById("editButton").style.display = "none";

        $(".addNewguest").on('click', guestFormReset());

    });

}

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

function addguest() {
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
        if (localStorage.getItem("guestList") === null || localStorage.getItem("guestList") === [] || localStorage.getItem("guestList") === undefined) {
            let guestList = [];
            guestList.push(newguest);
            localStorage.setItem("guestList", JSON.stringify(guestList));
        } else {
            let guestList = JSON.parse(localStorage.getItem("guestList"));
            guestList.push(newguest);
            localStorage.setItem("guestList", JSON.stringify(guestList));
        }
    }
}

//holdval_ document.getElementById('editButton').style.display = "none"; //checks in case of disabled button.