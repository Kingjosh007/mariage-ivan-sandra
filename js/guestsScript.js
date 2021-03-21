

function randomNumberID() {
    return Math.floor(Math.random() * (1000002 - 1 + 1)) + 1;
}

function createGuestId()
{
    let gId = 1;
    let allExistingGuests = getFromLocalStorage("guests");
    console.log(allExistingGuests);
    
    let i = 0;
    while(allExistingGuests[i].guestId >= gId)
    {
        gId++; i++;
    }
    return gId;
}

$(document).ready(function() {

    getAndCacheVar("guests");
    getAndCacheVar("tables");
    getAndCacheVar("weddingInfos");
    getAndCacheVar("ceremonySettings");
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
