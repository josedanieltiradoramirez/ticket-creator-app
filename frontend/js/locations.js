
// ============================================================
// LOCATIONS LIST
// ============================================================

let locations = [];

let warehouseManagementSystems = [];

let editingLocationId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        renderPageHeader();

        setupLocationEventListeners();

        await loadWarehouseManagementSystems();

        await loadLocations();

        const params = new URLSearchParams(
            window.location.search
        );

        const editId = Number(
            params.get("edit")
        );

        if (editId) {
            openEditModal(editId);
        }
    }
);


// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Locations",
        description:
            "Manage locations and their associated Warehouse Management Systems.",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href = "index.html";
        }
    });
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupLocationEventListeners() {
    const addButton =
        document.getElementById("addLocationButton");

    if (addButton) {
        addButton.addEventListener(
            "click",
            openCreateModal
        );
    }

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            renderLocations
        );
    }
}


// ============================================================
// LOAD LOCATIONS
// ============================================================

async function loadLocations() {
    try {
        locations = await getLocations() || [];

        renderLocations();
    } catch (error) {
        console.error(
            "Error loading locations:",
            error
        );

        showErrorMessage(
            "Error loading locations."
        );
    }
}


// ============================================================
// LOAD WAREHOUSE MANAGEMENT SYSTEMS
// ============================================================

async function loadWarehouseManagementSystems() {
    try {
        warehouseManagementSystems =
            await getWarehouseManagementSystems() || [];
    } catch (error) {
        console.error(
            "Error loading Warehouse Management Systems:",
            error
        );

        warehouseManagementSystems = [];

        showErrorMessage(
            "Error loading Warehouse Management Systems."
        );
    }
}


// ============================================================
// GET WMS NAME
// ============================================================

function getWmsName(wmsId) {
    if (
        wmsId === null ||
        wmsId === undefined ||
        wmsId === ""
    ) {
        return "";
    }

    const wms =
        warehouseManagementSystems.find(
            item =>
                String(item.id) === String(wmsId)
        );

    if (!wms) {
        return `WMS #${wmsId}`;
    }

    return wms.name || `WMS #${wmsId}`;
}


// ============================================================
// RENDER LOCATIONS
// ============================================================

function renderLocations() {
    const tableBody =
        document.getElementById(
            "locationsTableBody"
        );

    const emptyState =
        document.getElementById(
            "locationsEmptyState"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!tableBody) {
        return;
    }

    const search =
        String(searchInput?.value || "")
            .trim()
            .toLowerCase();

    tableBody.innerHTML = "";

    const filteredLocations =
        locations.filter(location => {
            const name =
                String(location.name || "")
                    .toLowerCase();

            const city =
                String(location.city || "")
                    .toLowerCase();

            const state =
                String(location.state || "")
                    .toLowerCase();

            const code =
                String(location.code || "")
                    .toLowerCase();

            const wmsName =
                getWmsName(
                    location.warehouse_management_system_id
                ).toLowerCase();

            return (
                name.includes(search) ||
                city.includes(search) ||
                state.includes(search) ||
                code.includes(search) ||
                wmsName.includes(search)
            );
        });


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (filteredLocations.length === 0) {
        if (emptyState) {
            emptyState.classList.remove(
                "list-page-hidden"
            );

            const message =
                emptyState.querySelector(
                    ".list-page-empty-message"
                );

            if (message) {
                message.textContent =
                    locations.length === 0
                        ? "There are no locations available yet."
                        : "No locations match your search.";
            }
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.add(
            "list-page-hidden"
        );
    }


    // ========================================================
    // TABLE ROWS
    // ========================================================

    filteredLocations.forEach(location => {
        const row =
            document.createElement("tr");

        const wmsName =
            getWmsName(
                location.warehouse_management_system_id
            );

        row.innerHTML = `
            <td>
                <div class="list-page-primary-value">
                    ${escapeLocationHtml(
                        location.name || "-"
                    )}
                </div>
            </td>

            <td>
                ${escapeLocationHtml(
                    location.city || "-"
                )}
            </td>

            <td>
                ${escapeLocationHtml(
                    location.state || "-"
                )}
            </td>

            <td>
                ${escapeLocationHtml(
                    location.code || "-"
                )}
            </td>

            <td>
                <span class="
                    list-page-status
                    ${
                        location.is_active
                            ? "list-page-status-active"
                            : "list-page-status-inactive"
                    }
                ">
                    ${
                        location.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>
            </td>

            <td>
                ${escapeLocationHtml(
                    wmsName || "None"
                )}
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${location.id}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${location.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${location.id}"
                    >
                        Remove
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    setupLocationRowActionListeners();
}


// ============================================================
// ROW ACTION LISTENERS
// ============================================================

function setupLocationRowActionListeners() {
    const buttons =
        document.querySelectorAll(
            "#locationsTableBody [data-action]"
        );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const action =
                button.dataset.action;

            const locationId =
                Number(button.dataset.id);

            if (!locationId) {
                return;
            }

            switch (action) {
                case "view":
                    openLocationDetail(locationId);
                    break;

                case "edit":
                    openEditModal(locationId);
                    break;

                case "remove":
                    openRemoveModal(locationId);
                    break;
            }
        });
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
// CREATE MODAL
// ============================================================

function openCreateModal() {
    editingLocationId = null;

    renderLocationFormModal({
        mode: "create",
        location: null
    });
}


// ============================================================
// EDIT MODAL
// ============================================================

function openEditModal(locationId) {
    const location =
        locations.find(
            item =>
                Number(item.id) ===
                Number(locationId)
        );

    if (!location) {
        showErrorMessage(
            "Location not found."
        );

        return;
    }

    editingLocationId = locationId;

    renderLocationFormModal({
        mode: "edit",
        location: location
    });
}


// ============================================================
// LOCATION FORM MODAL
// ============================================================

function renderLocationFormModal({
    mode,
    location
}) {
    const isEdit =
        mode === "edit";

    const title =
        isEdit
            ? "Edit Location"
            : "New Location";

    const currentWmsId =
        location?.warehouse_management_system_id !== null &&
        location?.warehouse_management_system_id !== undefined
            ? String(
                location.warehouse_management_system_id
            )
            : "";

    const wmsOptions =
        warehouseManagementSystems
            .map(wms => {
                const selected =
                    String(wms.id) === currentWmsId
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${wms.id}"
                        ${selected}
                    >
                        ${escapeLocationHtml(
                            wms.name || `WMS ${wms.id}`
                        )}
                    </option>
                `;
            })
            .join("");

    const content = `
        <form
            id="locationForm"
            class="list-page-form"
        >

            <!-- NAME -->

            <div class="list-page-form-group">
                <label for="locationName">
                    Name
                </label>

                <input
                    type="text"
                    id="locationName"
                    value="${escapeLocationAttribute(
                        location?.name || ""
                    )}"
                    required
                >
            </div>


            <!-- CITY -->

            <div class="list-page-form-group">
                <label for="locationCity">
                    City
                </label>

                <input
                    type="text"
                    id="locationCity"
                    value="${escapeLocationAttribute(
                        location?.city || ""
                    )}"
                    required
                >
            </div>


            <!-- STATE -->

            <div class="list-page-form-group">
                <label for="locationState">
                    State
                </label>

                <input
                    type="text"
                    id="locationState"
                    value="${escapeLocationAttribute(
                        location?.state || ""
                    )}"
                    required
                >
            </div>


            <!-- CODE -->

            <div class="list-page-form-group">
                <label for="locationCode">
                    Code
                </label>

                <input
                    type="text"
                    id="locationCode"
                    value="${escapeLocationAttribute(
                        location?.code || ""
                    )}"
                    required
                >
            </div>


            <!-- WMS -->

            <div class="list-page-form-group">
                <label for="locationWms">
                    Warehouse Management System
                </label>

                <select id="locationWms">
                    <option value="">
                        No WMS
                    </option>

                    ${wmsOptions}
                </select>
            </div>


            <!-- STATUS -->

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="locationIsActive"
                    ${
                        location
                            ? location.is_active
                                ? "checked"
                                : ""
                            : "checked"
                    }
                >

                <label for="locationIsActive">
                    Active
                </label>
            </div>


            <!-- ACTIONS -->

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="locationCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                    id="locationSaveButton"
                >
                    ${
                        isEdit
                            ? "Save Changes"
                            : "Create Location"
                    }
                </button>
            </div>

        </form>
    `;

    renderModal({
        containerId: "locationModal",
        title: title,
        content: content,
        onClose: closeLocationModal
    });

    const modal =
        document.getElementById(
            "locationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");


    // ========================================================
    // CANCEL
    // ========================================================

    const cancelButton =
        modal.querySelector(
            "#locationCancelButton"
        );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeLocationModal
        );
    }


    // ========================================================
    // FORM SUBMIT
    // ========================================================

    const form =
        modal.querySelector(
            "#locationForm"
        );

    if (form) {
        form.addEventListener(
            "submit",
            saveLocation
        );
    }
}


// ============================================================
// SAVE LOCATION
// ============================================================

async function saveLocation(event) {
    event.preventDefault();

    const saveButton =
        document.getElementById(
            "locationSaveButton"
        );

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
                "locationIsActive"
            ).checked,

        warehouse_management_system_id:
            document.getElementById(
                "locationWms"
            ).value
                ? Number(
                    document.getElementById(
                        "locationWms"
                    ).value
                )
                : null
    };

    if (
        !locationData.name ||
        !locationData.city ||
        !locationData.state ||
        !locationData.code
    ) {
        showWarningMessage(
            "Please complete all required fields."
        );

        return;
    }

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        if (editingLocationId === null) {
            await createLocation(locationData);

            showSuccessMessage(
                "Location created successfully."
            );
        } else {
            await updateLocation(
                editingLocationId,
                locationData
            );

            showSuccessMessage(
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

        showErrorMessage(
            error.message ||
            "Error saving location."
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


// ============================================================
// REMOVE MODAL
// ============================================================

function openRemoveModal(locationId) {
    const location =
        locations.find(
            item =>
                Number(item.id) ===
                Number(locationId)
        );

    if (!location) {
        return;
    }

    const content = `
        <div class="list-page-confirmation">

            <p class="list-page-confirmation-message">
                Are you sure you want to remove
                <strong>
                    ${escapeLocationHtml(
                        location.name || "-"
                    )}
                </strong>?
            </p>

            <p class="list-page-confirmation-description">
                This action will remove the Location
                from the system.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="locationRemoveCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="danger-button"
                    id="locationRemoveConfirmButton"
                >
                    Remove
                </button>
            </div>

        </div>
    `;

    renderModal({
        containerId: "locationModal",
        title: "Remove Location",
        content: content,
        onClose: closeLocationModal
    });

    const modal =
        document.getElementById(
            "locationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    const cancelButton =
        modal.querySelector(
            "#locationRemoveCancelButton"
        );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeLocationModal
        );
    }

    const confirmButton =
        modal.querySelector(
            "#locationRemoveConfirmButton"
        );

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            () => removeLocation(locationId)
        );
    }
}


// ============================================================
// REMOVE LOCATION
// ============================================================

async function removeLocation(locationId) {
    const confirmButton =
        document.getElementById(
            "locationRemoveConfirmButton"
        );

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteLocationApi(locationId);

        closeLocationModal();

        showSuccessMessage(
            "Location removed successfully."
        );

        await loadLocations();
    } catch (error) {
        console.error(
            "Error removing location:",
            error
        );

        showErrorMessage(
            error.message ||
            "Error removing location."
        );

        if (confirmButton) {
            confirmButton.disabled = false;
        }
    }
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeLocationModal() {
    const modal =
        document.getElementById(
            "locationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.innerHTML = "";

    editingLocationId = null;
}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeLocationHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeLocationAttribute(value) {
    return escapeLocationHtml(value);
}
