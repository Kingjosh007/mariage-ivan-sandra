const btnSave = document.getElementById("btnSaveModifs");


function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

    let newWeddingInfos = {
        "groomsName": value["groomsName"],
        "maidsName": value["maidsName"],
        "weddingTheme": value["weddingTheme"],
        "weddingDate": value["weddingDate"],
        "weddingVenue": value["weddingVenue"]
    };

    console.log(newWeddingInfos);

    let newCeremonySettings = {};
    for(let k in value)
        if(!newWeddingInfos.hasOwnProperty(k))
            newCeremonySettings[k] = value[k];
        
    console.log(newWeddingInfos);
    newCeremonySettings["nbGuest"] = Number(newCeremonySettings["nbGuest"]);
    newCeremonySettings["nbTables"] = Number(newCeremonySettings["nbTables"]);
    newCeremonySettings["maxGuestsPerTable"] = Number(newCeremonySettings["maxGuestsPerTable"]);
    console.log(newCeremonySettings);

    putData(apiLink + "weddingInfos", newWeddingInfos)
    .then(data => {
        putData(apiLink + "ceremonySettings", newCeremonySettings)
        .then(dt => {
                showNotification("Informations mises à jour.", "success", "bottom right");
                getAndCacheVar("weddingInfos");
                getAndCacheVar("ceremonySettings");
        });
    });

    // Création des tables par défaut.
    let availableTables = getFromLocalStorage("tables");
    let tablesACreer = [];
    if(!(availableTables == null))
    {
        for(let i=1; i<=newCeremonySettings["nbTables"]; i++)
        {
            if(availableTables.filter(t => t["id"] == i).length == 0)
            {
                tablesACreer.push({
                    id: i,
                    tableName: defaultTableName,
                    tableMaxSeats: newCeremonySettings["maxGuestsPerTable"],
                    tableGuestsIds: []
                })
            }
        }
    }
    else
    {
        for(let i=1; i<=newCeremonySettings["nbTables"]; i++)
        {
            
                tablesACreer.push({
                    id: i,
                    tableName: defaultTableName,
                    tableMaxSeats: newCeremonySettings["maxGuestsPerTable"],
                    tableGuestsIds: []
                });
            
        }
    }
    for(let i=0; i<tablesACreer.length; i++)
    {
        postData(apiLink + "tables", tablesACreer[i])
        .then(data => {
            console.log("Création de la table " + data["id"] + " avec les paramètres par défaut.");
        })
    }
    if(tablesACreer.length > 0)
        showNotification("Création de " + tablesACreer.length + " nouvelles tables par défaut.", "success", "bottom left");

    getAndCacheVar("tables");
    getAndCacheVar("guests");

    setTimeout(function(){ 
        location.reload();
     }, 4000);
    
}


$(document).ready(function() {

    $(".button-collapse").sideNav();
            $("#aboutUsModal").modal();

    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit);

    for(let route of majorRoutes)
        {
            if(["guests", "tables"].includes(route) && getFromLocalStorage(route) == null)
                    getAndCacheVar(route);
            if(["ceremonySettings", "weddingInfos"].includes(route) && getFromLocalStorage(route) == null)
                    getAndCacheVar(route);
        }

    setTimeout(() => {
        updateColorThemes();
    updateWeddingsInfos();
    }, 1000)
    

    // Initialisation du formulaire

    let weddingInfos = getFromLocalStorage("weddingInfos");
    let ceremonySettings = getFromLocalStorage("ceremonySettings");

    let dataToPrefill = {};
    for(let k in weddingInfos)
        dataToPrefill[k] = weddingInfos[k];
    for(let k in ceremonySettings)
        dataToPrefill[k] = ceremonySettings[k];
    
    prefillForm(dataToPrefill);

        

});
