
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

$(document).ready(function() {

    $(".button-collapse").sideNav();
            $("#aboutUsModal").modal();

    updateColorThemes();
    updateWeddingsInfos();
    // getAndCacheVar("guests");
    // getAndCacheVar("tables")

    // Handle add table form
    $("#tableNum").val(createTableId());
    let eltToTag = document.querySelector("textarea");

    let guestsToTag = getFromLocalStorage("guests")

    let availableGuests = guestsToTag.filter(el => !el.hasOwnProperty("guestTableId") || el["guestTableId"] == undefined || el["guestTableId"] <= 0)
   let whiteL = guestsToTag.map(g => g.guestName);
   let blackL = [];

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






    



});