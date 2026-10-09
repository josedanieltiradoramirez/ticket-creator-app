let knowledgeBaseItems = [];
let editingKnowledgeBaseId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupEventListeners();

    await loadKnowledgeBase();
    handleEditQueryParameter();
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Knowledge Base",
        description: "Manage knowledge base articles and reference information for troubleshooting.",
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
        .getElementById("addKnowledgeBaseButton")
        .addEventListener("click", openCreateModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderKnowledgeBase);
}

// ============================================================
// LOAD KNOWLEDGE BASE
// ============================================================

async function loadKnowledgeBase() {
    try {
        knowledgeBaseItems = await getKnowledgeBaseItems() || [];
        renderKnowledgeBase();
    } catch (error) {
        console.error("Error loading knowledge base:", error);
        showErrorMessage(error.message || "Error loading knowledge base.");
    }
}

// ============================================================
// RENDER KNOWLEDGE BASE
// ============================================================

function renderKnowledgeBase() {
    const tableBody = document.getElementById("knowledgeBaseTableBody");
    const emptyState = document.getElementById("knowledgeBaseEmptyState");

    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredItems = knowledgeBaseItems.filter((item) => {
        const articleNumber = String(item.article_number ?? "").toLowerCase();
        const title = String(item.title ?? "").toLowerCase();
        const description = String(item.description ?? "").toLowerCase();
        const url = String(item.url ?? "").toLowerCase();

        return (
            articleNumber.includes(search) ||
            title.includes(search) ||
            description.includes(search) ||
            url.includes(search)
        );
    });

    emptyState.classList.toggle(
        "list-page-hidden",
        filteredItems.length !== 0
    );

    if (filteredItems.length === 0) {
        return;
    }

    filteredItems.forEach((item) => {
        const row = document.createElement("tr");
        const safeUrl = getSafeKnowledgeBaseUrl(item.url);

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeKnowledgeBaseHtml(item.article_number)}
                </span>
            </td>

            <td>
                ${escapeKnowledgeBaseHtml(item.title)}
            </td>

            <td>
                ${
                    safeUrl
                        ? `<a href="${escapeKnowledgeBaseAttribute(safeUrl)}"
                               target="_blank"
                               rel="noopener noreferrer">Open</a>`
                        : "—"
                }
            </td>

            <td>
                ${escapeKnowledgeBaseHtml(item.description)}
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeKnowledgeBaseAttribute(item.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeKnowledgeBaseAttribute(item.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeKnowledgeBaseAttribute(item.id)}"
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
            const itemId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openKnowledgeBaseDetail(itemId);
            } else if (action === "edit") {
                openEditModal(itemId);
            } else if (action === "remove") {
                openRemoveKnowledgeBaseModal(itemId);
            }
        });
    });
}

// ============================================================
// OPEN KNOWLEDGE BASE DETAIL
// ============================================================

function openKnowledgeBaseDetail(knowledgeBaseId) {
    window.location.href =
        `knowledge-base-detail.html?id=${knowledgeBaseId}`;
}

// ============================================================
// CREATE KNOWLEDGE BASE ARTICLE
// ============================================================

function openCreateModal() {
    editingKnowledgeBaseId = null;
    renderKnowledgeBaseModal();
}

// ============================================================
// EDIT KNOWLEDGE BASE ARTICLE
// ============================================================

async function openEditModal(knowledgeBaseId) {
    try {
        const item = await getKnowledgeBaseItem(knowledgeBaseId);

        editingKnowledgeBaseId = knowledgeBaseId;
        renderKnowledgeBaseModal(item);
    } catch (error) {
        console.error("Error loading knowledge base item:", error);
        showErrorMessage(
            error.message || "Error loading knowledge base article."
        );
    }
}

// ============================================================
// KNOWLEDGE BASE FORM MODAL
// ============================================================

function renderKnowledgeBaseModal(item = null) {
    const isEditing = item !== null;

    const content = `
        <form id="knowledgeBaseForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="articleNumber">Article Number</label>
                <input
                    type="text"
                    id="articleNumber"
                    name="article_number"
                    value="${escapeKnowledgeBaseAttribute(item?.article_number ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="knowledgeBaseTitle">Title</label>
                <input
                    type="text"
                    id="knowledgeBaseTitle"
                    name="title"
                    value="${escapeKnowledgeBaseAttribute(item?.title ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="knowledgeBaseUrl">URL</label>
                <input
                    type="url"
                    id="knowledgeBaseUrl"
                    name="url"
                    value="${escapeKnowledgeBaseAttribute(item?.url ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="knowledgeBaseDescription">Description</label>
                <textarea
                    id="knowledgeBaseDescription"
                    name="description"
                    rows="5"
                    required
                >${escapeKnowledgeBaseHtml(item?.description ?? "")}</textarea>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelKnowledgeBaseButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveKnowledgeBaseButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create Article"}
                </button>
            </div>
        </form>
    `;

    document
        .getElementById("knowledgeBaseModal")
        .classList.remove("hidden");

    renderModal({
        containerId: "knowledgeBaseModal",
        title: isEditing
            ? "Edit Knowledge Base Article"
            : "New Knowledge Base Article",
        content,
        onClose: closeModal
    });

    document
        .getElementById("knowledgeBaseForm")
        .addEventListener("submit", saveKnowledgeBaseItem);

    document
        .getElementById("cancelKnowledgeBaseButton")
        .addEventListener("click", closeModal);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {
    const modal = document.getElementById("knowledgeBaseModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    editingKnowledgeBaseId = null;
}

// ============================================================
// SAVE KNOWLEDGE BASE ARTICLE
// ============================================================

async function saveKnowledgeBaseItem(event) {
    event.preventDefault();

    const itemData = {
        article_number: document
            .getElementById("articleNumber")
            .value
            .trim(),

        title: document
            .getElementById("knowledgeBaseTitle")
            .value
            .trim(),

        url: document
            .getElementById("knowledgeBaseUrl")
            .value
            .trim(),

        description: document
            .getElementById("knowledgeBaseDescription")
            .value
            .trim()
    };

    if (
        !itemData.article_number ||
        !itemData.title ||
        !itemData.url ||
        !itemData.description
    ) {
        showWarningMessage("Please complete all required fields.");
        return;
    }

    if (!getSafeKnowledgeBaseUrl(itemData.url)) {
        showWarningMessage("Please enter a valid HTTP or HTTPS URL.");
        return;
    }

    const saveButton = document.getElementById(
        "saveKnowledgeBaseButton"
    );

    saveButton.disabled = true;

    try {
        if (editingKnowledgeBaseId === null) {
            await createKnowledgeBaseItem(itemData);

            closeModal();
            showSuccessMessage(
                "Knowledge base article created successfully."
            );
        } else {
            await updateKnowledgeBaseItem(
                editingKnowledgeBaseId,
                itemData
            );

            closeModal();
            showSuccessMessage(
                "Knowledge base article updated successfully."
            );
        }

        await loadKnowledgeBase();
    } catch (error) {
        console.error("Error saving knowledge base item:", error);

        showErrorMessage(
            error.message || "Error saving knowledge base article."
        );

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE KNOWLEDGE BASE ARTICLE
// ============================================================

function openRemoveKnowledgeBaseModal(knowledgeBaseId) {
    const item = knowledgeBaseItems.find(
        (entry) => String(entry.id) === String(knowledgeBaseId)
    );

    if (!item) {
        showErrorMessage("Knowledge base article not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove
                "${escapeKnowledgeBaseHtml(item.title || item.article_number)}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveKnowledgeBaseButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveKnowledgeBaseButton"
                    class="danger-button"
                >
                    Remove Article
                </button>
            </div>
        </div>
    `;

    document
        .getElementById("knowledgeBaseModal")
        .classList.remove("hidden");

    renderModal({
        containerId: "knowledgeBaseModal",
        title: "Remove Knowledge Base Article",
        content,
        onClose: closeModal
    });

    document
        .getElementById("cancelRemoveKnowledgeBaseButton")
        .addEventListener("click", closeModal);

    document
        .getElementById("confirmRemoveKnowledgeBaseButton")
        .addEventListener("click", () => {
            removeKnowledgeBaseItem(item.id);
        });
}

async function removeKnowledgeBaseItem(knowledgeBaseId) {
    const confirmButton = document.getElementById(
        "confirmRemoveKnowledgeBaseButton"
    );

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteKnowledgeBaseItem(knowledgeBaseId);

        closeModal();
        showSuccessMessage(
            "Knowledge base article removed successfully."
        );

        await loadKnowledgeBase();
    } catch (error) {
        console.error("Error deleting knowledge base item:", error);

        showErrorMessage(
            error.message || "Error deleting knowledge base article."
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
// URL VALIDATION
// ============================================================

function getSafeKnowledgeBaseUrl(value) {
    try {
        const url = new URL(String(value ?? ""));

        if (url.protocol === "http:" || url.protocol === "https:") {
            return url.href;
        }

        return "";
    } catch {
        return "";
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeKnowledgeBaseHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeKnowledgeBaseAttribute(value) {
    return escapeKnowledgeBaseHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}