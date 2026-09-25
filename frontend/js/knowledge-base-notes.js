let currentNoteId = null;


// ============================================================
// DOM CONTENT LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();

        setupEventListeners();

        await loadNotes();

        handleEditParameter();

    }
);


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    document
        .getElementById("ticketsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


    document
        .getElementById("toolsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "tools.html";

            }
        );


    document
        .getElementById("locationsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "locations.html";

            }
        );


    document
        .getElementById("queuesButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "queues.html";

            }
        );


    document
        .getElementById("wmsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "warehouse-management-systems.html";

            }
        );


    document
        .getElementById("formsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "forms.html";

            }
        );


    document
        .getElementById(
            "troubleshootingTemplatesButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "troubleshooting-templates.html";

            }
        );


    document
        .getElementById(
            "knowledgeBaseButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "knowledge-base.html";

            }
        );


    document
        .getElementById(
            "knowledgeBaseNotesButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "knowledge-base-notes.html";

            }
        );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    document
        .getElementById("addNoteButton")
        .addEventListener(
            "click",
            openCreateModal
        );


    document
        .getElementById("closeNoteModalButton")
        .addEventListener(
            "click",
            closeNoteModal
        );


    document
        .getElementById("cancelNoteButton")
        .addEventListener(
            "click",
            closeNoteModal
        );


    document
        .getElementById("saveNoteButton")
        .addEventListener(
            "click",
            saveNote
        );

}


// ============================================================
// LOAD NOTES
// ============================================================

async function loadNotes() {

    const tableBody =
        document.getElementById(
            "notesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    try {

        const notes =
            await getKnowledgeBaseNotes();


        tableBody.innerHTML =
            "";


        if (
            !notes ||
            notes.length === 0
        ) {

            emptyMessage
                .classList
                .remove("hidden");

            return;

        }


        emptyMessage
            .classList
            .add("hidden");


        notes.forEach(note => {

            const row =
                document.createElement(
                    "tr"
                );


            // =================================================
            // TITLE
            // =================================================

            const titleCell =
                document.createElement(
                    "td"
                );

            titleCell.textContent =
                note.title || "-";


            // =================================================
            // CATEGORY
            // =================================================

            const categoryCell =
                document.createElement(
                    "td"
                );

            categoryCell.textContent =
                note.category || "-";


            // =================================================
            // STATUS
            // =================================================

            const statusCell =
                document.createElement(
                    "td"
                );

            statusCell.innerHTML =
                createStatusBadge(
                    note.is_active
                );


            // =================================================
            // PINNED
            // =================================================

            const pinnedCell =
                document.createElement(
                    "td"
                );

            pinnedCell.textContent =
                note.is_pinned
                    ? "Yes"
                    : "No";


            // =================================================
            // ACTIONS
            // =================================================

            const actionsCell =
                document.createElement(
                    "td"
                );

            actionsCell.className =
                "crud-actions";


            // -------------------------------------------------
            // VIEW
            // -------------------------------------------------

            const viewButton =
                document.createElement(
                    "button"
                );

            viewButton.textContent =
                "View";


            viewButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `knowledge-base-note-detail.html?id=${note.id}`;

                }
            );


            // -------------------------------------------------
            // EDIT
            // -------------------------------------------------

            const editButton =
                document.createElement(
                    "button"
                );

            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => {

                    openEditModal(note);

                }
            );


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteNote(note.id);

                }
            );


            actionsCell.appendChild(
                viewButton
            );

            actionsCell.appendChild(
                editButton
            );

            actionsCell.appendChild(
                deleteButton
            );


            // =================================================
            // ROW
            // =================================================

            row.appendChild(
                titleCell
            );

            row.appendChild(
                categoryCell
            );

            row.appendChild(
                statusCell
            );

            row.appendChild(
                pinnedCell
            );

            row.appendChild(
                actionsCell
            );


            tableBody.appendChild(
                row
            );

        });

    } catch (error) {

        console.error(
            "Error loading Knowledge Base Notes:",
            error
        );

        alert(
            "Error loading Knowledge Base Notes."
        );

    }

}


// ============================================================
// CREATE MODAL
// ============================================================

function openCreateModal() {

    currentNoteId =
        null;


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Add Knowledge Base Note";


    document.getElementById(
        "noteTitleInput"
    ).value =
        "";


    document.getElementById(
        "noteCategoryInput"
    ).value =
        "";


    document.getElementById(
        "noteContentInput"
    ).value =
        "";


    document.getElementById(
        "notePinnedInput"
    ).checked =
        false;


    document.getElementById(
        "noteActiveInput"
    ).checked =
        true;


    document
        .getElementById("noteModal")
        .classList
        .remove("hidden");

}


// ============================================================
// EDIT MODAL
// ============================================================

function openEditModal(note) {

    currentNoteId =
        note.id;


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Edit Knowledge Base Note";


    document.getElementById(
        "noteTitleInput"
    ).value =
        note.title || "";


    document.getElementById(
        "noteCategoryInput"
    ).value =
        note.category || "";


    document.getElementById(
        "noteContentInput"
    ).value =
        note.content || "";


    document.getElementById(
        "notePinnedInput"
    ).checked =
        Boolean(
            note.is_pinned
        );


    document.getElementById(
        "noteActiveInput"
    ).checked =
        Boolean(
            note.is_active
        );


    document
        .getElementById("noteModal")
        .classList
        .remove("hidden");

}


// ============================================================
// HANDLE EDIT PARAMETER
// ============================================================

async function handleEditParameter() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {
        return;
    }


    try {

        const note =
            await getKnowledgeBaseNote(
                Number(editId)
            );


        openEditModal(note);


    } catch (error) {

        console.error(
            "Error loading note for editing:",
            error
        );

        alert(
            "Error loading Knowledge Base Note."
        );

    }

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeNoteModal() {

    document
        .getElementById("noteModal")
        .classList
        .add("hidden");


    currentNoteId =
        null;

}


// ============================================================
// SAVE NOTE
// ============================================================

async function saveNote() {

    const title =
        document
            .getElementById(
                "noteTitleInput"
            )
            .value
            .trim();


    const category =
        document
            .getElementById(
                "noteCategoryInput"
            )
            .value
            .trim();


    const content =
        document
            .getElementById(
                "noteContentInput"
            )
            .value
            .trim();


    const isPinned =
        document
            .getElementById(
                "notePinnedInput"
            )
            .checked;


    const isActive =
        document
            .getElementById(
                "noteActiveInput"
            )
            .checked;


    if (!title) {

        alert(
            "Title is required."
        );

        return;

    }


    if (!content) {

        alert(
            "Content is required."
        );

        return;

    }


    const data = {

        title:
            title,

        content:
            content,

        category:
            category || null,

        is_pinned:
            isPinned,

        is_active:
            isActive

    };


    try {

        if (
            currentNoteId === null
        ) {

            await createKnowledgeBaseNote(
                data
            );

        } else {

            await updateKnowledgeBaseNote(
                currentNoteId,
                data
            );

        }


        closeNoteModal();


        await loadNotes();

    } catch (error) {

        console.error(
            "Error saving Knowledge Base Note:",
            error
        );

        alert(
            "Error saving Knowledge Base Note."
        );

    }

}


// ============================================================
// DELETE NOTE
// ============================================================

async function deleteNote(
    noteId
) {

    if (
        !confirm(
            "Delete this Knowledge Base Note?"
        )
    ) {

        return;

    }


    try {

        await deleteKnowledgeBaseNote(
            noteId
        );


        await loadNotes();

    } catch (error) {

        console.error(
            "Error deleting Knowledge Base Note:",
            error
        );

        alert(
            "Error deleting Knowledge Base Note."
        );

    }

}


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(
    isActive
) {

    return `

        <span
            class="status-badge ${
                isActive
                    ? "active"
                    : "inactive"
            }"
        >

            ${
                isActive
                    ? "Active"
                    : "Inactive"
            }

        </span>

    `;

}