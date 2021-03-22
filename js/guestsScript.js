

function randomNumberID() {
    return Math.floor(Math.random() * (1000002 - 1 + 1)) + 1;
}

function createGuestId()
{
    let gId = 1;
    let allExistingGuests = getFromLocalStorage("guests");
    console.log(allExistingGuests);
    
    let i = 0;
    while(i<allExistingGuests.length && allExistingGuests[i].guestId >= gId)
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

    $(document).on("click", ".showGuestInfo", function(e) {
        let gid = Number(e.target.getAttribute("data-gid"));
        let allGuests = getFromLocalStorage("guests");
        let myGuest = allGuests.filter(el => el["guestId"] == gid)[0];
        console.log(myGuest);

        let msg = "<b class='mr-1 mb-3'> Titre: </b>" + myGuest["guestTitle"];
            msg += "<br> <b class='mr-1 mb-3'> Nom: </b>" + myGuest["guestName"];
        
        if(myGuest["guestNotes"].length > 0)
            {
                msg += "<br><br> <b class='mr-1 mb-3'> Notes sur l'invité: </b>" + myGuest["guestNotes"];
            }
        
            msg += "<br><br><b class='mr-1 mb-3 themecolor2-text'> Catégorie: </b>" + myGuest["guestCategory"];
            msg += "<br><br> <b class='mr-1 mb-3'> Table prévue: </b>" + myGuest["guestTableId"];

            msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-success text-light p-1 rounded mr-2'> Installé </span> <i class='fa fa-check text-success' aria-hidden='true'></i>";
            msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-danger text-light p-1 rounded'> Sans table </span>";
            msg += "<br><br> <b class='mr-1 mb-3'> Statut: </b>" + "<span class='bg-warning text-light p-1 rounded'> Absent </span>";

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


    $(document).on("click", ".deleteGuestInfo", function(e) {
        let gid = Number(e.target.getAttribute("data-gid"));
        let allGuests = getFromLocalStorage("guests");
        let myGuest = allGuests.filter(el => el["guestId"] == gid)[0];

        bootbox.confirm({
            message: "Êtes-vous sûr(e) de vouloir annuler cette invitation?",
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
                    // Supprimer l'invité
                }
            }
        });
    });

});
