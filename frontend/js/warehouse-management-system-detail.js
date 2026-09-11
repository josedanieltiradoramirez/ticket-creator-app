let wmsId = null;

let currentWms = null;

let locations = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    wmsId =
        Number(
            params.get("id")
        );


    if (!wmsId) {

        alert(
            "Invalid WMS ID."
        );


        window.location.href =
            "warehouse-management-systems.html";


        return;

    }


    setupEventListeners();

    await loadData();

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // BACK

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "warehouse-management-systems.html";

            }
        );


    // SAVE WMS

    document
        .getElementById("wmsDetailForm")
        .addEventListener(
            "submit",
            saveWms
        );


    // ADD LOCATION

    document
        .getElementById("addLocationButton")
        .addEventListener(
            "click",
            openAddLocationModal
        );


    // CLOSE LOCATION MODAL

    document
        .getElementById("closeLocationModal")
        .addEventListener(
            "click",
            closeLocationModal
        );


    // CANCEL LOCATION

    document
        .getElementById("cancelLocationButton")
        .addEventListener(
            "click",
            closeLocationModal
        );


    // SAVE LOCATION

    document
        .getElementById("saveLocationButton")
        .addEventListener(
            "click",
            addLocation
        );

}


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadData() {

    try {

        await loadWms();

        await loadLocations();

        renderWms();

        renderLocations();

    } catch (error) {

        console.error(
            "Error loading WMS detail:",
            error
        );


        alert(
            error.message ||
            "Error loading WMS details."
        );


        window.location.href =
            "warehouse-management-systems.html";

    }

}


// ============================================================
// LOAD WMS
// ============================================================

async function loadWms() {

    currentWms =
        await getWarehouseManagementSystem(
            wmsId
        );

}


// ============================================================
// LOAD LOCATIONS
// ============================================================

async function loadLocations() {

    locations =
        await getLocations();

}


// ============================================================
// RENDER WMS
// ============================================================

function renderWms() {

    document.title =
        `${currentWms.name} - WMS`;


    document.getElementById(
        "wmsTitle"
    ).textContent =
        currentWms.name;


    document.getElementById(
        "wmsName"
    ).value =
        currentWms.name ?? "";


    document.getElementById(
        "wmsDescription"
    ).value =
        currentWms.description ?? "";

}


// ============================================================
// RENDER LOCATIONS
// ============================================================

function renderLocations() {

    const tableBody =
        document.getElementById(
            "locationsTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "emptyLocationsMessage"
        );


    tableBody.innerHTML = "";


    const relatedLocations =
        locations.filter(location => {

            return (
                Number(
                    location.warehouse_management_system_id
                ) === Number(wmsId)
            );

        });


    if (relatedLocations.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        return;

    }


    emptyMessage.classList.add(
        "hidden"
    );


    relatedLocations.forEach(location => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(location.name)}
            </td>

            <td>
                ${escapeHtml(location.city)}
            </td>

            <td>
                ${escapeHtml(location.state)}
            </td>

            <td>
                ${escapeHtml(location.code)}
            </td>

            <td>

                <span class="status-badge ${
                    location.is_active
                        ? "active"
                        : "inactive"
                }">

                    ${
                        location.is_active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="action-button remove-button"
                >
                    Remove
                </button>

            </td>

        `;


        row
            .querySelector(".remove-button")
            .addEventListener(
                "click",
                () => removeLocation(location)
            );


        tableBody.appendChild(row);

    });

}


// ============================================================
// SAVE WMS INFORMATION
// ============================================================

async function saveWms(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("wmsName")
            .value
            .trim();


    const description =
        document
            .getElementById("wmsDescription")
            .value
            .trim();


    if (!name) {

        alert(
            "WMS name is required."
        );

        return;

    }


    const wmsData = {

        name: name,

        description: description

    };


    try {

        await updateWarehouseManagementSystem(
            wmsId,
            wmsData
        );


        alert(
            "WMS updated successfully."
        );


        await loadWms();

        renderWms();

    } catch (error) {

        console.error(
            "Error updating WMS:",
            error
        );


        alert(
            error.message ||
            "Error updating WMS."
        );

    }

}


// ============================================================
// OPEN ADD LOCATION MODAL
// ============================================================

function openAddLocationModal() {

    const select =
        document.getElementById(
            "locationSelect"
        );


    select.innerHTML = "";


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        "Select a location";


    select.appendChild(
        defaultOption
    );


    const availableLocations =
        locations.filter(location => {

            return (
                Number(
                    location.warehouse_management_system_id
                ) !== Number(wmsId)
            );

        });


    availableLocations.forEach(location => {

        const option =
            document.createElement("option");


        option.value =
            location.id;


        option.textContent =
            `${location.name} - ${location.city} (${location.code})`;


        select.appendChild(option);

    });


    if (availableLocations.length === 0) {

        alert(
            "There are no available locations to add."
        );


        return;

    }


    document
        .getElementById("locationModal")
        .classList.remove("hidden");

}


// ============================================================
// CLOSE LOCATION MODAL
// ============================================================

function closeLocationModal() {

    document
        .getElementById("locationModal")
        .classList.add("hidden");


    document.getElementById(
        "locationSelect"
    ).value = "";

}


// ============================================================
// ADD LOCATION
// ============================================================

async function addLocation() {

    const locationId =
        document.getElementById(
            "locationSelect"
        ).value;


    if (!locationId) {

        alert(
            "Please select a location."
        );

        return;

    }


    const location =
        locations.find(
            item => item.id === Number(locationId)
        );


    if (!location) {

        alert(
            "Location not found."
        );

        return;

    }


    const locationData = {

        name:
            location.name,

        city:
            location.city,

        state:
            location.state,

        code:
            location.code,

        is_active:
            location.is_active,

        warehouse_management_system_id:
            Number(wmsId)

    };


    try {

        await updateLocation(
            location.id,
            locationData
        );


        alert(
            "Location added successfully."
        );


        closeLocationModal();


        await loadLocations();

        renderLocations();

    } catch (error) {

        console.error(
            "Error adding location:",
            error
        );


        alert(
            error.message ||
            "Error adding location."
        );

    }

}


// ============================================================
// REMOVE LOCATION
// ============================================================

async function removeLocation(location) {

    const confirmed =
        confirm(
            `Remove "${location.name}" from this WMS?`
        );


    if (!confirmed) {

        return;

    }


    const locationData = {

        name:
            location.name,

        city:
            location.city,

        state:
            location.state,

        code:
            location.code,

        is_active:
            location.is_active,

        warehouse_management_system_id:
            null

    };


    try {

        await updateLocation(
            location.id,
            locationData
        );


        alert(
            "Location removed successfully."
        );


        await loadLocations();

        renderLocations();

    } catch (error) {

        console.error(
            "Error removing location:",
            error
        );


        alert(
            error.message ||
            "Error removing location."
        );

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}