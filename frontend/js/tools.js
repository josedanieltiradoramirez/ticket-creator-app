
// ============================================================
// TOOLS LIST
// ============================================================

let tools = [];

let editingToolId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        renderPageHeader();
        setupEventListeners();
        await loadTools();
    }
);


// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Tools",
        description:
            "Manage and configure the tools used by the ticketing system.",
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

function setupEventListeners() {
    const addButton =
        document.getElementById("addToolButton");

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
            renderTools
        );
    }
}


// ============================================================
// LOAD TOOLS
// ============================================================

async function loadTools() {
    try {
        tools = await getTools() || [];
        renderTools();
    } catch (error) {
        console.error(
            "Error loading tools:",
            error
        );

        showErrorMessage(
            "Error loading tools."
        );
    }
}


// ============================================================
// RENDER TOOLS
// ============================================================

function renderTools() {
    const tableBody =
        document.getElementById("toolsTableBody");

    const emptyState =
        document.getElementById("toolsEmptyState");

    const searchInput =
        document.getElementById("searchInput");

    if (!tableBody) {
        return;
    }

    const search =
        String(searchInput?.value || "")
            .trim()
            .toLowerCase();

    tableBody.innerHTML = "";

    const filteredTools = tools.filter(tool => {
        const name =
            String(tool.name || "").toLowerCase();

        const description =
            String(tool.description || "").toLowerCase();

        return (
            name.includes(search) ||
            description.includes(search)
        );
    });


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (filteredTools.length === 0) {
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
                    tools.length === 0
                        ? "There are no tools available yet."
                        : "No tools match your search.";
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

    filteredTools.forEach(tool => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="list-page-primary-value">
                    ${escapeToolHtml(tool.name || "-")}
                </div>
            </td>

            <td>
                ${escapeToolHtml(tool.description || "-")}
            </td>

            <td>
                <span class="
                    list-page-status
                    ${
                        tool.is_active
                            ? "list-page-status-active"
                            : "list-page-status-inactive"
                    }
                ">
                    ${
                        tool.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${tool.id}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${tool.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${tool.id}"
                    >
                        Remove
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    setupRowActionListeners();
}


// ============================================================
// ROW ACTION LISTENERS
// ============================================================

function setupRowActionListeners() {
    const buttons =
        document.querySelectorAll(
            "#toolsTableBody [data-action]"
        );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            const toolId = Number(button.dataset.id);

            if (!toolId) {
                return;
            }

            switch (action) {
                case "view":
                    openToolDetail(toolId);
                    break;

                case "edit":
                    openEditModal(toolId);
                    break;

                case "remove":
                    openRemoveModal(toolId);
                    break;
            }
        });
    });
}


// ============================================================
// CREATE MODAL
// ============================================================

function openCreateModal() {
    editingToolId = null;

    renderToolFormModal({
        mode: "create",
        tool: null
    });
}


// ============================================================
// EDIT MODAL
// ============================================================

function openEditModal(toolId) {
    const tool = tools.find(
        item => Number(item.id) === Number(toolId)
    );

    if (!tool) {
        showErrorMessage("Tool not found.");
        return;
    }

    editingToolId = toolId;

    renderToolFormModal({
        mode: "edit",
        tool: tool
    });
}


// ============================================================
// TOOL FORM MODAL
// ============================================================

function renderToolFormModal({ mode, tool }) {
    const isEdit = mode === "edit";

    const title =
        isEdit ? "Edit Tool" : "New Tool";

    const content = `
        <form id="toolForm" class="list-page-form">

            <div class="list-page-form-group">
                <label for="toolName">Name</label>

                <input
                    type="text"
                    id="toolName"
                    value="${escapeToolAttribute(tool?.name || "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="toolDescription">Description</label>

                <textarea
                    id="toolDescription"
                    rows="5"
                    required
                >${escapeToolHtml(tool?.description || "")}</textarea>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="toolIsActive"
                    ${
                        tool
                            ? (tool.is_active ? "checked" : "")
                            : "checked"
                    }
                >

                <label for="toolIsActive">Active</label>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="toolCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                    id="toolSaveButton"
                >
                    ${isEdit ? "Save Changes" : "Create Tool"}
                </button>
            </div>

        </form>
    `;

    renderModal({
        containerId: "toolModal",
        title: title,
        content: content,
        onClose: closeModal
    });

    const modal =
        document.getElementById("toolModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    const cancelButton =
        modal.querySelector("#toolCancelButton");

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeModal
        );
    }

    const form =
        modal.querySelector("#toolForm");

    if (form) {
        form.addEventListener("submit", saveTool);
    }
}


// ============================================================
// SAVE TOOL
// ============================================================

async function saveTool(event) {
    event.preventDefault();

    const saveButton =
        document.getElementById("toolSaveButton");

    const toolData = {
        name:
            document.getElementById("toolName")
                .value.trim(),

        description:
            document.getElementById("toolDescription")
                .value.trim(),

        is_active:
            document.getElementById("toolIsActive")
                .checked
    };

    if (!toolData.name || !toolData.description) {
        showWarningMessage(
            "Please complete all required fields."
        );
        return;
    }

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        if (editingToolId === null) {
            await createTool(toolData);

            showSuccessMessage(
                "Tool created successfully."
            );
        } else {
            await updateTool(editingToolId, toolData);

            showSuccessMessage(
                "Tool updated successfully."
            );
        }

        closeModal();
        await loadTools();
    } catch (error) {
        console.error("Error saving tool:", error);

        showErrorMessage("Error saving tool.");
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


// ============================================================
// REMOVE MODAL
// ============================================================

function openRemoveModal(toolId) {
    const tool = tools.find(
        item => Number(item.id) === Number(toolId)
    );

    if (!tool) {
        return;
    }

    const content = `
        <div class="list-page-confirmation">

            <p class="list-page-confirmation-message">
                Are you sure you want to remove
                <strong>${escapeToolHtml(tool.name || "-")}</strong>?
            </p>

            <p class="list-page-confirmation-description">
                This action will remove the Tool from the system.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="removeCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="danger-button"
                    id="removeConfirmButton"
                >
                    Remove
                </button>
            </div>

        </div>
    `;

    renderModal({
        containerId: "toolModal",
        title: "Remove Tool",
        content: content,
        onClose: closeModal
    });

    const modal =
        document.getElementById("toolModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    const cancelButton =
        modal.querySelector("#removeCancelButton");

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeModal
        );
    }

    const confirmButton =
        modal.querySelector("#removeConfirmButton");

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            () => removeTool(toolId)
        );
    }
}


// ============================================================
// REMOVE TOOL
// ============================================================

async function removeTool(toolId) {
    const confirmButton =
        document.getElementById("removeConfirmButton");

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteToolApi(toolId);

        closeModal();

        showSuccessMessage(
            "Tool removed successfully."
        );

        await loadTools();
    } catch (error) {
        console.error("Error removing tool:", error);

        showErrorMessage("Error removing tool.");

        if (confirmButton) {
            confirmButton.disabled = false;
        }
    }
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {
    const modal =
        document.getElementById("toolModal");

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.innerHTML = "";
}


// ============================================================
// OPEN DETAIL
// ============================================================

function openToolDetail(toolId) {
    window.location.href =
        `tool-detail.html?id=${toolId}`;
}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeToolHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeToolAttribute(value) {
    return escapeToolHtml(value);
}