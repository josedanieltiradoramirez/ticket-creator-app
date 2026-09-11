let locationId = null;

let currentLocation = null;

let warehouseManagementSystems = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    locationId =
        Number(
            params.get("id")
        );


    if (!locationId) {

        alert(
            "Invalid location ID."
        );

        window.location.href =
            "locations.html";

        return;

    }


    setupEventListeners();

    await loadLocation();

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "locations.html";

            }
        );


    document
        .getElementById("editButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    `locations.html?edit=${locationId}`;

            }
        );

}


// ============================================================
// LOAD LOCATION
// ============================================================

async function loadLocation() {

    try {

        currentLocation =
            await getLocation(
                locationId
            );


        await loadWarehouseManagementSystems();

        renderLocation();

    } catch (error) {

        console.error(
            "Error loading location:",
            error
        );


        alert(
            error.message ||
            "Error loading location."
        );


        window.location.href =
            "locations.html";

    }

}


// ============================================================
// LOAD WMS
// ============================================================

async function loadWarehouseManagementSystems() {

    try {

        warehouseManagementSystems =
            await getWarehouseManagementSystems();

    } catch (error) {

        console.error(
            "Error loading WMS:",
            error
        );

        warehouseManagementSystems = [];

    }

}


// ============================================================
// RENDER LOCATION
// ============================================================

function renderLocation() {

    const wmsName =
        getWmsName(
            currentLocation
                .warehouse_management_system_id
        );


    // PAGE TITLE

    document.title =
        `${currentLocation.name} - Location`;


    // HEADER

    document.getElementById(
        "locationName"
    ).textContent =
        currentLocation.name;


    // NAME

    document.getElementById(
        "locationNameValue"
    ).textContent =
        currentLocation.name ?? "N/A";


    // CITY

    document.getElementById(
        "locationCity"
    ).textContent =
        currentLocation.city ?? "N/A";


    // STATE

    document.getElementById(
        "locationState"
    ).textContent =
        currentLocation.state ?? "N/A";


    // CODE

    document.getElementById(
        "locationCode"
    ).textContent =
        currentLocation.code ?? "N/A";


    // STATUS

    const statusElement =
        document.getElementById(
            "locationStatus"
        );


    statusElement.innerHTML = `

        <span class="status-badge ${
            currentLocation.is_active
                ? "active"
                : "inactive"
        }">

            ${
                currentLocation.is_active
                    ? "Active"
                    : "Inactive"
            }

        </span>

    `;


    // WMS

    document.getElementById(
        "locationWms"
    ).textContent =
        wmsName || "None";


    // ID

    document.getElementById(
        "locationId"
    ).textContent =
        currentLocation.id;

}


// ============================================================
// GET WMS NAME
// ============================================================

function getWmsName(wmsId) {

    if (!wmsId) {

        return "";

    }


    const wms =
        warehouseManagementSystems.find(
            item => item.id === Number(wmsId)
        );


    if (!wms) {

        return `WMS #${wmsId}`;

    }


    return wms.name;

}