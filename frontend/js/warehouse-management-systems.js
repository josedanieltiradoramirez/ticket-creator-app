let warehouseManagementSystems = [];
let editingWmsId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupWmsEventListeners();
    await loadWms();

    // If coming from WMS Detail -> Edit
    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));

    if (editId) {
        editWms(editId);
    }
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Warehouse Management Systems",
        description: "Manage warehouse management systems used by locations.",
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

function setupWmsEventListeners() {
    document
        .getElementById("addWmsButton")
        .addEventListener("click", openCreateWmsModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderWms);
}

// ============================================================
// LOAD WMS
// ============================================================

async function loadWms() {
    try {
        warehouseManagementSystems =
            await getWarehouseManagementSystems() || [];

        renderWms();
    } catch (error) {
        console.error("Error loading WMS:", error);
        showErrorMessage(error.message || "Error loading WMS.");
    }
}

// ============================================================
// RENDER WMS
// ============================================================

function renderWms() {
    const tableBody = document.getElementById("wmsTableBody");
    const emptyState = document.getElementById("wmsEmptyState");

    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredWms = warehouseManagementSystems.filter((wms) => {
        const name = String(wms.name ?? "").toLowerCase();
        const description = String(wms.description ?? "").toLowerCase();

        return name.includes(search) || description.includes(search);
    });

    emptyState.classList.toggle(
        "list-page-hidden",
        filteredWms.length !== 0
    );

    if (filteredWms.length === 0) {
        return;
    }

    filteredWms.forEach((wms) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeWmsHtml(wms.name)}
                </span>
            </td>

            <td>
                ${escapeWmsHtml(wms.description)}
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeWmsAttribute(wms.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeWmsAttribute(wms.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeWmsAttribute(wms.id)}"
                    >
                        Remove
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const wmsId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openWmsDetail(wmsId);
            } else if (action === "edit") {
                editWms(wmsId);
            } else if (action === "remove") {
                openRemoveWmsModal(wmsId);
            }
        });
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
    renderWmsFormModal();
}

// ============================================================
// EDIT WMS
// ============================================================

function editWms(wmsId) {
    const wms = warehouseManagementSystems.find(
        (item) => String(item.id) === String(wmsId)
    );

    if (!wms) {
        showErrorMessage("WMS not found.");
        return;
    }

    editingWmsId = wms.id;
    renderWmsFormModal(wms);
}

// ============================================================
// WMS FORM MODAL
// ============================================================

function renderWmsFormModal(wms = null) {
    const isEditing = wms !== null;

    const content = `
        <form id="wmsForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="wmsName">Name</label>
                <input
                    type="text"
                    id="wmsName"
                    name="name"
                    value="${escapeWmsAttribute(wms?.name ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="wmsDescription">Description</label>
                <textarea
                    id="wmsDescription"
                    name="description"
                    rows="4"
                    required
                >${escapeWmsHtml(wms?.description ?? "")}</textarea>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelWmsButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveWmsButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create WMS"}
                </button>
            </div>
        </form>
    `;

    document.getElementById("wmsModal").classList.remove("hidden");

    renderModal({
        containerId: "wmsModal",
        title: isEditing ? "Edit WMS" : "Create WMS",
        content,
        onClose: closeWmsModal
    });

    document
        .getElementById("wmsForm")
        .addEventListener("submit", saveWms);

    document
        .getElementById("cancelWmsButton")
        .addEventListener("click", closeWmsModal);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeWmsModal() {
    const modal = document.getElementById("wmsModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    editingWmsId = null;
}

// ============================================================
// SAVE WMS
// ============================================================

async function saveWms(event) {
    event.preventDefault();

    const wmsData = {
        name: document.getElementById("wmsName").value.trim(),
        description: document.getElementById("wmsDescription").value.trim()
    };

    if (!wmsData.name || !wmsData.description) {
        showWarningMessage("Please complete all required fields.");
        return;
    }

    const saveButton = document.getElementById("saveWmsButton");
    saveButton.disabled = true;

    try {
        if (editingWmsId === null) {
            await createWarehouseManagementSystem(wmsData);
            closeWmsModal();
            showSuccessMessage("WMS created successfully.");
        } else {
            await updateWarehouseManagementSystem(
                editingWmsId,
                wmsData
            );

            closeWmsModal();
            showSuccessMessage("WMS updated successfully.");
        }

        await loadWms();
    } catch (error) {
        console.error("Error saving WMS:", error);
        showErrorMessage(error.message || "Error saving WMS.");

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE WMS
// ============================================================

function openRemoveWmsModal(wmsId) {
    const wms = warehouseManagementSystems.find(
        (item) => String(item.id) === String(wmsId)
    );

    if (!wms) {
        showErrorMessage("WMS not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove "${escapeWmsHtml(wms.name)}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveWmsButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveWmsButton"
                    class="danger-button"
                >
                    Remove WMS
                </button>
            </div>
        </div>
    `;

    document.getElementById("wmsModal").classList.remove("hidden");

    renderModal({
        containerId: "wmsModal",
        title: "Remove WMS",
        content,
        onClose: closeWmsModal
    });

    document
        .getElementById("cancelRemoveWmsButton")
        .addEventListener("click", closeWmsModal);

    document
        .getElementById("confirmRemoveWmsButton")
        .addEventListener("click", () => removeWms(wms.id));
}

async function removeWms(wmsId) {
    const confirmButton = document.getElementById("confirmRemoveWmsButton");

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteWarehouseManagementSystem(wmsId);

        closeWmsModal();
        showSuccessMessage("WMS removed successfully.");

        await loadWms();
    } catch (error) {
        console.error("Error removing WMS:", error);
        showErrorMessage(error.message || "Error removing WMS.");

        if (confirmButton?.isConnected) {
            confirmButton.disabled = false;
        }
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeWmsHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeWmsAttribute(value) {
    return escapeWmsHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}