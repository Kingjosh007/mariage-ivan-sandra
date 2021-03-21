const btnSave = document.getElementById("btnSaveModifs");


function prefillForm(data){
    for(key in data)
    {
        if(data.hasOwnProperty(key))
            $('input[name='+key+']').val(data[key]);
    }
}
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
        .then(data => {
                showNotification("Informations mises à jour.", "bottom right", "success");
                getAndCacheVar("weddingInfos");
                getAndCacheVar("ceremonySettings");
                // location.reload();
        });
    });
    
}


$(document).ready(function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit);

    // Initialisation du formulaire

    let weddingInfos = getFromLocalStorage("weddingInfos");
    let ceremonySettings = getFromLocalStorage("ceremonySettings");

    let dataToPrefill = {};
    for(let k in weddingInfos)
        dataToPrefill[k] = weddingInfos[k];
    for(let k in ceremonySettings)
        dataToPrefill[k] = ceremonySettings[k];
    
    prefillForm(dataToPrefill);

        for(let route of majorRoutes)
        {
            if(["guests", "tables"].includes(route) && getFromLocalStorage(route) == null)
                    getAndCacheVar(route);
            if(["ceremonySettings", "weddingInfos"].includes(route) && getFromLocalStorage(route) == null)
                    getAndCacheVar(route);
        }

        updateColorThemes();
        updateWeddingsInfos();

});
