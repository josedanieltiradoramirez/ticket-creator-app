let locations = [];

let editingLocationId = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLocations();

        setupLocationEventListeners();

    }
);


function setupLocationEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {
                window.location.href = "index.html";
            }
        );


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


function renderLocations() {

    const tableBody =
        document.getElementById(
            "locationsTableBody"
        );


    const search =
        document.getElementById(
            "searchLocations"
        ).value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredLocations =
        locations.filter(location => {

            return (
                location.name
                    .toLowerCase()
                    .includes(search)

                ||

                location.city
                    .toLowerCase()
                    .includes(search)

                ||

                location.state
                    .toLowerCase()
                    .includes(search)

                ||

                location.code
                    .toLowerCase()
                    .includes(search)
            );

        });


    filteredLocations.forEach(location => {

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
                ${
                    location.warehouse_management_system_id
                        ? location.warehouse_management_system_id
                        : "None"
                }
            </td>

            <td>

                <button
                    class="action-button edit-button"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                >
                    Delete
                </button>

            </td>

        `;


        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editLocation(location.id)
            );


        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteLocation(location.id)
            );


        tableBody.appendChild(row);

    });

}


function openCreateLocationModal() {

    editingLocationId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "Create Location";


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


    document.getElementById(
        "locationModal"
    ).classList.remove("hidden");

}


function editLocation(locationId) {

    const location =
        locations.find(
            location => location.id === locationId
        );


    if (!location) {
        return;
    }


    editingLocationId = locationId;


    document.getElementById(
        "modalTitle"
    ).textContent = "Edit Location";


    document.getElementById(
        "locationName"
    ).value = location.name;


    document.getElementById(
        "locationCity"
    ).value = location.city;


    document.getElementById(
        "locationState"
    ).value = location.state;


    document.getElementById(
        "locationCode"
    ).value = location.code;


    document.getElementById(
        "locationWms"
    ).value =
        location.warehouse_management_system_id ?? "";


    document.getElementById(
        "locationActive"
    ).checked = location.is_active;


    document.getElementById(
        "locationModal"
    ).classList.remove("hidden");

}


function closeLocationModal() {

    document.getElementById(
        "locationModal"
    ).classList.add("hidden");

}


async function saveLocation(event) {

    event.preventDefault();


    const wmsValue =
        document.getElementById(
            "locationWms"
        ).value;


    const locationData = {

        name:
            document.getElementById(
                "locationName"
            ).value.trim(),

        city:
            document.getElementById(
                "locationCity"
            ).value.trim(),

        state:
            document.getElementById(
                "locationState"
            ).value.trim(),

        code:
            document.getElementById(
                "locationCode"
            ).value.trim(),

        is_active:
            document.getElementById(
                "locationActive"
            ).checked,

        warehouse_management_system_id:
            wmsValue
                ? Number(wmsValue)
                : null

    };


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
            "Error saving location."
        );

    }

}


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
            "Error deleting location."
        );

    }

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}