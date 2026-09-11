let locations = [];

let warehouseManagementSystems = [];

let editingLocationId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupLocationEventListeners();

    await loadWarehouseManagementSystems();

    await loadLocations();


    const params =
        new URLSearchParams(
            window.location.search
        );

    const editId =
        Number(
            params.get("edit")
        );


    if (editId) {

        editLocation(editId);

    }

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupLocationEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("newLocationButton")
        .addEventListener(
            "click",
            openCreateLocationModal
        );


    document
        .getElementById("closeLocationModal")
        .addEventListener(
            "click",
            closeLocationModal
        );


    document
        .getElementById("cancelLocationButton")
        .addEventListener(
            "click",
            closeLocationModal
        );


    document
        .getElementById("locationForm")
        .addEventListener(
            "submit",
            saveLocation
        );


    document
        .getElementById("searchLocations")
        .addEventListener(
            "input",
            renderLocations
        );

}


// ============================================================
// LOAD LOCATIONS
// ============================================================

async function loadLocations() {

    try {

        locations = await getLocations();

        renderLocations();

    } catch (error) {

        console.error(
            "Error loading locations:",
            error
        );

        alert(
            "Error loading locations."
        );

    }

}


// ============================================================
// LOAD WMS
// ============================================================

async function loadWarehouseManagementSystems() {

    try {

        warehouseManagementSystems =
            await getWarehouseManagementSystems();

        populateWmsSelect();

    } catch (error) {

        console.error(
            "Error loading Warehouse Management Systems:",
            error
        );

        warehouseManagementSystems = [];

        populateWmsSelect();

    }

}


// ============================================================
// POPULATE WMS SELECT
// ============================================================

function populateWmsSelect() {

    const select =
        document.getElementById(
            "locationWms"
        );


    select.innerHTML = "";


    const noWmsOption =
        document.createElement("option");

    noWmsOption.value = "";

    noWmsOption.textContent = "No WMS";

    select.appendChild(noWmsOption);


    warehouseManagementSystems.forEach(wms => {

        const option =
            document.createElement("option");

        option.value = wms.id;

        option.textContent = wms.name;

        select.appendChild(option);

    });

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


    const search =
        document.getElementById(
            "searchLocations"
        )
        .value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredLocations =
        locations.filter(location => {

            const name =
                String(location.name ?? "")
                    .toLowerCase();

            const city =
                String(location.city ?? "")
                    .toLowerCase();

            const state =
                String(location.state ?? "")
                    .toLowerCase();

            const code =
                String(location.code ?? "")
                    .toLowerCase();

            const wmsName =
                getWmsName(
                    location.warehouse_management_system_id
                )
                .toLowerCase();


            return (
                name.includes(search) ||
                city.includes(search) ||
                state.includes(search) ||
                code.includes(search) ||
                wmsName.includes(search)
            );

        });


    if (filteredLocations.length === 0) {

        emptyMessage.classList.remove("hidden");

        return;

    }


    emptyMessage.classList.add("hidden");


    filteredLocations.forEach(location => {

        const row =
            document.createElement("tr");


        const wmsName =
            getWmsName(
                location.warehouse_management_system_id
            );


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
                ${
                    wmsName
                        ? escapeHtml(wmsName)
                        : "None"
                }
            </td>

            <td>

                <button
                    type="button"
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    type="button"
                    class="action-button edit-button"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="action-button delete-button"
                >
                    Delete
                </button>

            </td>

        `;


        // VIEW

        row
            .querySelector(".view-button")
            .addEventListener(
                "click",
                () => openLocationDetail(location.id)
            );


        // EDIT

        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editLocation(location.id)
            );


        // DELETE

        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteLocation(location.id)
            );


        tableBody.appendChild(row);

    });

}


// ============================================================
// OPEN LOCATION DETAIL
// ============================================================

function openLocationDetail(locationId) {

    window.location.href =
        `location-detail.html?id=${locationId}`;

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


// ============================================================
// CREATE LOCATION
// ============================================================

function openCreateLocationModal() {

    editingLocationId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Create Location";


    document.getElementById(
        "locationName"
    ).value = "";


    document.getElementById(
        "locationCity"
    ).value = "";


    document.getElementById(
        "locationState"
    ).value = "";


    document.getElementById(
        "locationCode"
    ).value = "";


    document.getElementById(
        "locationWms"
    ).value = "";


    document.getElementById(
        "locationActive"
    ).checked = true;


    document
        .getElementById("locationModal")
        .classList.remove("hidden");

}


// ============================================================
// EDIT LOCATION
// ============================================================

function editLocation(locationId) {

    const location =
        locations.find(
            location => location.id === locationId
        );


    if (!location) {

        alert(
            "Location not found."
        );

        return;

    }


    editingLocationId = locationId;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Location";


    document.getElementById(
        "locationName"
    ).value =
        location.name ?? "";


    document.getElementById(
        "locationCity"
    ).value =
        location.city ?? "";


    document.getElementById(
        "locationState"
    ).value =
        location.state ?? "";


    document.getElementById(
        "locationCode"
    ).value =
        location.code ?? "";


    document.getElementById(
        "locationWms"
    ).value =
        location.warehouse_management_system_id ?? "";


    document.getElementById(
        "locationActive"
    ).checked =
        location.is_active ?? true;


    document
        .getElementById("locationModal")
        .classList.remove("hidden");

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeLocationModal() {

    document
        .getElementById("locationModal")
        .classList.add("hidden");


    editingLocationId = null;

}


// ============================================================
// SAVE LOCATION
// ============================================================

async function saveLocation(event) {

    event.preventDefault();


    const locationData = {

        name:
            document
                .getElementById("locationName")
                .value
                .trim(),

        city:
            document
                .getElementById("locationCity")
                .value
                .trim(),

        state:
            document
                .getElementById("locationState")
                .value
                .trim(),

        code:
            document
                .getElementById("locationCode")
                .value
                .trim(),

        is_active:
            document
                .getElementById("locationActive")
                .checked,

        warehouse_management_system_id:
            document
                .getElementById("locationWms")
                .value
                ? Number(
                    document
                        .getElementById("locationWms")
                        .value
                )
                : null

    };


    if (
        !locationData.name ||
        !locationData.city ||
        !locationData.state ||
        !locationData.code
    ) {

        alert(
            "Please complete all required fields."
        );

        return;

    }


    try {

        if (editingLocationId === null) {

            await createLocation(
                locationData
            );


            alert(
                "Location created successfully."
            );

        } else {

            await updateLocation(
                editingLocationId,
                locationData
            );


            alert(
                "Location updated successfully."
            );

        }


        closeLocationModal();

        await loadLocations();

    } catch (error) {

        console.error(
            "Error saving location:",
            error
        );


        alert(
            error.message ||
            "Error saving location."
        );

    }

}


// ============================================================
// DELETE LOCATION
// ============================================================

async function deleteLocation(locationId) {

    const location =
        locations.find(
            location => location.id === locationId
        );


    if (!location) {

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${location.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteLocationApi(
            locationId
        );


        alert(
            "Location deleted successfully."
        );


        await loadLocations();

    } catch (error) {

        console.error(
            "Error deleting location:",
            error
        );


        alert(
            error.message ||
            "Error deleting location."
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