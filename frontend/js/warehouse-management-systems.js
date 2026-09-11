let warehouseManagementSystems = [];

let editingWmsId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupWmsEventListeners();

    await loadWms();


    // If coming from WMS Detail -> Edit

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        Number(
            params.get("edit")
        );


    if (editId) {

        editWms(editId);

    }

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupWmsEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

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


// ============================================================
// LOAD WMS
// ============================================================

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
            error.message ||
            "Error loading WMS."
        );

    }

}


// ============================================================
// RENDER WMS
// ============================================================

function renderWms() {

    const tableBody =
        document.getElementById(
            "wmsTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "emptyWmsMessage"
        );


    const search =
        document.getElementById(
            "searchWms"
        )
        .value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredWms =
        warehouseManagementSystems.filter(wms => {

            const name =
                String(
                    wms.name ?? ""
                )
                .toLowerCase();


            const description =
                String(
                    wms.description ?? ""
                )
                .toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search)
            );

        });


    // EMPTY STATE

    if (filteredWms.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        return;

    }


    emptyMessage.classList.add(
        "hidden"
    );


    // TABLE ROWS

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
                () => openWmsDetail(wms.id)
            );


        // EDIT

        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editWms(wms.id)
            );


        // DELETE

        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteWms(wms.id)
            );


        tableBody.appendChild(row);

    });

}


// ============================================================
// OPEN WMS DETAIL
// ============================================================

function openWmsDetail(wmsId) {

    window.location.href =
        `warehouse-management-system-detail.html?id=${wmsId}`;

}


// ============================================================
// CREATE WMS
// ============================================================

function openCreateWmsModal() {

    editingWmsId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Create WMS";


    document.getElementById(
        "wmsName"
    ).value = "";


    document.getElementById(
        "wmsDescription"
    ).value = "";


    document
        .getElementById("wmsModal")
        .classList.remove("hidden");

}


// ============================================================
// EDIT WMS
// ============================================================

function editWms(wmsId) {

    const wms =
        warehouseManagementSystems.find(
            item => item.id === wmsId
        );


    if (!wms) {

        alert(
            "WMS not found."
        );

        return;

    }


    editingWmsId = wmsId;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit WMS";


    document.getElementById(
        "wmsName"
    ).value =
        wms.name ?? "";


    document.getElementById(
        "wmsDescription"
    ).value =
        wms.description ?? "";


    document
        .getElementById("wmsModal")
        .classList.remove("hidden");

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeWmsModal() {

    document
        .getElementById("wmsModal")
        .classList.add("hidden");


    editingWmsId = null;

}


// ============================================================
// SAVE WMS
// ============================================================

async function saveWms(event) {

    event.preventDefault();


    const wmsData = {

        name:
            document
                .getElementById("wmsName")
                .value
                .trim(),

        description:
            document
                .getElementById("wmsDescription")
                .value
                .trim()

    };


    if (!wmsData.name) {

        alert(
            "Please enter a WMS name."
        );

        return;

    }


    try {

        // CREATE

        if (editingWmsId === null) {

            await createWarehouseManagementSystem(
                wmsData
            );


            alert(
                "WMS created successfully."
            );

        }

        // UPDATE

        else {

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
            error.message ||
            "Error saving WMS."
        );

    }

}


// ============================================================
// DELETE WMS
// ============================================================

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
            error.message ||
            "Error deleting WMS."
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