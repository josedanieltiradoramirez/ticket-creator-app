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
        showErrorMessage(
            "Invalid WMS ID."
        );

        window.location.href =
            "warehouse-management-systems.html";

        return;
    }

    await loadWmsDetail();
});

// ============================================================
// LOAD WMS DETAIL
// ============================================================

async function loadWmsDetail() {
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

        showErrorMessage(
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

    renderWmsHeader();
    renderWmsBasicInformation();
}

// ============================================================
// DETAIL HEADER
// ============================================================

function renderWmsHeader() {
    renderDetailHeader({
        containerId: "detailHeader",
        type: "Warehouse Management System",
        title: currentWms.name,
        description: "",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href =
                "warehouse-management-systems.html";
        }
    });
}

// ============================================================
// BASIC INFORMATION
// ============================================================

function renderWmsBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",

        data: currentWms,

        fields: [
            {
                key: "id",
                label: "ID",
                type: "text",
                readonly: true
            },
            {
                key: "name",
                label: "Name",
                type: "text"
            },
            {
                key: "description",
                label: "Description",
                type: "text"
            }
        ],

        expanded: true,

        onSave: async (updatedData) => {
            const data = {
                name: updatedData.name,
                description: updatedData.description
            };

            const updatedWms =
                await updateWarehouseManagementSystem(
                    wmsId,
                    data
                );

            currentWms =
                updatedWms || {
                    ...currentWms,
                    ...data
                };

            renderWmsHeader();

            showSuccessMessage(
                "WMS updated successfully."
            );
        }
    });
}

// ============================================================
// RELATED LOCATIONS
// ============================================================

function renderLocations() {
    const relatedLocations =
        locations.filter(
            location =>
                Number(
                    location.warehouse_management_system_id
                ) === Number(wmsId)
        );

    renderRelationships({
        containerId: "relationships",

        relationships: [
            {
                title: "Locations",

                expanded: true,

                entityLabel: "Location",

                addLabel: "Add Location",

                items: relatedLocations,

                actions: {
                    view: true,
                    edit: true,
                    remove: true,
                    add: true,
                    create: false
                },

                getItemName: (item) =>
                    item.name || "-",

                onAdd: () => {
                    openAddLocationModal();
                },

                onView: (item) => {
                    window.location.href =
                        `location-detail.html?id=${item.id}`;
                },

                onEdit: (item) => {
                    openEditLocationModal(item);
                },

                onRemove: (item) => {
                    openRemoveLocationModal(item);
                }
            }
        ]
    });
}

// ============================================================
// EDIT LOCATION MODAL
// ============================================================

function openEditLocationModal(location) {
    renderModal({
        containerId: "locationModal",

        title: "Edit Location",

        content: `
            <div class="form-group">
                <label for="editLocationName">
                    Name
                </label>

                <input
                    type="text"
                    id="editLocationName"
                    value="${escapeWmsHtmlAttribute(location.name)}"
                >
            </div>

            <div class="form-group">
                <label for="editLocationCity">
                    City
                </label>

                <input
                    type="text"
                    id="editLocationCity"
                    value="${escapeWmsHtmlAttribute(location.city)}"
                >
            </div>

            <div class="form-group">
                <label for="editLocationState">
                    State
                </label>

                <input
                    type="text"
                    id="editLocationState"
                    value="${escapeWmsHtmlAttribute(location.state)}"
                >
            </div>

            <div class="form-group">
                <label for="editLocationCode">
                    Code
                </label>

                <input
                    type="text"
                    id="editLocationCode"
                    value="${escapeWmsHtmlAttribute(location.code)}"
                >
            </div>

            <div class="form-group">
                <label for="editLocationStatus">
                    Status
                </label>

                <select id="editLocationStatus">
                    <option value="true" ${location.is_active ? "selected" : ""}>
                        Active
                    </option>
                    <option value="false" ${!location.is_active ? "selected" : ""}>
                        Inactive
                    </option>
                </select>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelEditLocationButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveEditLocationButton"
                >
                    Save Changes
                </button>
            </div>
        `,

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

    document
        .getElementById(
            "cancelEditLocationButton"
        )
        ?.addEventListener(
            "click",
            closeLocationModal
        );

    document
        .getElementById(
            "saveEditLocationButton"
        )
        ?.addEventListener(
            "click",
            () => saveEditedLocation(location)
        );
}

// ============================================================
// SAVE EDITED LOCATION
// ============================================================

async function saveEditedLocation(location) {
    const name =
        document
            .getElementById("editLocationName")
            ?.value
            .trim();

    const city =
        document
            .getElementById("editLocationCity")
            ?.value
            .trim();

    const state =
        document
            .getElementById("editLocationState")
            ?.value
            .trim();

    const code =
        document
            .getElementById("editLocationCode")
            ?.value
            .trim();

    const status =
        document.getElementById(
            "editLocationStatus"
        )?.value;

    if (!name || !city || !state || !code) {
        showWarningMessage(
            "Name, City, State and Code are required."
        );

        return;
    }

    const locationData = {
        name: name,
        city: city,
        state: state,
        code: code,
        is_active: status === "true",
        warehouse_management_system_id:
            Number(wmsId)
    };

    try {
        await updateLocation(
            location.id,
            locationData
        );

        closeLocationModal();

        await loadLocations();

        renderLocations();

        showSuccessMessage(
            "Location updated successfully."
        );
    } catch (error) {
        console.error(
            "Error updating location:",
            error
        );

        showErrorMessage(
            "Error updating location."
        );
    }
}

// ============================================================
// ADD LOCATION MODAL
// ============================================================

async function openAddLocationModal() {
    const availableLocations =
        locations.filter(
            location =>
                Number(
                    location.warehouse_management_system_id
                ) !== Number(wmsId)
        );

    if (availableLocations.length === 0) {
        showWarningMessage(
            "There are no available locations to add."
        );

        return;
    }

    const options =
        availableLocations
            .map(location => {
                return `
                    <option value="${escapeWmsHtmlAttribute(location.id)}">
                        ${escapeWmsHtml(
                            `${location.name} - ${location.city} (${location.code})`
                        )}
                    </option>
                `;
            })
            .join("");

    renderModal({
        containerId: "locationModal",

        title: "Add Location",

        content: `
            <div class="form-group">
                <label for="locationSelect">
                    Location
                </label>

                <select
                    id="locationSelect"
                    class="basic-information-input"
                >
                    <option value="">
                        Select a location
                    </option>

                    ${options}
                </select>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelLocationButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveLocationButton"
                >
                    Add Location
                </button>
            </div>
        `,

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
        document.getElementById(
            "cancelLocationButton"
        );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeLocationModal
        );
    }

    const saveButton =
        document.getElementById(
            "saveLocationButton"
        );

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            addLocation
        );
    }
}

// ============================================================
// CLOSE ADD LOCATION MODAL
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
}

// ============================================================
// ADD LOCATION
// ============================================================

async function addLocation() {
    const select =
        document.getElementById(
            "locationSelect"
        );

    if (!select || !select.value) {
        showWarningMessage(
            "Please select a location."
        );

        return;
    }

    const location =
        locations.find(
            item =>
                Number(item.id) ===
                Number(select.value)
        );

    if (!location) {
        showErrorMessage(
            "Location not found."
        );

        return;
    }

    const locationData = {
        name: location.name,
        city: location.city,
        state: location.state,
        code: location.code,
        is_active: location.is_active,
        warehouse_management_system_id:
            Number(wmsId)
    };

    try {
        await updateLocation(
            location.id,
            locationData
        );

        closeLocationModal();

        await loadLocations();

        renderLocations();

        showSuccessMessage(
            "Location added successfully."
        );
    } catch (error) {
        console.error(
            "Error adding location:",
            error
        );

        showErrorMessage(
            "Error adding location."
        );
    }
}

// ============================================================
// REMOVE LOCATION MODAL
// ============================================================

function openRemoveLocationModal(location) {
    renderModal({
        containerId: "confirmationModal",

        title: "Remove Location",

        content: `
            <p>
                Remove
                <strong>
                    ${escapeWmsHtml(location.name)}
                </strong>
                from this WMS?
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveLocationButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveLocationButton"
                >
                    Remove
                </button>
            </div>
        `,

        onClose: closeRemoveLocationModal
    });

    const modal =
        document.getElementById(
            "confirmationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    document
        .getElementById(
            "cancelRemoveLocationButton"
        )
        ?.addEventListener(
            "click",
            closeRemoveLocationModal
        );

    document
        .getElementById(
            "confirmRemoveLocationButton"
        )
        ?.addEventListener(
            "click",
            () => removeLocation(location)
        );
}

// ============================================================
// CLOSE REMOVE LOCATION MODAL
// ============================================================

function closeRemoveLocationModal() {
    const modal =
        document.getElementById(
            "confirmationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.innerHTML = "";
}

// ============================================================
// REMOVE LOCATION
// ============================================================

async function removeLocation(location) {
    const locationData = {
        name: location.name,
        city: location.city,
        state: location.state,
        code: location.code,
        is_active: location.is_active,
        warehouse_management_system_id: null
    };

    try {
        await updateLocation(
            location.id,
            locationData
        );

        closeRemoveLocationModal();

        await loadLocations();

        renderLocations();

        showSuccessMessage(
            "Location removed successfully."
        );
    } catch (error) {
        console.error(
            "Error removing location:",
            error
        );

        showErrorMessage(
            "Error removing location."
        );
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeWmsHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeWmsHtmlAttribute(value) {
    return escapeWmsHtml(value);
}
