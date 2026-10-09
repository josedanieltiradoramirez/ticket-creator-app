let troubleshootingTemplates = [];
let editingTemplateId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupEventListeners();

    await loadTemplates();
    handleEditQueryParameter();
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Troubleshooting Templates",
        description: "Manage reusable troubleshooting instructions and generated descriptions.",
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
    document
        .getElementById("addTemplateButton")
        .addEventListener("click", openCreateModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderTemplates);
}

// ============================================================
// LOAD TEMPLATES
// ============================================================

async function loadTemplates() {
    try {
        troubleshootingTemplates =
            await getTroubleshootingTemplates() || [];

        renderTemplates();
    } catch (error) {
        console.error(
            "Error loading troubleshooting templates:",
            error
        );

        showErrorMessage(
            error.message || "Error loading troubleshooting templates."
        );
    }
}

// ============================================================
// RENDER TEMPLATES
// ============================================================

function renderTemplates() {
    const tableBody = document.getElementById("templatesTableBody");
    const emptyState = document.getElementById("templatesEmptyState");

    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredTemplates = troubleshootingTemplates.filter((template) => {
        const name = String(template.name ?? "").toLowerCase();
        const description = String(
            template.generated_description ?? ""
        ).toLowerCase();
        const steps = String(template.steps ?? "").toLowerCase();

        return (
            name.includes(search) ||
            description.includes(search) ||
            steps.includes(search)
        );
    });

    emptyState.classList.toggle(
        "list-page-hidden",
        filteredTemplates.length !== 0
    );

    if (filteredTemplates.length === 0) {
        return;
    }

    filteredTemplates.forEach((template) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeTemplateHtml(template.name)}
                </span>
            </td>

            <td>
                ${escapeTemplateHtml(template.generated_description)}
            </td>

            <td>
                <span class="list-page-status ${
                    template.is_active
                        ? "list-page-status-active"
                        : "list-page-status-inactive"
                }">
                    ${template.is_active ? "Active" : "Inactive"}
                </span>
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeTemplateAttribute(template.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeTemplateAttribute(template.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeTemplateAttribute(template.id)}"
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
            const templateId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openTemplateDetail(templateId);
            } else if (action === "edit") {
                openEditModal(templateId);
            } else if (action === "remove") {
                openRemoveTemplateModal(templateId);
            }
        });
    });
}

// ============================================================
// OPEN TEMPLATE DETAIL
// ============================================================

function openTemplateDetail(templateId) {
    window.location.href =
        `troubleshooting-template-detail.html?id=${templateId}`;
}

// ============================================================
// CREATE TEMPLATE
// ============================================================

function openCreateModal() {
    editingTemplateId = null;
    renderTemplateModal();
}

// ============================================================
// EDIT TEMPLATE
// ============================================================

async function openEditModal(templateId) {
    try {
        const template = await getTroubleshootingTemplate(templateId);

        editingTemplateId = templateId;
        renderTemplateModal(template);
    } catch (error) {
        console.error(
            "Error loading troubleshooting template:",
            error
        );

        showErrorMessage(
            error.message || "Error loading troubleshooting template."
        );
    }
}

// ============================================================
// TEMPLATE FORM MODAL
// ============================================================

function renderTemplateModal(template = null) {
    const isEditing = template !== null;

    const content = `
        <form id="templateForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="templateName">Name</label>
                <input
                    type="text"
                    id="templateName"
                    name="name"
                    value="${escapeTemplateAttribute(template?.name ?? "")}"
                >
            </div>

            <div class="list-page-form-group">
                <label for="generatedDescription">
                    Generated Description
                </label>
                <textarea
                    id="generatedDescription"
                    name="generated_description"
                    rows="4"
                    required
                >${escapeTemplateHtml(template?.generated_description ?? "")}</textarea>
            </div>

            <div class="list-page-form-group">
                <label for="templateSteps">Troubleshooting Steps</label>
                <textarea
                    id="templateSteps"
                    name="steps"
                    rows="10"
                    required
                >${escapeTemplateHtml(template?.steps ?? "")}</textarea>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="templateIsActive"
                    name="is_active"
                    ${isEditing
                        ? (template.is_active ? "checked" : "")
                        : "checked"}
                >
                <label for="templateIsActive">Active</label>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelTemplateButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveTemplateButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create Template"}
                </button>
            </div>
        </form>
    `;

    document
        .getElementById("templateModal")
        .classList.remove("hidden");

    renderModal({
        containerId: "templateModal",
        title: isEditing
            ? "Edit Troubleshooting Template"
            : "New Troubleshooting Template",
        content,
        onClose: closeModal
    });

    document
        .getElementById("templateForm")
        .addEventListener("submit", saveTemplate);

    document
        .getElementById("cancelTemplateButton")
        .addEventListener("click", closeModal);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {
    const modal = document.getElementById("templateModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    editingTemplateId = null;
}

// ============================================================
// SAVE TEMPLATE
// ============================================================

async function saveTemplate(event) {
    event.preventDefault();

    const templateData = {
        name: document
            .getElementById("templateName")
            .value
            .trim() || null,

        steps: document
            .getElementById("templateSteps")
            .value,

        generated_description: document
            .getElementById("generatedDescription")
            .value,

        is_active: document
            .getElementById("templateIsActive")
            .checked
    };

    if (
        !templateData.generated_description.trim() ||
        !templateData.steps.trim()
    ) {
        showWarningMessage(
            "Please complete the generated description and troubleshooting steps."
        );
        return;
    }

    const saveButton = document.getElementById("saveTemplateButton");
    saveButton.disabled = true;

    try {
        if (editingTemplateId === null) {
            await createTroubleshootingTemplate(templateData);

            closeModal();
            showSuccessMessage(
                "Troubleshooting template created successfully."
            );
        } else {
            await updateTroubleshootingTemplate(
                editingTemplateId,
                templateData
            );

            closeModal();
            showSuccessMessage(
                "Troubleshooting template updated successfully."
            );
        }

        await loadTemplates();
    } catch (error) {
        console.error(
            "Error saving troubleshooting template:",
            error
        );

        showErrorMessage(
            error.message || "Error saving troubleshooting template."
        );

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE TEMPLATE
// ============================================================

function openRemoveTemplateModal(templateId) {
    const template = troubleshootingTemplates.find(
        (item) => String(item.id) === String(templateId)
    );

    if (!template) {
        showErrorMessage("Troubleshooting template not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove
                "${escapeTemplateHtml(template.name || "this template")}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveTemplateButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveTemplateButton"
                    class="danger-button"
                >
                    Remove Template
                </button>
            </div>
        </div>
    `;

    document
        .getElementById("templateModal")
        .classList.remove("hidden");

    renderModal({
        containerId: "templateModal",
        title: "Remove Troubleshooting Template",
        content,
        onClose: closeModal
    });

    document
        .getElementById("cancelRemoveTemplateButton")
        .addEventListener("click", closeModal);

    document
        .getElementById("confirmRemoveTemplateButton")
        .addEventListener("click", () => removeTemplate(template.id));
}

async function removeTemplate(templateId) {
    const confirmButton = document.getElementById(
        "confirmRemoveTemplateButton"
    );

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteTroubleshootingTemplate(templateId);

        closeModal();

        showSuccessMessage(
            "Troubleshooting template removed successfully."
        );

        await loadTemplates();
    } catch (error) {
        console.error(
            "Error deleting troubleshooting template:",
            error
        );

        showErrorMessage(
            error.message || "Error deleting troubleshooting template."
        );

        if (confirmButton?.isConnected) {
            confirmButton.disabled = false;
        }
    }
}

// ============================================================
// HANDLE EDIT QUERY PARAMETER
// ============================================================

function handleEditQueryParameter() {
    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));

    if (editId) {
        openEditModal(editId);
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeTemplateHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeTemplateAttribute(value) {
    return escapeTemplateHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}