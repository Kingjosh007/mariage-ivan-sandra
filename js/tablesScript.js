var addTableForm = document.querySelector("#addTableForm");
var editTableForm = document.querySelector("#editTableForm");
var tablesDisplayArea = document.querySelector("#tablesInfoDisplayArea");
var editTableEltToTag = document.querySelector("#editTableFormTextArea");
var addTableEltToTag = document.querySelector("#addTableFormTextArea");
var tagify = {};

function createTableId()
{
    let tId = 1;
    let allExistingTables = getFromLocalStorage("tables");
    let i = 0;
    while(i < allExistingTables.length && allExistingTables[i].id >= tId)
    {
        tId++; i++;
    }
    return tId;
}

function handleEditClick(e)
{
    let allExistingTables = getFromLocalStorage("tables");
    let allGuests = getFromLocalStorage("guests");

        let tableToEditId = Number(e.target.getAttribute("data-tid"));
        let tableInfos = allExistingTables.find(t => t["id"] == tableToEditId);
        let tableGuestsNames =  tableInfos["tableGuestsIds"].length > 0 ? tableInfos["tableGuestsIds"].map(gid => allGuests.filter(g => g["id"]==gid)[0]["guestName"]) : [];


        let dataToPrefillWith = {
            editTableNum: tableInfos.id,
            editTableName: tableInfos.tableName,
            editTableMaxSeats: tableInfos.tableMaxSeats
        };
        prefillForm(dataToPrefillWith);

        let guestsToTag = getFromLocalStorage("guests");
        let availableGuests = guestsToTag.filter(el => !el.hasOwnProperty("guestTableId") || el["guestTableId"] == undefined || el["guestTableId"] <= 0)
        let whiteL = availableGuests.map(g => g.guestName);
        let blackL = guestsToTag.filter(el => el.hasOwnProperty("guestTableId") && el["guestTableId"] > 0);
        for(let tgn of tableGuestsNames)
        {
            if(!whiteL.includes(tgn))
                whiteL.push(tgn);
            if(blackL.includes(tgn))
                blackL = blackL.filter(n => n!=tgn);
        }
        tagify = new Tagify(editTableEltToTag, {
            enforceWhitelist: true,
            whitelist: whiteL,
            blacklist: blackL,  
            dropdown : {
                enabled       : 1,              // show the dropdown immediately after the first character typed
                maxItems      : 6,
                position      : "text",         // place the dropdown near the typed text
                closeOnSelect : false,          // keep the dropdown open after selecting a suggestion
                highlightFirst: false
            }
        });

        
        if(tableInfos.tableGuestsIds.length == 0)
        {
            console.log("Yeah");
            document.getElementById("editTableFormTextArea").innerHTML = "";
            document.getElementById("editTableFormTextArea").value = "";
        }
        else
        {
            console.log(tableGuestsNames);
            document.getElementById("editTableFormTextArea").innerHTML = tagify.parseMixTags(tableGuestsNames.join(", ") + ", ");
        }
        
}

function displayAllTables(){
    let allExistingTables = getFromLocalStorage("tables");
    let allGuests = getFromLocalStorage("guests");
    let fullyReservedTables = allExistingTables.filter(t => {
        t["tableGuestsIds"].length >= t["tableMaxSeats"]
    });
    let fullTables = [];
    if(allExistingTables.length > 0 && allGuests.length > 0)
    {
        fullTables = allExistingTables.filter(t => {
                let thisTableGuests = t["tableGuestsIds"].map(gid => allGuests.filter(g => g["id"]==gid)[0]);
                return thisTableGuests.length > 0 && thisTableGuests.every(g => g.hasOwnProperty("guestStatus") && g["guestStatus"] == "Installed");
        });
    }

    tablesDisplayArea.innerHTML = ``;
    $("#totalTablesNb").text(" " + allExistingTables.length);
    $("#fullyReservedTablesNb").text(" " + fullyReservedTables.length);
    $("#fullTablesNb").text(" " + fullTables.length);

    if(allExistingTables.length > 0)
    {
        document.querySelector("#msgBeforeTablesDisplay").innerHTML = "Cliquez sur une table pour voir/cacher les invités y destinés. La barre <div class='badge bg-warning'>orange</div> indique le niveau de réservation de la table <i>(par rapport au nombre de places total)</i>, tandis que la barre <div class='badge bg-success'>verte</div> indique le niveau de remplissage relatif de la table <i>(invités déjà installés sur la table pendant la cérémonie par rapport au nombre d'invités affectés à la table).</i>";
        
        allExistingTables = allExistingTables.sort((a, b) => a.id - b.id);
        for(let table of allExistingTables)
        {
            let tableReservedProgress = 100*(table.tableGuestsIds.length / table.tableMaxSeats);
            let thisTableGuests = table["tableGuestsIds"].map(gid => allGuests.filter(g => g["id"]==gid)[0]);
            let tableInstalledGuestNb = table["tableGuestsIds"].length > 0 ? thisTableGuests.filter(g => g.hasOwnProperty("guestStatus") && g["guestStatus"] == "Installed").length : 0;
            let tableFullnessProgress = 100*(tableInstalledGuestNb / thisTableGuests.length);

            let thisTableHTML = `<div class="card themecolor1">
            <div class="card-header pt-3" id="heading${table.id}" style="vertical-align: middle;">
              <div class="container-fluid">
                  <div class="row">
                      <div class="col-md-8 col-9">
                          <button class="btn btn-link themecolor2 themecolor1-text font-weight-bold" data-toggle="collapse" data-target="#collapse${table.id}" aria-expanded="true" aria-controls="collapse${table.id}" style="height: fit-content;">
                              Table ${table.id}: ${table.tableName.toUpperCase()}
                          </button>
                      </div>
                      <div class="col-md-4 col-3">
                      <ul class="list-inline m-0">
                          <li class="list-inline-item btn-outline-success">
                              <i class="fas fa-edit editTable" data-tid="${table.id}" data-toggle="modal" data-target="#editTableModal"></i>
                          </li>
                          <li class="list-inline-item">
                              <i class="fas fa-trash-alt btn-outline-danger deleteTable" data-tid="${table.id}" ></i>
                          </li>
                      </ul>
                    </div>
                  </div>
                  <div class="row" style="vertical-align: middle;">
                      <div class="col-md-6 col-6 my-0">
                          <div class="progress" style="border-radius: 10%">
                              <div class="progress-bar bg-warning text-dark" style="width:${tableReservedProgress}%; font-size: 0.8em;"></div>
                            </div>
                      </div>
                      <div class="col-md-6 col-6 my-0">
                          <div class="progress" style="border-radius: 10%">
                              <div class="progress-bar bg-success text-dark" style="width:${tableFullnessProgress}%; font-size: 0.8em;"></div>
                            </div>
                      </div>
                  </div>
              </div>
            </div>
        
            <div id="collapse${table.id}" class="collapse themecolor1-text" aria-labelledby="heading${table.id}" data-parent="#tablesInfoDisplayArea">
              <div class="card-body bg-light">
                  <ul class="list-group">

                  ${thisTableGuests.length == 0 ? "<li class='list-group-item'>Aucun invité enregistré à cette table pour le moment. <br> Cliquez sur l'icône <em>Stylo</em> pour modifier la table.</li>" : 
                        thisTableGuests.sort(compareNames).map((g, ind) => {
                            let ord = ind + 1;
                            let themeTextClass = "themecolor2-text";
                            let themeClass = "themecolor2";
                            if(g.hasOwnProperty("guestStatus") && g.guestStatus == "Installed")
                            {
                                themeClass = "bg-success";
                                themeTextClass = "text-success";
                            }
                            let faClass = g.guestGender == "F" ? "<i class='fas fa-female " + themeTextClass + " themecolor1 rounded px-2 py-1'></i>" : "<i class='fas fa-male " + themeTextClass + " themecolor1 rounded px-2 py-1'></i>"
                            return "<li class='list-group-item'><span class='badge " + themeClass + " float-left themecolor1-text'>" + ord + "</span> <span class='ml-3'>" + faClass + "</span> <span class='ml-2'>" + g.guestTitle + " " + g.guestName + "</span></li>";
                        }).join("")}
                      
                  </ul>
               </div>
            </div>
          </div>`;


            tablesDisplayArea.innerHTML += thisTableHTML;
            updateColorThemes();


        }

        let editBtns = document.querySelectorAll(".editTable");
        let deleteBtns = document.querySelectorAll(".deleteTable");

        for(let i=0; i<editBtns.length; i++)
        {
                editBtns[i].addEventListener("click", handleEditClick);
        }
        for(let i=0; i<deleteBtns.length; i++)
        {
                deleteBtns[i].addEventListener("click", function(e) {
                    let tid = Number(e.target.getAttribute("data-tid"));
                    let tableToDelete = allExistingTables.filter(t => t.id == tid) [0];
                    let myGuests = allGuests.filter(el => el["guestTableId"] == tableToDelete["id"]);
            
                    bootbox.confirm({
                        message: "Êtes-vous sûr(e) de vouloir supprimer la <b>table " + tableToDelete["id"] + ": " + tableToDelete["tableName"] + "</b>. <p>Les invités affectés à cette table se retrouveront sans table.</p>",
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
                                // Supprimer la table et unset la tableId dans les invités affectés à la table
                                deleteData(apiLink + "tables/", tableToDelete.id)
                                .then(data => 
                                    {
                                        showNotification("Table correctement supprimée.", "danger");
                                        for(let guest of myGuests){ 
                                            let newGuest = {};
                                            for(let k in guest)
                                            {
                                                if(k != "guestTableId")
                                                    newGuest[k] = guest[k];
                                            }
                                            putData(apiLink + "guests/"+guest.id, newGuest)
                                            .then(dt => {
                                                console.log("Invité " + dt.guestName + " marqué sans table");
                                            })
                                        }
                                        setTimeout(function(){
                                            solveTableMatchingConflicts();
                                             location.reload() }, 1500);
                                    }
                                );
                            }
                        }
                    });
                });
         
        }
    }

    else {
        document.querySelector("#msgBeforeTablesDisplay").innerHTML = "Aucune table enregistrée pour l'instant. Pour ajouter une table, cliquez sur le bouton ci-dessus.";
       
    }


}

function handleFormSubmit(event, type="create")
{
    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());


    let existingGuests = getFromLocalStorage("guests");
    let existingTables = getFromLocalStorage("tables");

    let tableObj = {};
    
    if(type == "create") {

       tableObj = {
        "id": Number(value["tableNum"]),
        "tableName": String(value["tableName"]).toUpperCase(),
        "tableMaxSeats": Number(value["tableMaxSeats"])
       };
        if(String(value["tableGuestsIds"]).trim().length <= 2)
        {
            tableObj["tableGuestsIds"] = [];
        }
        else
        {
            tableObj["tableGuestsIds"] = JSON.parse(value["tableGuestsIds"])
                                .map(el => existingGuests.find(ell => ell["guestName"] == el["value"])["id"])
                                .map(el => Number(el));
        }
    }
    else
    {
        // Edit form
        tableObj = {
            "id": Number(value["editTableNum"]),
            "tableName": String(value["editTableName"]).toUpperCase(),
            "tableMaxSeats": Number(value["editTableMaxSeats"])
           };
            if(String(value["editTableGuestsNames"]).trim().length <= 2)
            {
                tableObj["tableGuestsIds"] = [];
            }
            else
            {
                tableObj["tableGuestsIds"] = JSON.parse(value["editTableGuestsNames"])
                                    .map(el => existingGuests.find(ell => ell["guestName"] == el["value"])["id"])
                                    .map(el => Number(el));
            }

    }

    if(type=="edit")
    {
        existingTables = existingTables.filter(t => t.id != tableObj["id"]);
    }
    
    if(tableObj["tableName"].length == 0)
    {
        showNotification("Veuillez entrer un nom de table", "danger", "bottom right");
    }
    else
    {
        // Vérification de la disponibilité du nom.
        let existingName = existingTables.filter(t => t["tableName"].toLowerCase() == tableObj["tableName"].toLowerCase()).length > 0;
        
        if(existingName && tableObj["tableName"] != defaultTableName)
        {
            showNotification("Ce nom de table existe déjà. Veuillez le modifier.", "warning");
        }
        else
        {
            let hadToShorten = false;
            if(tableObj["tableGuestsIds"].length > tableObj["tableMaxSeats"])
            {
                tableObj["tableGuestsIds"] = tableObj["tableGuestsIds"].slice(0, tableObj["tableMaxSeats"]);
                hadToShorten = true;
            }

            if(type=="create")
            {
                postData(apiLink + "tables", tableObj)
                .then(data => 
                    {
                            if(hadToShorten)
                            {
                                showNotification("Table enregistrée avec les " + data["tableMaxSeats"] + " premiers noms d'invités.", "success", "bottom right");
                            }
                            else
                            {
                                showNotification("Table correctement enregistrée", "success", "bottom right");
                            }
                            solveTableMatchingConflicts();

                            // Mise à jour des tableId des invités
                                if(tableObj["tableGuestsIds"].length > 0)
                                {
                                    for(let gid of tableObj["tableGuestsIds"])
                                    {
                                        let thisUser = existingGuests.filter(g => g["id"] == gid)[0];
                                        thisUser["guestTableId"] = tableObj["id"];
                                        putData(apiLink + "guests/" + gid, thisUser)
                                            .then(data => {
                                                console.log("Utilisateur modifié.");
                                            })
                                    }

                                    solveTableMatchingConflicts();
                                }

                                setTimeout(function(){ location.reload() }, 1500);
                                

                        });
                }

                else
                {
                    // Edit

                    putData(apiLink + "tables/" + tableObj["id"], tableObj)
                    .then(data => {
                            if(hadToShorten)
                            {
                                showNotification("Table modifiée avec les " + data["tableMaxSeats"] + " premiers noms d'invités.", "success", "bottom right");
                            }
                            else
                            {
                                showNotification("Table correctement modifiée", "success", "bottom right");
                            }
                            solveTableMatchingConflicts();

                            // Mise à jour des tableId des invités
                                if(tableObj["tableGuestsIds"].length > 0)
                                {
                                    for(let gid of tableObj["tableGuestsIds"])
                                    {
                                        let thisUser = existingGuests.filter(g => g["id"] == gid)[0];
                                        thisUser["guestTableId"] = tableObj["id"];
                                        putData(apiLink + "guests/" + gid, thisUser)
                                            .then(data => {
                                                console.log("Utilisateur modifié.");
                                            })
                                    }
                                    solveTableMatchingConflicts();
                                }

                                setTimeout(function(){ location.reload() }, 1500);
                                
                        });

                }
            }

        }
        


    }

$(document).ready(function() {

    $(".button-collapse").sideNav();
            $("#aboutUsModal").modal();

    updateColorThemes();
    updateWeddingsInfos();

    displayAllTables();

    solveTableMatchingConflicts();

    // Handle add table form
    $("#tableNum").val(createTableId());

    let guestsToTag = getFromLocalStorage("guests");

    let availableGuests = guestsToTag.filter(el => !el.hasOwnProperty("guestTableId") || el["guestTableId"] == undefined || el["guestTableId"] <= 0)
   let whiteL = availableGuests.map(g => g.guestName);
   let blackL = guestsToTag.filter(el => el.hasOwnProperty("guestTableId") && el["guestTableId"] > 0);

    tagify = new Tagify(addTableEltToTag, {
            enforceWhitelist: true,
            whitelist: whiteL,
            blacklist: blackL,  
            dropdown : {
                enabled       : 1,              // show the dropdown immediately after the first character typed
                maxItems      : 6,
                position      : "text",         // place the dropdown near the typed text
                closeOnSelect : false,          // keep the dropdown open after selecting a suggestion
                highlightFirst: false
            }
    });

    addTableForm.addEventListener('submit', e => handleFormSubmit(e, "create"));
    editTableForm.addEventListener('submit', e => handleFormSubmit(e, "edit"));

});