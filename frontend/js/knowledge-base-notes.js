let knowledgeBaseNotes = [];
let currentNoteId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupEventListeners();

    await loadNotes();
    handleEditParameter();
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Knowledge Management",
        title: "Knowledge Base Notes",
        description: "Create and manage reusable internal notes and troubleshooting knowledge.",
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
        .getElementById("addNoteButton")
        .addEventListener("click", openCreateModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderNotes);
}

// ============================================================
// LOAD NOTES
// ============================================================

async function loadNotes() {
    try {
        knowledgeBaseNotes = await getKnowledgeBaseNotes() || [];
        renderNotes();
    } catch (error) {
        console.error("Error loading Knowledge Base Notes:", error);
        showErrorMessage(
            error.message || "Error loading Knowledge Base Notes."
        );
    }
}

// ============================================================
// RENDER NOTES
// ============================================================

function renderNotes() {
    const tableBody = document.getElementById("notesTableBody");
    const emptyState = document.getElementById("notesEmptyState");

    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredNotes = knowledgeBaseNotes.filter((note) => {
        const title = String(note.title ?? "").toLowerCase();
        const category = String(note.category ?? "").toLowerCase();
        const content = String(note.content ?? "").toLowerCase();

        return (
            title.includes(search) ||
            category.includes(search) ||
            content.includes(search)
        );
    });

    emptyState.classList.toggle(
        "list-page-hidden",
        filteredNotes.length !== 0
    );

    if (filteredNotes.length === 0) {
        return;
    }

    filteredNotes.forEach((note) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeNoteHtml(note.title || "-")}
                </span>
            </td>

            <td>
                ${escapeNoteHtml(note.category || "-")}
            </td>

            <td>
                <span class="list-page-status ${
                    note.is_active
                        ? "list-page-status-active"
                        : "list-page-status-inactive"
                }">
                    ${note.is_active ? "Active" : "Inactive"}
                </span>
            </td>

            <td>
                ${note.is_pinned ? "Yes" : "No"}
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeNoteAttribute(note.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeNoteAttribute(note.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeNoteAttribute(note.id)}"
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
            const noteId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openNoteDetail(noteId);
            } else if (action === "edit") {
                openEditModal(noteId);
            } else if (action === "remove") {
                openRemoveNoteModal(noteId);
            }
        });
    });
}

// ============================================================
// OPEN NOTE DETAIL
// ============================================================

function openNoteDetail(noteId) {
    window.location.href =
        `knowledge-base-note-detail.html?id=${noteId}`;
}

// ============================================================
// CREATE NOTE
// ============================================================

function openCreateModal() {
    currentNoteId = null;
    renderNoteModal();
}

// ============================================================
// EDIT NOTE
// ============================================================

async function openEditModal(noteId) {
    try {
        const note = await getKnowledgeBaseNote(noteId);

        currentNoteId = noteId;
        renderNoteModal(note);
    } catch (error) {
        console.error("Error loading note for editing:", error);
        showErrorMessage(
            error.message || "Error loading Knowledge Base Note."
        );
    }
}

// ============================================================
// NOTE FORM MODAL
// ============================================================

function renderNoteModal(note = null) {
    const isEditing = note !== null;

    const content = `
        <form id="noteForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="noteTitleInput">Title</label>
                <input
                    type="text"
                    id="noteTitleInput"
                    name="title"
                    value="${escapeNoteAttribute(note?.title ?? "")}"
                    placeholder="Enter note title"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="noteCategoryInput">Category</label>
                <input
                    type="text"
                    id="noteCategoryInput"
                    name="category"
                    value="${escapeNoteAttribute(note?.category ?? "")}"
                    placeholder="Enter category"
                >
            </div>

            <div class="list-page-form-group">
                <label for="noteContentInput">Content</label>
                <textarea
                    id="noteContentInput"
                    name="content"
                    rows="10"
                    placeholder="Enter note content"
                    required
                >${escapeNoteHtml(note?.content ?? "")}</textarea>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="notePinnedInput"
                    name="is_pinned"
                    ${note?.is_pinned ? "checked" : ""}
                >
                <label for="notePinnedInput">Pinned</label>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="noteActiveInput"
                    name="is_active"
                    ${note ? (note.is_active ? "checked" : "") : "checked"}
                >
                <label for="noteActiveInput">Active</label>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelNoteButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveNoteButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create Note"}
                </button>
            </div>
        </form>
    `;

    document.getElementById("noteModal").classList.remove("hidden");

    renderModal({
        containerId: "noteModal",
        title: isEditing
            ? "Edit Knowledge Base Note"
            : "Add Knowledge Base Note",
        content,
        onClose: closeNoteModal
    });

    document
        .getElementById("noteForm")
        .addEventListener("submit", saveNote);

    document
        .getElementById("cancelNoteButton")
        .addEventListener("click", closeNoteModal);
}

// ============================================================
// HANDLE EDIT PARAMETER
// ============================================================

async function handleEditParameter() {
    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));

    if (!editId) {
        return;
    }

    await openEditModal(editId);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeNoteModal() {
    const modal = document.getElementById("noteModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    currentNoteId = null;
}

// ============================================================
// SAVE NOTE
// ============================================================

async function saveNote(event) {
    event.preventDefault();

    const title = document
        .getElementById("noteTitleInput")
        .value
        .trim();

    const category = document
        .getElementById("noteCategoryInput")
        .value
        .trim();

    const content = document
        .getElementById("noteContentInput")
        .value
        .trim();

    if (!title) {
        showWarningMessage("Title is required.");
        return;
    }

    if (!content) {
        showWarningMessage("Content is required.");
        return;
    }

    const data = {
        title,
        content,
        category: category || null,
        is_pinned: document.getElementById("notePinnedInput").checked,
        is_active: document.getElementById("noteActiveInput").checked
    };

    const saveButton = document.getElementById("saveNoteButton");
    saveButton.disabled = true;

    try {
        if (currentNoteId === null) {
            await createKnowledgeBaseNote(data);

            closeNoteModal();
            showSuccessMessage("Knowledge Base Note created successfully.");
        } else {
            await updateKnowledgeBaseNote(currentNoteId, data);

            closeNoteModal();
            showSuccessMessage("Knowledge Base Note updated successfully.");
        }

        await loadNotes();
    } catch (error) {
        console.error("Error saving Knowledge Base Note:", error);

        showErrorMessage(
            error.message || "Error saving Knowledge Base Note."
        );

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE NOTE
// ============================================================

function openRemoveNoteModal(noteId) {
    const note = knowledgeBaseNotes.find(
        (item) => String(item.id) === String(noteId)
    );

    if (!note) {
        showErrorMessage("Knowledge Base Note not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove
                "${escapeNoteHtml(note.title || "this note")}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveNoteButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveNoteButton"
                    class="danger-button"
                >
                    Remove Note
                </button>
            </div>
        </div>
    `;

    document.getElementById("noteModal").classList.remove("hidden");

    renderModal({
        containerId: "noteModal",
        title: "Remove Knowledge Base Note",
        content,
        onClose: closeNoteModal
    });

    document
        .getElementById("cancelRemoveNoteButton")
        .addEventListener("click", closeNoteModal);

    document
        .getElementById("confirmRemoveNoteButton")
        .addEventListener("click", () => removeNote(note.id));
}

async function removeNote(noteId) {
    const confirmButton = document.getElementById("confirmRemoveNoteButton");

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteKnowledgeBaseNote(noteId);

        closeNoteModal();
        showSuccessMessage("Knowledge Base Note removed successfully.");

        await loadNotes();
    } catch (error) {
        console.error("Error deleting Knowledge Base Note:", error);

        showErrorMessage(
            error.message || "Error deleting Knowledge Base Note."
        );

        if (confirmButton?.isConnected) {
            confirmButton.disabled = false;
        }
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeNoteHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeNoteAttribute(value) {
    return escapeNoteHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}