var addTableForm = document.querySelector("#addTableForm");

function createTableId()
{
    let tId = 1;
    let allExistingTables = getFromLocalStorage("tables");
    let i = 0;
    while(i < allExistingTables.length && allExistingTables[i].tableId >= tId)
    {
        tId++; i++;
    }
    return tId;
}

function handleAddSubmit(event)
{
    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

    let existingGuests = getFromLocalStorage("guests");
    let existingTables = getFromLocalStorage("tables");

    let tableObj = {
        tableId: Number(value["tableNum"]),
        tableName: String(value["tableName"]).toUpperCase(),
        tableMaxSeats: value["tableMaxSeats"],
    };

    if(String(value["tableGuestsIds"]).trim().length <= 2)
    {
        tableObj["tableGuestsIds"] = [];
    }
    else
    {
        tableObj["tableGuestsIds"] = JSON.parse(value["tableGuestsIds"])
                            .map(el => existingGuests.find(ell => ell["guestName"] == el["value"])["guestId"]);
    }
    

    if(tableObj["tableName"].length == 0)
    {
        showNotification("Veuillez entrer un nom de table", "danger", "bottom right");
    }
    else
    {
        // Vérification de la disponibilité du nom.
        let existingName = existingTables.filter(t => t["tableName"] == tableObj["tableName"]).length > 0;
        if(existingName)
        {
            showNotification("Ce nom de table existe déjà. Veuillez le modifier.");
        }
        else
        {
            let hadToShorten = false;
            if(tableObj["tableGuestsIds"].length > tableObj["tableMaxSeats"])
            {
                tableObj["tableGuestsIds"] = tableObj["tableGuestsIds"].slice(0, tableObj["tableMaxSeats"]);
                hadToShorten = true;
            }
            
            postData(apiLink + "tables", tableObj)
            .then(data => {
                        console.log(data);
                        if(hadToShorten)
                        {
                            showNotification("Table enregistrée avec les " + data["tableMaxSeats"] + " premiers noms d'invités.", "success", "bottom right");
                        }
                        else
                        {
                            showNotification("Table correctement enregistrée", "success", "bottom right");
                        }
                        getAndCacheVar("tables");

                        // Mise à jour des tableId des invités
                            if(tableObj["tableGuestsIds"].length > 0)
                            {
                                for(let gid of tableObj["tableGuestsIds"])
                                {
                                    let thisUser = existingGuests.filter(g => g["guestId"] == gid)[0];
                                    thisUser["guestTableId"] = tableObj["tableId"];
                                    putData(apiLink + "guests?id=" + gid, thisUser)
                                        .then(data => {
                                            console.log("Utilisateur modifié.");
                                        })
                                }
                            }

                    });

        }
        


    }

    console.log(tableObj);
}

$(document).ready(function() {

    $(".button-collapse").sideNav();
            $("#aboutUsModal").modal();

    updateColorThemes();
    updateWeddingsInfos();
    getAndCacheVar("guests");
    getAndCacheVar("tables")

    // Handle add table form
    $("#tableNum").val(createTableId());
    let eltToTag = document.querySelector("textarea");

    let guestsToTag = getFromLocalStorage("guests");

    let availableGuests = guestsToTag.filter(el => !el.hasOwnProperty("guestTableId") || el["guestTableId"] == undefined || el["guestTableId"] <= 0)
   let whiteL = availableGuests.map(g => g.guestName);
   let blackL = guestsToTag.filter(el => el.hasOwnProperty("guestTableId") && el["guestTableId"] > 0);

    var tagify = new Tagify(eltToTag, {
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

    addTableForm.addEventListener('submit', handleAddSubmit);

});