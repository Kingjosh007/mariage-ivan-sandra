var filteredGuests = [];

function createGuestId()
{
    let gId = 1;
    let allExistingGuests = getFromLocalStorage("guests");
    allExistingGuests = allExistingGuests.sort((a, b) => a.id - b.id)
    if(allExistingGuests == null)
        return 1;
    let i = 0;
    while(allExistingGuests.filter(eg => eg.id == gId).length > 0)
    {
        gId++; i++;
    }
    return gId;
}

let categoryMatchObj = {
    "ManCloseFam": "Famille proche du marié",
    "ManBroadFam": "Famille large du marié",
    "ManBuddies": "Amis du marié",
    "ManChurch": "Eglise du marié (cadre spirituel)",
    "ManColleagues": "Collègues du marié",
    "ManPeople": "Connaissances du marié",
    "WomanCloseFam": "Famille proche de la mariée",
    "WomanBroadFam": "Famille large de la mariée",
    "WomanBuddies": "Ami(e)s de la mariée",
    "WomanChurch": "Eglise de la mariée (cadre spirituel)",
    "WomanColleagues": "Collègues de la mariée",
    "WomanPeople": "Connaissances de la mariée",
    "KnownByBoth": "Connaissances communes aux deux mariés",
    "Other": "Autres"
};

function handleAddGuestSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

    let guestGender = value["guestTitle"] == "M." ? "M" : "F";
    let guestInfos = {
        "id": createGuestId(),
        "guestTitle": value["guestTitle"],
        "guestName": value["guestName"],
        "guestGender": guestGender,
        "guestNotes": value["guestDescription"],
        "guestCategory": categoryMatchObj[""+value["guestCategory"]],
    };
    if(value.hasOwnProperty("guestTable") && value["guestTable"]!=undefined && value["guestTable"] != "/")
    {
        guestInfos["guestTableId"] = Number(value["guestTable"]);
    }

    postData(apiLink + "guests", guestInfos)
    .then(data => {
        let allTables = getFromLocalStorage("tables");
        if(allTables != null)
        {
            let thisGuestTable = allTables.filter(t => t.id == data.guestTableId)[0];
            let tgids = thisGuestTable["tableGuestsIds"];
            if(!tgids.includes(data.id))
                tgids.push(data.id)
            thisGuestTable["tableGuestsIds"] = tgids;
            putData(apiLink + "tables/" + thisGuestTable.id, thisGuestTable)
                    .then(data => {
                        console.log("Invité associé à la table " + thisGuestTable.id);
            });
        }
        
        showNotification("Invité enregistré", "success", "bottom center");

        setTimeout(function(){ 
            solveTableMatchingConflicts();
            location.reload() }, 2000);
    });
    
}

function handleEditClick(e)
{
    let allTables = getFromLocalStorage("tables");
    let allGuests = getFromLocalStorage("guests");

    document.getElementById("editguestTable").innerHTML = "";
    let selectHTML = `<option value="/" selected>Table non attribuée</option>`;
    if(allTables != null)
    {
        let allFreeTables = allTables.filter(t => t["tableGuestsIds"].length < t["tableMaxSeats"])
                                        .sort((a, b) => a.id - b.id);
        
        if(allFreeTables.length > 0)
        {
            
            selectHTML += allFreeTables.map(ft => `<option value="${ft.id}">Table ${ft.id}: ${ft.tableName}</option>`).join("");
            document.getElementById("editguestTable").innerHTML = selectHTML;
        }
        
    }

    let guestToEditId = Number(e.target.getAttribute("data-gid"));
    let guestToEdit = allGuests.find(g => g["id"] == guestToEditId);

    let guestToEditCategoryValue = Object.keys(categoryMatchObj).find(el => categoryMatchObj[el]==guestToEdit["guestCategory"]);
    if(guestToEditCategoryValue == undefined || guestToEditCategoryValue.length == 0)
        guestToEditCategoryValue = "Other";

    
    
    let dataToPrefillWith = {
        editguestTitle: guestToEdit.guestTitle,
        editguestName: guestToEdit.guestName,
        editguestCategory: guestToEditCategoryValue,
        editguestTable: ""+guestToEdit.guestTableId,
        editguestDescription: guestToEdit.guestNotes
    };

    prefillForm(dataToPrefillWith);

    document.getElementById('editGuestForm').addEventListener('submit', (e) => handleEditGuestSubmit(e, guestToEditId));

}

function handleEditGuestSubmit(event, id) {
    event.preventDefault();
    const data = new FormData(event.target);

    const myValues = Object.fromEntries(data.entries());
    const value = {};
    for(let k in myValues)
    {
        value[k.split("edit")[1]] = myValues[k];
    }
    console.log(myValues);
    console.log(value);
    let guestGender = value["guestTitle"] == "M." ? "M" : "F";
    let guestInfos = {
        "id": createGuestId(),
        "guestTitle": value["guestTitle"],
        "guestName": value["guestName"],
        "guestGender": guestGender,
        "guestNotes": value["guestDescription"],
        "guestCategory": categoryMatchObj[""+value["guestCategory"]],
    };
    if(value.hasOwnProperty("guestTable") && value["guestTable"]!=undefined && value["guestTable"] != "/")
    {
        guestInfos["guestTableId"] = Number(value["guestTable"]);
    }
    console.log(guestInfos);

    putData(apiLink + "guests/"+id, guestInfos)
    .then(data => {
        let allTables = getFromLocalStorage("tables");
        if(allTables != null)
        {
            let thisGuestTable = allTables.filter(t => t.id == data.guestTableId)[0];
            let tgids = thisGuestTable["tableGuestsIds"];
            if(!tgids.includes(data.id))
            {
                tgids.push(data.id);
                thisGuestTable["tableGuestsIds"] = tgids;
                putData(apiLink + "tables/" + thisGuestTable.id, thisGuestTable)
                        .then(data => {
                            console.log("Invité associé à la table " + thisGuestTable.id);
                });
            }
             
        }
        showNotification("Invité modifié", "success", "bottom center");

        setTimeout(function(){ 
            solveTableMatchingConflicts();
            location.reload() }, 2000);
    });
    
}

function displayGuestsStats(guestsArr)
{
    let guestsWithoutTable = guestsArr.filter(g => !g.hasOwnProperty("guestTableId"));
    let guestsInstalled = guestsArr.filter(g => g.hasOwnProperty("guestStatus") && g["guestStatus"] == "Installed");
    $("#totalGuestsNb").text(" " + guestsArr.length);
    $("#guestsWithoutTableNb").text(" " + guestsWithoutTable.length);
    $("#guestsInstalledNb").text(" " + guestsInstalled.length);

}

function displayGuestsTable(guestsArr=getFromLocalStorage("guests"), sortCrit="name")
{
    displayGuestsStats(guestsArr);
    let guestsSorted = guestsArr.sort(compareNames);

    if(sortCrit == "table")
    {
        guestsSorted = guestsArr.sort((a, b) => {
            let valuea = a.hasOwnProperty("guestTableId") ? a.guestTableId: 0;
            let valueb = b.hasOwnProperty("guestTableId") ? b.guestTableId: 0;
            return  valuea - valueb;
        });
    }
    let guestsDisplayArea = document.getElementById("tableBody");
    let allTables = getFromLocalStorage("tables");

    guestsDisplayArea.innerHTML = ``;
    let guestsDisplayHTML = "";
    if(guestsArr.length == 0)
    {
        let complement = "Veuillez enregistrer un invité.";
        if(document.getElementById("searchGuestInput").value.length > 0)
            complement = "Veuillez modifier les termes de votre recherche.";
        guestsDisplayHTML = "<tr class='table-light'>";
        guestsDisplayHTML += "<td colspan='3'><em>Aucun invité trouvé." + complement + "<em></td>";
        guestsDisplayHTML += "</tr>";
    }
    else
    {
        for(let g of guestsSorted)
        {
            let tableNameInfo = "";
            let tableClass = "";


            if(!g.hasOwnProperty("guestTableId"))
            {
                tableNameInfo =  "/";
                tableClass = "table-danger";
            }
            else
            {
                tableClass = "table-light";
                let gTableInfos = allTables.filter(t => t.id == g.guestTableId)[0];
                tableNameInfo = `Table ${gTableInfos["id"]}: ${gTableInfos["tableName"]}`;

                if(g.hasOwnProperty("guestStatus") && g.guestStatus == "Installed")
                {
                    tableClass = "table-success";
                }
            }
           
            let thisGuestHTML = `<tr class="${tableClass}">
            <td class="showGuestInfo" data-gid="${g.id}">${g.guestTitle} ${g.guestName}</td>
            <td class="showGuestInfo" data-gid="${g.id}">${tableNameInfo}</td>
            <td>
                <ul class="list-inline m-0">
                    <li class="list-inline-item btn-outline-warning">
                        <i class="fas fa-edit editGuestInfo" data-gid="${g.id}" data-toggle="modal" data-target="#editGuestModal"></i>
                    </li>
                    <li class="list-inline-item">
                        <i class="fas fa-trash-alt btn-outline-danger deleteGuest" data-gid="${g.id}"></i>
                    </li>
                    ${tableClass != "table-danger" && tableClass != "table-success" ? "<li class='list-inline-item  btn-outline-success'><i class='fas fa-check markGuestAsPresent' data-gid='" + g.id + "'></i></li>" : ""}
                    
                </ul>
            </td>
             </tr>`;

             guestsDisplayHTML += thisGuestHTML;
        }
    }
    guestsDisplayArea.innerHTML = guestsDisplayHTML;

    $(document).on("click", ".showGuestInfo", function(e) {
        let gid = Number(e.target.getAttribute("data-gid"));
        let allGuests = getFromLocalStorage("guests");
        let myGuest = allGuests.filter(el => el["id"] == gid)[0];
        console.log(myGuest);

        let msg = "<b class='mr-1 mb-3'> Titre: </b>" + myGuest["guestTitle"];
            msg += "<br> <b class='mr-1 mb-3'> Nom: </b>" + myGuest["guestName"];
        
        if(myGuest.hasOwnProperty("guestNotes") && myGuest["guestNotes"].length > 0)
            {
                msg += "<br><br> <b class='mr-1 mb-3'> Notes sur l'invité: </b>" + myGuest["guestNotes"];
            }
        else
        {
            msg += "<br><br> <b class='mr-1 mb-3'> Notes sur l'invité: </b>" + "/";
        }
        
            msg += "<br><br><b class='mr-1 mb-3 themecolor2-text'> Catégorie: </b>" + myGuest["guestCategory"];

            let tableDetails = "";
            if(myGuest.hasOwnProperty("guestTableId"))
            {
                let allTables = getFromLocalStorage("tables");
                tableDetails = "Table " + myGuest.guestTableId + ": " + allTables.find(t => t.id == myGuest.guestTableId).tableName;
            }
            else
            {
                tableDetails = "/";
            }
            msg += "<br><br> <b class='mr-1 mb-3'> Table prévue: </b>" + tableDetails;

        
            let statut = "Absent";
            if(myGuest.hasOwnProperty("guestStatus") && myGuest.guestStatus == "Installed")
            {
                msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-success text-light p-1 rounded mr-2'> Installé(e) </span> <i class='fa fa-check text-success' aria-hidden='true'></i>";
            } 
            else
            {
                if(!myGuest.hasOwnProperty("guestTableId"))
                {
                    statut = "Sans table";
                }
                if(statut == "Sans table")
                 msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-danger text-light p-1 rounded'> Sans table </span>";
                else
                 msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-warning text-light p-1 rounded'> Absent(e) </span>";
            } 
            

        bootbox.alert(
            {
                size: "small",
                title: "<b class='themecolor1-text'>Informations sur l'invité<b>",
                message: msg,
                backdrop: true,
                callback: function () {
                    updateColorThemes();
                }
            }
            );
    });


    $(document).on("click", ".deleteGuest", function(e) {
        let gid = Number(e.target.getAttribute("data-gid"));
        console.log(gid);
        let allGuests = getFromLocalStorage("guests");
        let myGuest = allGuests.filter(el => el["id"] == gid)[0];

        bootbox.confirm({
            message: "Êtes-vous sûr(e) de vouloir annuler l'invitation de <b>" + myGuest.guestName + "</b>",
            buttons: {
                confirm: {
                    label: 'Supprimer',
                    className: 'btn-danger'
                },
                cancel: {
                    label: 'Annuler',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                console.log('This was logged in the callback: ' + result);
                if(result === true)
                {
                    // Supprimer l'invité et le déconnecter de la table à laquelle il est affecté
                    deleteData(apiLink + "guests/", myGuest.id)
                                .then(data => 
                                    {
                                        showNotification("Invitation annulée.", "success");
                                        if(myGuest.hasOwnProperty("guestTableId"))
                                        {
                                            let allTables = getFromLocalStorage("tables");
                                            let tableToEdit = allTables.find(t => t.id == myGuest.guestTableId);
                                            let newTable = {};
                                            for(let k in tableToEdit)
                                            {
                                                if(k != "tableGuestsIds")
                                                {
                                                    newTable[k] = tableToEdit[k];
                                                }
                                            }
                                            if(tableToEdit.hasOwnProperty("tableGuestsIds"))
                                            {
                                                newTable["tableGuestsIds"] = tableToEdit["tableGuestsIds"].filter(el => el != myGuest.id);
                                            }
                                            putData(apiLink + "tables/"+tableToEdit.id, newTable)
                                            .then(dt => {
                                                console.log("Invité déconnecté de la table " + dt.id);
                                                setTimeout(function(){
                                                    getAndCacheVar("tables");
                                                    getAndCacheVar("guests");
                                                     location.reload() }, 3000);
                                            })
                                        }
                                            
                                    }
                                );
                }
            }
        });
    });

    $(document).on("click", ".markGuestAsPresent", function(e) {
        let gid = Number(e.target.getAttribute("data-gid"));
        console.log(gid);
        let allGuests = getFromLocalStorage("guests");
        let myGuest = allGuests.filter(el => el["id"] == gid)[0];
        let allTables = getFromLocalStorage("tables");
        let myGuestTable = allTables.find(t => t.id == myGuest.guestTableId);

        bootbox.confirm({
            message: `Confirmez-vous le fait que <b>${myGuest.guestTitle} ${myGuest.guestName}</b> est présent(e) et installé(e) à la <b>table ${myGuestTable.id}: ${myGuestTable.tableName}</b> comme prévu?`,
            buttons: {
                confirm: {
                    label: 'Je confirme',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'Non',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                console.log('This was logged in the callback: ' + result);
                if(result === true)
                {
                    let newG = myGuest;
                    newG["guestStatus"] = "Installed";
                    putData(apiLink + "guests/"+myGuest.id, newG)
                    .then(dt => {
                        showNotification("Invité marqué comme installé", "success", "bottom left");
                        setTimeout(function(){
                            getAndCacheVar("guests");
                                location.reload() }, 2000);
                    });

                }
            }
        });
    });

    let editBtns = document.querySelectorAll(".editGuestInfo");

    for(let i=0; i<editBtns.length; i++)
    {
        editBtns[i].addEventListener("click", handleEditClick);
    }
}

$(document).ready(function() {

    $(".button-collapse").sideNav();
    $("#aboutUsModal").modal();

    getAndCacheVar("guests");
    getAndCacheVar("tables");
    getAndCacheVar("weddingInfos");
    getAndCacheVar("ceremonySettings");


    setTimeout(() => {
        updateWeddingsInfos();
        updateColorThemes();
    
        let allGuests = getFromLocalStorage("guests");
        filteredGuests = allGuests;
    
        displayGuestsTable(allGuests);
    
        document.getElementById("sortByNameTrigger").addEventListener("click", () => {
            displayGuestsTable(filteredGuests, "name")
        });
        document.getElementById("sortByTableTrigger").addEventListener("click", () => {
            displayGuestsTable(filteredGuests, "table")
        });

        let searchInput = document.getElementById("searchGuestInput");
        searchInput.addEventListener("input", (e) => {
            let searchWord = searchInput.value;
            if(searchWord.length == 0)
            {
                filteredGuests = allGuests;
            }
            else
            {
                filteredGuests = allGuests.filter(g => g.guestName.toLowerCase().includes(searchWord.toLowerCase()) || g.guestCategory.toLowerCase().includes(searchWord.toLowerCase()));
            }
            displayGuestsTable(filteredGuests, "name");
        })

    
        document.getElementById('addGuestForm').addEventListener('submit', handleAddGuestSubmit);
    
        document.getElementById('addNewGuestBtn').addEventListener('click', (e) => {
            document.getElementById("guestTable").innerHTML = "";
            let allTables = getFromLocalStorage("tables");
            if(allTables != null)
            {
                let allFreeTables = allTables.filter(t => t["tableGuestsIds"].length < t["tableMaxSeats"])
                                             .sort((a, b) => a.id - b.id);

                let selectHTML = `<option value="/" selected>Table non attribuée</option>`;

                if(allFreeTables.length > 0)
                {
                    selectHTML += allFreeTables.map(ft => `<option value="${ft.id}">Table ${ft.id}: ${ft.tableName}</option>`).join("");
                    document.getElementById("guestTable").innerHTML = selectHTML;
                }
                
            }
            
        });

    }, 1500);
   

});
