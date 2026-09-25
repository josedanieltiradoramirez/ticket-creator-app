let noteId = null;

let currentNote = null;


// ============================================================
// DOM CONTENT LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        noteId =
            Number(
                params.get("id")
            );


        if (!noteId) {

            alert(
                "Invalid Knowledge Base Note ID."
            );


            window.location.href =
                "knowledge-base-notes.html";


            return;

        }


        setupNavigation();

        setupEventListeners();


        await loadNoteDetail();

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

    // ========================================================
    // BACK
    // ========================================================

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "knowledge-base-notes.html";

            }
        );


    // ========================================================
    // TOOLS
    // ========================================================

    document
        .getElementById("addToolButton")
        .addEventListener(
            "click",
            openToolModal
        );


    document
        .getElementById("closeToolModalButton")
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById("cancelToolButton")
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById("saveToolButton")
        .addEventListener(
            "click",
            addSelectedTool
        );


    // ========================================================
    // ISSUE TYPES
    // ========================================================

    document
        .getElementById("addIssueTypeButton")
        .addEventListener(
            "click",
            openIssueTypeModal
        );


    document
        .getElementById(
            "closeIssueTypeModalButton"
        )
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById(
            "cancelIssueTypeButton"
        )
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById(
            "saveIssueTypeButton"
        )
        .addEventListener(
            "click",
            addSelectedIssueType
        );

}


// ============================================================
// LOAD NOTE
// ============================================================

async function loadNoteDetail() {

    try {

        currentNote =
            await getKnowledgeBaseNote(
                noteId
            );


        renderBasicInformation(
            currentNote
        );


        await Promise.all([

            loadTools(),

            loadIssueTypes()

        ]);

    } catch (error) {

        console.error(
            "Error loading Knowledge Base Note detail:",
            error
        );


        alert(
            "Error loading Knowledge Base Note details."
        );

    }

}


// ============================================================
// BASIC INFORMATION
// ============================================================

function renderBasicInformation(
    note
) {

    document.getElementById(
        "noteTitle"
    ).textContent =
        note.title || "Knowledge Base Note";


    document.getElementById(
        "noteCategory"
    ).textContent =
        note.category || "";


    document.getElementById(
        "noteId"
    ).textContent =
        note.id;


    document.getElementById(
        "noteTitleValue"
    ).textContent =
        note.title || "-";


    document.getElementById(
        "noteCategoryValue"
    ).textContent =
        note.category || "-";


    document.getElementById(
        "noteStatus"
    ).innerHTML =
        createStatusBadge(
            note.is_active
        );


    document.getElementById(
        "notePinned"
    ).textContent =
        note.is_pinned
            ? "Yes"
            : "No";


    document.getElementById(
        "noteCreatedBy"
    ).textContent =
        note.created_by ?? "-";


    document.getElementById(
        "noteCreatedAt"
    ).textContent =
        formatDate(
            note.created_at
        );


    document.getElementById(
        "noteUpdatedAt"
    ).textContent =
        formatDate(
            note.updated_at
        );


    document.getElementById(
        "noteContent"
    ).textContent =
        note.content || "-";

}


// ============================================================
// TOOLS
// ============================================================

async function loadTools() {

    const tableBody =
        document.getElementById(
            "toolsTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "toolsEmptyMessage"
        );


    try {

        const tools =
            await getKnowledgeBaseNoteTools(
                noteId
            );


        tableBody.innerHTML =
            "";


        if (
            !tools ||
            tools.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        tools.forEach(tool => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        tool.name || "-"
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeTool(${tool.id})"
                    >
                        Remove
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        });

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );


        emptyMessage.style.display =
            "block";

    }

}


// ============================================================
// OPEN TOOL MODAL
// ============================================================

async function openToolModal() {

    const select =
        document.getElementById(
            "toolSelect"
        );


    select.innerHTML = `

        <option value="">
            Select a tool
        </option>

    `;


    try {

        const [
            tools,
            assignedTools
        ] =
            await Promise.all([

                getTools(),

                getKnowledgeBaseNoteTools(
                    noteId
                )

            ]);


        const assignedIds =
            assignedTools.map(
                tool => tool.id
            );


        tools.forEach(tool => {

            if (
                assignedIds.includes(
                    tool.id
                )
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tool.id;


            option.textContent =
                tool.name;


            select.appendChild(
                option
            );

        });


        document
            .getElementById(
                "toolModal"
            )
            .classList
            .remove("hidden");

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );


        alert(
            "Error loading tools."
        );

    }

}


// ============================================================
// ADD TOOL
// ============================================================

async function addSelectedTool() {

    const select =
        document.getElementById(
            "toolSelect"
        );


    const toolId =
        select.value
            ? Number(
                select.value
            )
            : null;


    if (!toolId) {

        alert(
            "Please select a tool."
        );

        return;

    }


    try {

        await addKnowledgeBaseNoteTool(
            noteId,
            toolId
        );


        closeToolModal();


        await loadTools();

    } catch (error) {

        console.error(
            "Error adding tool:",
            error
        );


        alert(
            "Error adding tool."
        );

    }

}


// ============================================================
// REMOVE TOOL
// ============================================================

async function removeTool(
    toolId
) {

    if (
        !confirm(
            "Remove this tool from the Knowledge Base Note?"
        )
    ) {

        return;

    }


    try {

        await removeKnowledgeBaseNoteTool(
            noteId,
            toolId
        );


        await loadTools();

    } catch (error) {

        console.error(
            "Error removing tool:",
            error
        );


        alert(
            "Error removing tool."
        );

    }

}


// ============================================================
// CLOSE TOOL MODAL
// ============================================================

function closeToolModal() {

    document
        .getElementById(
            "toolModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// ISSUE TYPES
// ============================================================

async function loadIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "issueTypesEmptyMessage"
        );


    try {

        const issueTypes =
            await getKnowledgeBaseNoteIssueTypes(
                noteId
            );


        tableBody.innerHTML =
            "";


        if (
            !issueTypes ||
            issueTypes.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        issueTypes.forEach(issueType => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        issueType.name || "-"
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeIssueType(${issueType.id})"
                    >
                        Remove
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        });

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );


        emptyMessage.style.display =
            "block";

    }

}


// ============================================================
// OPEN ISSUE TYPE MODAL
// ============================================================

async function openIssueTypeModal() {

    const select =
        document.getElementById(
            "issueTypeSelect"
        );


    select.innerHTML = `

        <option value="">
            Select an issue type
        </option>

    `;


    try {

        const [
            issueTypes,
            assignedIssueTypes
        ] =
            await Promise.all([

                getIssueTypes(),

                getKnowledgeBaseNoteIssueTypes(
                    noteId
                )

            ]);


        const assignedIds =
            assignedIssueTypes.map(
                issueType =>
                    issueType.id
            );


        issueTypes.forEach(issueType => {

            if (
                assignedIds.includes(
                    issueType.id
                )
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                issueType.id;


            option.textContent =
                issueType.name;


            select.appendChild(
                option
            );

        });


        document
            .getElementById(
                "issueTypeModal"
            )
            .classList
            .remove("hidden");

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );


        alert(
            "Error loading issue types."
        );

    }

}


// ============================================================
// ADD ISSUE TYPE
// ============================================================

async function addSelectedIssueType() {

    const select =
        document.getElementById(
            "issueTypeSelect"
        );


    const issueTypeId =
        select.value
            ? Number(
                select.value
            )
            : null;


    if (!issueTypeId) {

        alert(
            "Please select an issue type."
        );

        return;

    }


    try {

        await addKnowledgeBaseNoteIssueType(
            noteId,
            issueTypeId
        );


        closeIssueTypeModal();


        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error adding issue type:",
            error
        );


        alert(
            "Error adding issue type."
        );

    }

}


// ============================================================
// REMOVE ISSUE TYPE
// ============================================================

async function removeIssueType(
    issueTypeId
) {

    if (
        !confirm(
            "Remove this issue type from the Knowledge Base Note?"
        )
    ) {

        return;

    }


    try {

        await removeKnowledgeBaseNoteIssueType(
            noteId,
            issueTypeId
        );


        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error removing issue type:",
            error
        );


        alert(
            "Error removing issue type."
        );

    }

}


// ============================================================
// CLOSE ISSUE TYPE MODAL
// ============================================================

function closeIssueTypeModal() {

    document
        .getElementById(
            "issueTypeModal"
        )
        .classList
        .add("hidden");

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


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleString();

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}