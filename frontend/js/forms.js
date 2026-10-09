let forms = [];
let editingFormId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupEventListeners();

    await loadForms();
    handleEditQueryParameter();
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Forms",
        description: "Manage the information requirements used when creating tickets.",
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
        .getElementById("addFormButton")
        .addEventListener("click", openCreateModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderForms);
}

// ============================================================
// LOAD FORMS
// ============================================================

async function loadForms() {
    try {
        forms = await getForms() || [];
        renderForms();
    } catch (error) {
        console.error("Error loading forms:", error);
        showErrorMessage(error.message || "Error loading forms.");
    }
}

// ============================================================
// RENDER FORMS
// ============================================================

function renderForms() {
    const tableBody = document.getElementById("formsTableBody");
    const emptyState = document.getElementById("formsEmptyState");

    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredForms = forms.filter((form) => {
        const name = String(form.name ?? "").toLowerCase();
        const description = String(form.description ?? "").toLowerCase();

        return name.includes(search) || description.includes(search);
    });

    emptyState.classList.toggle(
        "list-page-hidden",
        filteredForms.length !== 0
    );

    if (filteredForms.length === 0) {
        return;
    }

    filteredForms.forEach((form) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeFormHtml(form.name)}
                </span>
            </td>

            <td>
                ${escapeFormHtml(form.description)}
            </td>

            <td>
                <span class="list-page-status ${
                    form.is_active
                        ? "list-page-status-active"
                        : "list-page-status-inactive"
                }">
                    ${form.is_active ? "Active" : "Inactive"}
                </span>
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeFormAttribute(form.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeFormAttribute(form.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeFormAttribute(form.id)}"
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
            const formId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openFormDetail(formId);
            } else if (action === "edit") {
                openEditModal(formId);
            } else if (action === "remove") {
                openRemoveFormModal(formId);
            }
        });
    });
}

// ============================================================
// OPEN FORM DETAIL
// ============================================================

function openFormDetail(formId) {
    window.location.href = `form-detail.html?id=${formId}`;
}

// ============================================================
// CREATE FORM
// ============================================================

function openCreateModal() {
    editingFormId = null;
    renderFormModal();
}

// ============================================================
// EDIT FORM
// ============================================================

async function openEditModal(formId) {
    try {
        const form = await getForm(formId);

        editingFormId = formId;
        renderFormModal(form);
    } catch (error) {
        console.error("Error loading form:", error);
        showErrorMessage(error.message || "Error loading form.");
    }
}

// ============================================================
// FORM MODAL
// ============================================================

function renderFormModal(form = null) {
    const isEditing = form !== null;

    const content = `
        <form id="formForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="formName">Form Name</label>
                <input
                    type="text"
                    id="formName"
                    name="name"
                    value="${escapeFormAttribute(form?.name ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="formDescription">Information Needed</label>
                <textarea
                    id="formDescription"
                    name="description"
                    rows="6"
                    required
                >${escapeFormHtml(form?.description ?? "")}</textarea>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="formIsActive"
                    name="is_active"
                    ${form?.is_active !== false ? "checked" : ""}
                >
                <label for="formIsActive">Active</label>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelFormButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveFormButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create Form"}
                </button>
            </div>
        </form>
    `;

    document.getElementById("formModal").classList.remove("hidden");

    renderModal({
        containerId: "formModal",
        title: isEditing ? "Edit Form" : "Create Form",
        content,
        onClose: closeModal
    });

    document
        .getElementById("formForm")
        .addEventListener("submit", saveForm);

    document
        .getElementById("cancelFormButton")
        .addEventListener("click", closeModal);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {
    const modal = document.getElementById("formModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    editingFormId = null;
}

// ============================================================
// SAVE FORM
// ============================================================

async function saveForm(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById("formName").value.trim(),
        description: document.getElementById("formDescription").value.trim(),
        is_active: document.getElementById("formIsActive").checked
    };

    if (!formData.name || !formData.description) {
        showWarningMessage("Please complete all required fields.");
        return;
    }

    const saveButton = document.getElementById("saveFormButton");
    saveButton.disabled = true;

    try {
        if (editingFormId === null) {
            await createForm(formData);
            closeModal();
            showSuccessMessage("Form created successfully.");
        } else {
            await updateForm(editingFormId, formData);
            closeModal();
            showSuccessMessage("Form updated successfully.");
        }

        await loadForms();
    } catch (error) {
        console.error("Error saving form:", error);
        showErrorMessage(error.message || "Error saving form.");

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE FORM
// ============================================================

function openRemoveFormModal(formId) {
    const form = forms.find(
        (item) => String(item.id) === String(formId)
    );

    if (!form) {
        showErrorMessage("Form not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove "${escapeFormHtml(form.name)}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveFormButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveFormButton"
                    class="danger-button"
                >
                    Remove Form
                </button>
            </div>
        </div>
    `;

    document.getElementById("formModal").classList.remove("hidden");

    renderModal({
        containerId: "formModal",
        title: "Remove Form",
        content,
        onClose: closeModal
    });

    document
        .getElementById("cancelRemoveFormButton")
        .addEventListener("click", closeModal);

    document
        .getElementById("confirmRemoveFormButton")
        .addEventListener("click", () => removeForm(form.id));
}

async function removeForm(formId) {
    const confirmButton = document.getElementById("confirmRemoveFormButton");

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteForm(formId);

        closeModal();
        showSuccessMessage("Form removed successfully.");

        await loadForms();
    } catch (error) {
        console.error("Error removing form:", error);
        showErrorMessage(error.message || "Error removing form.");

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

function escapeFormHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeFormAttribute(value) {
    return escapeFormHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}