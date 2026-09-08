let warehouseManagementSystems = [];

let editingWmsId = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadWms();

        setupWmsEventListeners();

    }
);


function setupWmsEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {
                window.location.href = "index.html";
            }
        );


    document
        .getElementById("newWmsButton")
        .addEventListener(
            "click",
            openCreateWmsModal
        );


    document
        .getElementById("closeWmsModal")
        .addEventListener(
            "click",
            closeWmsModal
        );


    document
        .getElementById("cancelWmsButton")
        .addEventListener(
            "click",
            closeWmsModal
        );


    document
        .getElementById("wmsForm")
        .addEventListener(
            "submit",
            saveWms
        );


    document
        .getElementById("searchWms")
        .addEventListener(
            "input",
            renderWms
        );

}


async function loadWms() {

    try {

        warehouseManagementSystems =
            await getWarehouseManagementSystems();

        renderWms();

    } catch (error) {

        console.error(
            "Error loading WMS:",
            error
        );

        alert(
            "Error loading WMS."
        );

    }

}


function renderWms() {

    const tableBody =
        document.getElementById(
            "wmsTableBody"
        );


    const search =
        document.getElementById(
            "searchWms"
        ).value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredWms =
        warehouseManagementSystems.filter(
            wms => {

                return (
                    wms.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    wms.description
                        .toLowerCase()
                        .includes(search)
                );

            }
        );


    filteredWms.forEach(wms => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(wms.name)}
            </td>

            <td>
                ${escapeHtml(wms.description)}
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
                () => editWms(wms.id)
            );


        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteWms(wms.id)
            );


        tableBody.appendChild(row);

    });

}


function openCreateWmsModal() {

    editingWmsId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "Create WMS";


    document.getElementById(
        "wmsName"
    ).value = "";


    document.getElementById(
        "wmsDescription"
    ).value = "";


    document.getElementById(
        "wmsModal"
    ).classList.remove("hidden");

}


function editWms(wmsId) {

    const wms =
        warehouseManagementSystems.find(
            item => item.id === wmsId
        );


    if (!wms) {
        return;
    }


    editingWmsId = wmsId;


    document.getElementById(
        "modalTitle"
    ).textContent = "Edit WMS";


    document.getElementById(
        "wmsName"
    ).value = wms.name;


    document.getElementById(
        "wmsDescription"
    ).value = wms.description;


    document.getElementById(
        "wmsModal"
    ).classList.remove("hidden");

}


function closeWmsModal() {

    document.getElementById(
        "wmsModal"
    ).classList.add("hidden");

}


async function saveWms(event) {

    event.preventDefault();


    const wmsData = {

        name:
            document.getElementById(
                "wmsName"
            ).value.trim(),

        description:
            document.getElementById(
                "wmsDescription"
            ).value.trim()

    };


    try {

        if (editingWmsId === null) {

            await createWarehouseManagementSystem(
                wmsData
            );

            alert(
                "WMS created successfully."
            );

        } else {

            await updateWarehouseManagementSystem(
                editingWmsId,
                wmsData
            );

            alert(
                "WMS updated successfully."
            );

        }


        closeWmsModal();

        await loadWms();

    } catch (error) {

        console.error(
            "Error saving WMS:",
            error
        );

        alert(
            "Error saving WMS."
        );

    }

}


async function deleteWms(wmsId) {

    const wms =
        warehouseManagementSystems.find(
            item => item.id === wmsId
        );


    if (!wms) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${wms.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteWarehouseManagementSystem(
            wmsId
        );

        alert(
            "WMS deleted successfully."
        );

        await loadWms();

    } catch (error) {

        console.error(
            "Error deleting WMS:",
            error
        );

        alert(
            "Error deleting WMS."
        );

    }

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}