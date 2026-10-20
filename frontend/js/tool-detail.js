// ============================================================
// TOOL DETAIL
// ============================================================

const params = new URLSearchParams(window.location.search);
const toolId = Number(params.get("id"));

let currentTool = null;

// ============================================================
// KNOWLEDGE BASE NOTES — SPECIAL PRESENTATION
// ============================================================

function normalizeKnowledgeBaseNoteCategory(note) {
    return String(note?.category || "").trim().toLowerCase();
}

function isKnowledgeBaseNoteActive(note) {
    const value = note?.is_active;

    if (value === false || value === 0) return false;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized !== "false" && normalized !== "0";
    }

    return true;
}

function isKnowledgeBaseNotePinned(note) {
    const value = note?.is_pinned;

    return (
        value === true ||
        value === 1 ||
        String(value).trim().toLowerCase() === "true" ||
        String(value).trim() === "1"
    );
}

function renderSpecialKnowledgeBaseNotes(notes) {
    const container = document.getElementById("specialKnowledgeBaseNotes");
    if (!container) return;

    const allNotes = Array.isArray(notes)
        ? notes.filter(isKnowledgeBaseNoteActive)
        : [];

    const alerts = allNotes.filter(
        note => normalizeKnowledgeBaseNoteCategory(note) === "alert"
    );

    const overviews = allNotes.filter(
        note => normalizeKnowledgeBaseNoteCategory(note) === "overview"
    );

    container.innerHTML = "";

    const editIcon = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-2L4 18v2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="m13.5 8.5 2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
    `;

    const renderEditButton = noteId => `
        <button
            type="button"
            class="kb-special-note-edit"
            data-note-id="${noteId}"
            aria-label="Edit knowledge base note"
            title="Edit note"
        >
            ${editIcon}
        </button>
    `;

    if (alerts.length) {
        const section = document.createElement("section");
        section.className = "kb-special-section kb-alert-section";
        section.innerHTML = `
            <div class="kb-special-section-header">
                <div class="kb-special-section-heading">
                    <span class="kb-special-section-icon" aria-hidden="true">⚠</span>
                    <h2>Alerts</h2>
                </div>
                <span class="kb-special-section-count">${alerts.length}</span>
            </div>

            <div class="kb-special-list">
                ${alerts.map(note => `
                    <article
                        class="kb-special-note kb-alert-note"
                        data-note-id="${note.id}"
                    >
                        <div class="kb-special-note-main">
                            <div class="kb-special-note-title">
                                ${escapeToolHtml(note.title || "Alert")}
                            </div>
                            <div class="kb-special-note-content">
                                ${escapeToolHtml(note.content || "")}
                            </div>
                        </div>
                        ${renderEditButton(note.id)}
                    </article>
                `).join("")}
            </div>
        `;
        container.appendChild(section);
    }

    if (overviews.length) {
        const section = document.createElement("section");
        section.className = "kb-special-section kb-overview-section";
        section.innerHTML = `
            <div class="kb-special-section-header">
                <div class="kb-special-section-heading">
                    <h2>Overview</h2>
                </div>
                <span class="kb-special-section-count">${overviews.length}</span>
            </div>

            <div class="kb-overview-list">
                ${overviews.map(note => `
                    <article
                        class="kb-special-note kb-overview-note"
                        data-note-id="${note.id}"
                    >
                        <div class="kb-special-note-main">
                            ${note.title ? `<div class="kb-special-note-title">${escapeToolHtml(note.title)}</div>` : ""}
                            <div class="kb-special-note-content">
                                ${escapeToolHtml(note.content || "")}
                            </div>
                        </div>
                        ${renderEditButton(note.id)}
                    </article>
                `).join("")}
            </div>
        `;
        container.appendChild(section);
    }

    container
        .querySelectorAll(".kb-special-note-edit")
        .forEach(button => {
            button.addEventListener("click", () => {
                const noteId = Number(button.dataset.noteId);
                const note = allNotes.find(
                    item => Number(item.id) === noteId
                );

                if (!note) return;

                openRelationshipItemModal({
                    mode: "edit",
                    relationship: "knowledgeBaseNote",
                    item: note
                });
            });
        });
}

function renderKnowledgeBaseNoteItem(item, items) {
    const index = items.indexOf(item);
    const previousIsPinned =
        index > 0
            ? isKnowledgeBaseNotePinned(items[index - 1])
            : false;
    const isPinned = isKnowledgeBaseNotePinned(item);

    let subsectionHeader = "";
    if (isPinned && !previousIsPinned) {
        subsectionHeader = `
            <div class="kb-notes-subsection-heading kb-notes-pinned-heading">
                <span class="kb-notes-subsection-icon" aria-hidden="true">📌</span>
                <span>Pinned</span>
            </div>
        `;
    } else if (!isPinned && previousIsPinned) {
        subsectionHeader = `
            <div class="kb-notes-subsection-heading kb-notes-normal-heading">
                <span>Notes</span>
            </div>
        `;
    }

    return `
        ${subsectionHeader}
        <div class="kb-note-item ${isPinned ? "kb-note-item-pinned" : ""}">
            ${isPinned ? `<div class="kb-note-pin" aria-hidden="true">📌</div>` : ""}
            <div class="kb-note-item-content">
                <div class="kb-note-item-title">${escapeRelationshipHtml(item.title || `Note ${item.id}`)}</div>
                <div class="kb-note-item-body">${escapeRelationshipHtml(item.content || "")}</div>
            </div>
        </div>
    `;
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", initializeToolDetail);

async function initializeToolDetail() {
    if (!toolId) {
        showErrorMessage("Invalid Tool ID.");
        window.location.href = "tools.html";
        return;
    }

    setupNavigation();
    await loadToolDetail();
}

// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {
    const navigation = {
        ticketsButton: "index.html",
        toolsButton: "tools.html",
        locationsButton: "locations.html",
        queuesButton: "queues.html",
        wmsButton: "warehouse-management-systems.html",
        formsButton: "forms.html",
        troubleshootingTemplatesButton:
            "troubleshooting-templates.html",
        knowledgeBaseButton: "knowledge-base.html"
    };

    Object.entries(navigation).forEach(([id, url]) => {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", () => {
                window.location.href = url;
            });
        }
    });
}

// ============================================================
// LOAD TOOL
// ============================================================

async function loadToolDetail() {
    try {
        currentTool = await getTool(toolId);

        renderToolHeader();
        renderToolBasicInformation();
        await loadRelationships();
    } catch (error) {
        console.error("Error loading Tool detail:", error);
        showErrorMessage("Failed to load Tool.");
    }
}

// ============================================================
// DETAIL HEADER
// ============================================================

function renderToolHeader() {
    renderDetailHeader({
        containerId: "detailHeader",
        type: "Tool",
        title: currentTool.name,
        description: currentTool.description,
        onBack: () => {
            window.location.href = "tools.html";
        }
    });
}

// ============================================================
// BASIC INFORMATION
// ============================================================

function renderToolBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",
        data: currentTool,
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
                type: "textarea"
            },
            {
                key: "access_request",
                label: "Access Request",
                type: "textarea"
            },
            {
                key: "password_reset",
                label: "Password Reset",
                type: "textarea"
            },
            {
                key: "is_active",
                label: "Status",
                type: "boolean"
            }
        ],
        expanded: false,
        onSave: async (updatedData) => {
            const data = {
                name: updatedData.name,
                description: updatedData.description,
                access_request:
                    updatedData.access_request,
                password_reset:
                    updatedData.password_reset,
                is_active: updatedData.is_active
            };

            currentTool = await updateTool(
                toolId,
                data
            );

            renderToolHeader();

            showSuccessMessage(
                "Tool updated successfully."
            );
        }
    });
}

// ============================================================
// RELATIONSHIPS
// ============================================================

async function loadRelationships() {
    try {
        const [
            issueTypes,
            queues,
            knowledgeBase,
            troubleshootingTemplates,
            knowledgeBaseNotes
        ] = await Promise.all([
            getToolIssueTypeDetails(toolId),
            getToolQueues(toolId),
            getToolKnowledgeBase(toolId),
            getToolTroubleshootingTemplates(toolId),
            getToolKnowledgeBaseNotes(toolId)
        ]);

        renderSpecialKnowledgeBaseNotes(knowledgeBaseNotes);

        const regularKnowledgeBaseNotes =
            (knowledgeBaseNotes || [])
                .filter(note => {
                    if (!isKnowledgeBaseNoteActive(note)) {
                        return false;
                    }

                    const category = normalizeKnowledgeBaseNoteCategory(note);
                    return category !== "alert" && category !== "overview";
                })
                .sort((a, b) => {
                    const aPinned = isKnowledgeBaseNotePinned(a);
                    const bPinned = isKnowledgeBaseNotePinned(b);
                    if (aPinned !== bPinned) return aPinned ? -1 : 1;
                    return 0;
                });

        renderRelationships({
            containerId: "relationships",
            relationships: [
                // ========================================================
                // ISSUE TYPES
                // ========================================================
                {
                    title: "Issue Types",
                    expanded: true,
                    entityLabel: "Issue Type",
                    addLabel: "Add Issue Type",
                    items: issueTypes || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    renderItem: item => {
                        const description =
                            escapeRelationshipHtml(
                                item.description || "No description available."
                            );

                        const issueType =
                            escapeRelationshipHtml(
                                item.issue_type || "-"
                            );

                        const routingQueues =
                            item.routing_queue?.length
                                ? item.routing_queue
                                    .map(
                                        queue =>
                                            `<span class="tool-issue-type-queue-chip">
                                                ${escapeRelationshipHtml(queue)}
                                            </span>`
                                    )
                                    .join("")
                                : `
                                    <span class="tool-issue-type-empty">
                                        No routing queue
                                    </span>
                                `;

                        return `
                            <div class="tool-issue-type-card">

                                <div class="tool-issue-type-field tool-issue-type-description-field">
                                    <div class="tool-issue-type-label">
                                        Description
                                    </div>

                                    <div class="tool-issue-type-description-text">
                                        ${description}
                                    </div>
                                </div>

                                <div class="tool-issue-type-field">
                                    <div class="tool-issue-type-label">
                                        Issue Type
                                    </div>

                                    <div class="tool-issue-type-value">
                                        ${issueType}
                                    </div>
                                </div>

                                <div class="tool-issue-type-field">
                                    <div class="tool-issue-type-label">
                                        Routing Queue
                                    </div>

                                    <div class="tool-issue-type-queues">
                                        ${routingQueues}
                                    </div>
                                </div>

                            </div>
                        `;
                    },
                    onAdd: openIssueTypeModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "issueType"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `issue-type-detail.html?id=${item.issue_type_id}`;
                    },
                    onEdit: item => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "issueType",
                            item
                        });
                    },
                    onRemove: item => {
                        openRemoveRelationshipModal({
                            relationship: "issueType",
                            item
                        });
                    }
                },

                // ========================================================
                // QUEUES
                // ========================================================
                {
                    title: "Routing Queues",
                    expanded: false,
                    entityLabel: "Queue",
                    addLabel: "Add Queue",
                    items: queues || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: item =>
                        item.name || "-",
                    onAdd: openQueueModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "queue"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `queue-detail.html?id=${item.id}`;
                    },
                    onEdit: item => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "queue",
                            item
                        });
                    },
                    onRemove: item => {
                        openRemoveRelationshipModal({
                            relationship: "queue",
                            item
                        });
                    }
                },

                // ========================================================
                // KNOWLEDGE BASE
                // ========================================================
                {
                    title: "KB Articles related to this Tool",
                    expanded: false,
                    entityLabel: "Knowledge Base",
                    addLabel: "Add Knowledge Base",
                    items: knowledgeBase || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: item =>
                        item.title ||
                        item.article_number ||
                        "-",
                    onAdd: openKnowledgeBaseModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "knowledgeBase"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `knowledge-base-detail.html?id=${item.id}`;
                    },
                    onEdit: item => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "knowledgeBase",
                            item
                        });
                    },
                    onRemove: item => {
                        openRemoveRelationshipModal({
                            relationship: "knowledgeBase",
                            item
                        });
                    }
                },

                // ========================================================
                // TROUBLESHOOTING TEMPLATES
                // ========================================================
                {
                    title: "Troubleshooting Steps for this Tool",
                    expanded: false,
                    entityLabel:
                        "Troubleshooting Template",
                    addLabel:
                        "Add Troubleshooting Template",
                    items:
                        troubleshootingTemplates || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: item =>
                        item.name ||
                        `Template ${item.id}`,
                    onAdd:
                        openTroubleshootingTemplateModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "troubleshootingTemplate"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `troubleshooting-template-detail.html?id=${item.id}`;
                    },
                    onEdit: item => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "troubleshootingTemplate",
                            item
                        });
                    },
                    onRemove: item => {
                        openRemoveRelationshipModal({
                            relationship:
                                "troubleshootingTemplate",
                            item
                        });
                    }
                },

                // ========================================================
                // KNOWLEDGE BASE NOTES
                // ========================================================
                {
                    title: "Notes",
                    expanded: false,
                    entityLabel: "Knowledge Base Note",
                    addLabel: "Add Knowledge Base Note",
                    items: regularKnowledgeBaseNotes,
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: item =>
                        item.title || `Note ${item.id}`,
                    renderItem: item =>
                        renderKnowledgeBaseNoteItem(
                            item,
                            regularKnowledgeBaseNotes
                        ),
                    onAdd: openKnowledgeBaseNoteModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "knowledgeBaseNote"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `knowledge-base-note-detail.html?id=${item.id}`;
                    },
                    onEdit: item => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "knowledgeBaseNote",
                            item
                        });
                    },
                    onRemove: item => {
                        openRemoveRelationshipModal({
                            relationship:
                                "knowledgeBaseNote",
                            item
                        });
                    }
                }
            ]
        });
    } catch (error) {
        console.error(
            "Error loading Tool relationships:",
            error
        );

        showErrorMessage(
            "Failed to load Tool relationships."
        );
    }
}

// ============================================================
// RELATIONSHIP ITEM MODAL
// ============================================================

async function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {
    const configs = {
        issueType: {
            label: "Issue Type",

            fields: [
                {
                    key: "name",
                    label: "Name",
                    type: "text",
                    required: true
                },
                {
                    key: "description",
                    label: "Description",
                    type: "textarea"
                },
                {
                    key: "form_template_id",
                    label: "Form Template ID",
                    type: "text"
                },
                {
                    key: "category",
                    label: "Category",
                    type: "select",
                    options: [
                        { value: "Alert", label: "Alert" },
                        { value: "Overview", label: "Overview" },
                        { value: "Note", label: "Note" }
                    ]
                },
                {
                    key: "display_name",
                    label: "Display Name",
                    type: "text"
                },
                {
                    key: "search_keywords",
                    label: "Search Keywords",
                    type: "text"
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ],

            create: createIssueType,
            update: updateIssueType,
            updateTool: updateToolIssueType,
            add: addToolIssueType
        },

        queue: {
            label: "Queue",

            fields: [
                {
                    key: "name",
                    label: "Queue Name",
                    type: "text",
                    required: true
                },
                {
                    key: "description",
                    label: "Description",
                    type: "textarea"
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ],

            create: createQueue,
            update: updateQueue,
            add: addToolQueue
        },

        knowledgeBase: {
            label: "Knowledge Base",

            fields: [
                {
                    key: "article_number",
                    label: "Article Number",
                    type: "text",
                    required: true
                },
                {
                    key: "title",
                    label: "Title",
                    type: "text",
                    required: true
                },
                {
                    key: "url",
                    label: "URL",
                    type: "text",
                    required: true
                },
                {
                    key: "description",
                    label: "Description",
                    type: "textarea",
                    required: true
                }
            ],

            create: createKnowledgeBaseItem,
            update: updateKnowledgeBaseItem,
            add: addToolKnowledgeBase
        },

        troubleshootingTemplate: {
            label: "Troubleshooting Template",

            fields: [
                {
                    key: "name",
                    label: "Name",
                    type: "text",
                    required: true
                },
                {
                    key: "generated_description",
                    label: "Description",
                    type: "textarea",
                    required: true
                },
                {
                    key: "steps",
                    label: "Troubleshooting Steps",
                    type: "textarea",
                    required: true
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ],

            create: createTroubleshootingTemplate,
            update: updateTroubleshootingTemplate,
            add: addToolTroubleshootingTemplate
        },

        knowledgeBaseNote: {
            label: "Knowledge Base Note",

            fields: [
                {
                    key: "title",
                    label: "Title",
                    type: "text",
                    required: true
                },
                {
                    key: "content",
                    label: "Content",
                    type: "textarea",
                    required: true
                },
                {
                    key: "category",
                    label: "Category",
                    type: "select",
                    options: [
                        { value: "Alert", label: "Alert" },
                        { value: "Overview", label: "Overview" },
                        { value: "Note", label: "Note" }
                    ]
                },
                {
                    key: "is_pinned",
                    label: "Pinned",
                    type: "boolean"
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ],

            create: createKnowledgeBaseNote,
            update: updateKnowledgeBaseNote,
            add: addToolKnowledgeBaseNote
        }
    };

    const config = configs[relationship];

    
    if (!config) {
        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );
        return;
    }

    let allIssueTypes = [];

    if (
        relationship === "issueType" &&
        mode === "edit"
    ) {
        allIssueTypes = await getIssueTypes();
    }

    // ========================================================
    // SPECIAL ISSUE TYPE EDIT DATA
    // ========================================================

    let allQueues = [];
    let selectedQueueIds = new Set();

    if (
        relationship === "issueType" &&
        mode === "edit"
    ) {
        try {
            allQueues = await getQueues();

            const selectedQueueNames =
                Array.isArray(item?.routing_queue)
                    ? item.routing_queue
                    : [];

            selectedQueueIds = new Set(
                allQueues
                    .filter(queue =>
                        selectedQueueNames.includes(
                            queue.name
                        )
                    )
                    .map(queue => Number(queue.id))
            );
        } catch (error) {
            console.error(
                "Error loading routing queues:",
                error
            );

            showErrorMessage(
                "Failed to load routing queues."
            );
            return;
        }
    }

    // ========================================================
    // FIELDS
    // ========================================================

    const editFields =
        relationship === "issueType" && mode === "edit"
            ? [
                {
                    key: "description",
                    label: "Description",
                    type: "textarea"
                },
                {
                    key: "issue_type_id",
                    label: "Issue Type",
                    type: "issue-type-select",
                    required: true
                },
                {
                    key: "routing_queue",
                    label: "Routing Queue",
                    type: "queue-select"
                }
            ]
            : config.fields;

    const modalTitle =
        mode === "edit"
            ? `Edit ${config.label}`
            : `Create ${config.label}`;

    let fieldsHtml = "";

    editFields.forEach(field => {

        const value = item?.[field.key];

        // ====================================================
        // ISSUE TYPE DROPDOWN
        // ====================================================

        if (field.type === "issue-type-select") {

            const selectedIssueTypeId =
                Number(item?.issue_type_id);

            fieldsHtml += `
                <div class="form-group">

                    <label
                        for="relationshipItem_issue_type_id"
                    >
                        ${escapeToolHtml(field.label)}
                    </label>

                    <select
                        id="relationshipItem_issue_type_id"
                        required
                    >

                        <option value="">
                            Select an Issue Type...
                        </option>

                        ${
                            allIssueTypes
                                .map(issueType => `
                                    <option
                                        value="${issueType.id}"
                                        ${
                                            Number(issueType.id) ===
                                            selectedIssueTypeId
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeToolHtml(
                                            issueType.name
                                        )}
                                    </option>
                                `)
                                .join("")
                        }

                    </select>

                </div>
            `;

            return;
        }

        // ====================================================
        // SELECT
        // ====================================================

        if (field.type === "select") {

            const selectedValue = value ?? "Note";

            fieldsHtml += `
                <div class="form-group">
                    <label
                        for="relationshipItem_${field.key}"
                    >
                        ${escapeToolHtml(field.label)}
                    </label>

                    <select
                        id="relationshipItem_${field.key}"
                    >
                        ${(field.options || []).map(option => `
                            <option
                                value="${escapeToolHtml(option.value)}"
                                ${String(selectedValue).toLowerCase() === String(option.value).toLowerCase() ? "selected" : ""}
                            >
                                ${escapeToolHtml(option.label)}
                            </option>
                        `).join("")}
                    </select>
                </div>
            `;

            return;
        }

        // ====================================================
        // BOOLEAN
        // ====================================================

        if (field.type === "boolean") {

            const checked = value ?? true;

            fieldsHtml += `
                <div class="checkbox-group">

                    <input
                        type="checkbox"
                        id="relationshipItem_${field.key}"
                        ${checked ? "checked" : ""}
                    >

                    <label
                        for="relationshipItem_${field.key}"
                    >
                        ${escapeToolHtml(field.label)}
                    </label>

                </div>
            `;

            return;
        }

        // ====================================================
        // ROUTING QUEUE DROPDOWN
        // ====================================================

        if (field.type === "queue-select") {

            fieldsHtml += `
                <div class="form-group">

                    <label>
                        ${escapeToolHtml(field.label)}
                    </label>

                    <div
                        class="tool-queue-dropdown"
                        id="toolQueueDropdown"
                    >

                        <button
                            type="button"
                            class="tool-queue-dropdown-button"
                            id="toolQueueDropdownButton"
                        >
                            <span>
                                Select a routing queue...
                            </span>

                            <span
                                class="tool-queue-dropdown-arrow"
                            >
                                ▼
                            </span>
                        </button>

                        <div
                            class="tool-queue-dropdown-menu"
                            id="toolQueueDropdownMenu"
                        >
                            ${
                                allQueues
                                    .map(queue => `
                                        <button
                                            type="button"
                                            class="tool-queue-option"
                                            data-id="${queue.id}"
                                        >
                                            <span>
                                                ${escapeToolHtml(
                                                    queue.name
                                                )}
                                            </span>
                                        </button>
                                    `)
                                    .join("")
                            }
                        </div>

                    </div>

                    <div
                        id="toolQueueSelected"
                        class="tool-queue-selected"
                    ></div>

                </div>
            `;

            return;
        }

        const safeValue =
            escapeToolHtml(value ?? "");

        // ====================================================
        // READONLY
        // ====================================================

        if (field.readonly) {

            fieldsHtml += `
                <div class="form-group">

                    <label
                        for="relationshipItem_${field.key}"
                    >
                        ${escapeToolHtml(field.label)}
                    </label>

                    <input
                        type="text"
                        id="relationshipItem_${field.key}"
                        value="${safeValue}"
                        readonly
                    >

                </div>
            `;

            return;
        }

        // ====================================================
        // TEXTAREA
        // ====================================================

        if (field.type === "textarea") {

            fieldsHtml += `
                <div class="form-group">

                    <label
                        for="relationshipItem_${field.key}"
                    >
                        ${escapeToolHtml(field.label)}
                    </label>

                    <textarea
                        id="relationshipItem_${field.key}"
                        rows="4"
                        ${field.required ? "required" : ""}
                    >${safeValue}</textarea>

                </div>
            `;

            return;
        }

        // ====================================================
        // TEXT INPUT
        // ====================================================

        fieldsHtml += `
            <div class="form-group">

                <label
                    for="relationshipItem_${field.key}"
                >
                    ${escapeToolHtml(field.label)}
                </label>

                <input
                    type="text"
                    id="relationshipItem_${field.key}"
                    value="${safeValue}"
                    ${field.required ? "required" : ""}
                >

            </div>
        `;
    });

    // ========================================================
    // MODAL CONTENT
    // ========================================================

    const content = `
        ${fieldsHtml}

        <div class="modal-actions">

            <button
                type="button"
                id="relationshipItemCancelButton"
            >
                Cancel
            </button>

            <button
                type="button"
                id="relationshipItemSaveButton"
            >
                Save
            </button>

        </div>
    `;

    // ========================================================
    // RENDER MODAL
    // ========================================================

    renderModal({
        containerId: "relationshipModal",
        title: modalTitle,
        content,
        onClose: closeRelationshipModal
    });

    showRelationshipModal();

    // ========================================================
    // ROUTING QUEUE EVENTS
    // ========================================================

    if (
        relationship === "issueType" &&
        mode === "edit"
    ) {

        const dropdown =
            document.getElementById(
                "toolQueueDropdown"
            );

        const dropdownButton =
            document.getElementById(
                "toolQueueDropdownButton"
            );

        const dropdownMenu =
            document.getElementById(
                "toolQueueDropdownMenu"
            );

        const selectedContainer =
            document.getElementById(
                "toolQueueSelected"
            );

        if (
            dropdown &&
            dropdownButton &&
            dropdownMenu &&
            selectedContainer
        ) {

            function renderSelectedQueues() {

                selectedContainer.innerHTML =
                    Array.from(selectedQueueIds)
                        .map(queueId => {

                            const queue =
                                allQueues.find(
                                    queue =>
                                        Number(queue.id) ===
                                        Number(queueId)
                                );

                            if (!queue) {
                                return "";
                            }

                            return `
                                <span
                                    class="tool-queue-chip"
                                    data-id="${queue.id}"
                                >

                                    <span>
                                        ${escapeToolHtml(
                                            queue.name
                                        )}
                                    </span>

                                    <button
                                        type="button"
                                        class="tool-queue-chip-remove"
                                        data-id="${queue.id}"
                                        aria-label="Remove ${escapeToolHtml(
                                            queue.name
                                        )}"
                                    >
                                        ×
                                    </button>

                                </span>
                            `;
                        })
                        .join("");

                selectedContainer
                    .querySelectorAll(
                        ".tool-queue-chip-remove"
                    )
                    .forEach(button => {

                        button.addEventListener(
                            "click",
                            event => {

                                event.stopPropagation();

                                const queueId =
                                    Number(
                                        button.dataset.id
                                    );

                                selectedQueueIds.delete(
                                    queueId
                                );

                                renderSelectedQueues();
                                renderQueueOptions();
                            }
                        );
                    });
            }

            function renderQueueOptions() {

                dropdownMenu.innerHTML =
                    allQueues
                        .map(queue => {

                            const selected =
                                selectedQueueIds.has(
                                    Number(queue.id)
                                );

                            return `
                                <button
                                    type="button"
                                    class="tool-queue-option ${
                                        selected
                                            ? "selected"
                                            : ""
                                    }"
                                    data-id="${queue.id}"
                                >
                                    <span>
                                        ${escapeToolHtml(
                                            queue.name
                                        )}
                                    </span>

                                    ${
                                        selected
                                            ? `
                                                <span>
                                                    ✓
                                                </span>
                                            `
                                            : ""
                                    }
                                </button>
                            `;
                        })
                        .join("");

                dropdownMenu
                    .querySelectorAll(
                        ".tool-queue-option"
                    )
                    .forEach(option => {

                        option.addEventListener(
                            "click",
                            event => {

                                event.stopPropagation();

                                const queueId =
                                    Number(
                                        option.dataset.id
                                    );

                                if (
                                    selectedQueueIds.has(
                                        queueId
                                    )
                                ) {
                                    selectedQueueIds.delete(
                                        queueId
                                    );
                                } else {
                                    selectedQueueIds.add(
                                        queueId
                                    );
                                }

                                renderSelectedQueues();
                                renderQueueOptions();
                            }
                        );
                    });
            }

            dropdownButton.addEventListener(
                "click",
                event => {
                    event.stopPropagation();

                    dropdown.classList.toggle(
                        "open"
                    );
                }
            );

            document.addEventListener(
                "click",
                event => {
                    if (
                        !dropdown.contains(
                            event.target
                        )
                    ) {
                        dropdown.classList.remove(
                            "open"
                        );
                    }
                }
            );

            renderSelectedQueues();
            renderQueueOptions();
        }
    }

    // ========================================================
    // CANCEL
    // ========================================================

    document
        .getElementById(
            "relationshipItemCancelButton"
        )
        .addEventListener(
            "click",
            closeRelationshipModal
        );

    // ========================================================
    // SAVE
    // ========================================================

    document
        .getElementById(
            "relationshipItemSaveButton"
        )
        .addEventListener(
            "click",
            async () => {

                await saveRelationshipItem({
                    mode,
                    relationship,
                    item
                });

            }
        );
}


// ============================================================
// SAVE RELATIONSHIP ITEM
// ============================================================

async function saveRelationshipItem({
    mode,
    relationship,
    item
}) {
    const configs = {
        issueType: {
            label: "Issue Type",
            create: createIssueType,
            update: updateIssueType,
            updateTool: updateToolIssueType,
            updateDetails: updateToolIssueTypeDetails,
            add: addToolIssueType
        },

        queue: {
            label: "Queue",
            create: createQueue,
            update: updateQueue,
            add: addToolQueue
        },

        knowledgeBase: {
            label: "Knowledge Base",
            create: createKnowledgeBaseItem,
            update: updateKnowledgeBaseItem,
            add: addToolKnowledgeBase
        },

        troubleshootingTemplate: {
            label: "Troubleshooting Template",
            create: createTroubleshootingTemplate,
            update: updateTroubleshootingTemplate,
            add: addToolTroubleshootingTemplate
        },

        knowledgeBaseNote: {
            label: "Knowledge Base Note",
            create: createKnowledgeBaseNote,
            update: updateKnowledgeBaseNote,
            add: addToolKnowledgeBaseNote
        }
    };

    const config = configs[relationship];

    if (!config) {
        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );
        return;
    }

    // ========================================================
    // BUILD DATA
    // ========================================================

    let data = {};

    if (
        relationship === "issueType" &&
        mode === "edit"
    ) {

        const descriptionInput =
            document.getElementById(
                "relationshipItem_description"
            );

        const issueTypeInput =
            document.getElementById(
                "relationshipItem_issue_type_id"
            );

        if (!descriptionInput) {
            showErrorMessage(
                "Description field not found."
            );
            return;
        }

        if (!issueTypeInput) {
            showErrorMessage(
                "Issue Type field not found."
            );
            return;
        }

        const issueTypeId =
            Number(issueTypeInput.value);

        if (!Number.isInteger(issueTypeId)) {
            showErrorMessage(
                "Please select an Issue Type."
            );
            return;
        }

        const routingQueueIds =
            Array.from(
                document.querySelectorAll(
                    "#toolQueueSelected .tool-queue-chip"
                )
            )
                .map(chip =>
                    Number(chip.dataset.id)
                )
                .filter(id =>
                    Number.isInteger(id)
                );

        data = {
            description:
                descriptionInput.value.trim(),

            issue_type_id:
                issueTypeId,

            routing_queue_ids:
                routingQueueIds
        };
    }

    // ========================================================
    // OTHER RELATIONSHIPS
    // ========================================================

    else {

        const fieldIds = [
            "relationshipItem_name",
            "relationshipItem_description",
            "relationshipItem_form_template_id",
            "relationshipItem_category",
            "relationshipItem_display_name",
            "relationshipItem_search_keywords",
            "relationshipItem_is_active",
            "relationshipItem_title",
            "relationshipItem_article_number",
            "relationshipItem_url",
            "relationshipItem_generated_description",
            "relationshipItem_steps",
            "relationshipItem_content",
            "relationshipItem_is_pinned"
        ];

        fieldIds.forEach(id => {

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            const key =
                id.replace(
                    "relationshipItem_",
                    ""
                );

            if (
                element.type === "checkbox"
            ) {
                data[key] =
                    element.checked;
            } else {
                data[key] =
                    element.value.trim();
            }
        });
    }

    // ========================================================
    // VALIDATION
    // ========================================================

    const requiredFields = {
        issueType: ["name"],
        queue: ["name"],
        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ],
        troubleshootingTemplate: [
            "name",
            "generated_description",
            "steps"
        ],
        knowledgeBaseNote: [
            "title",
            "content"
        ]
    };

    // Issue Type relationship edit has no required
    // relationship fields. Description may be empty.
    if (
        !(relationship === "issueType" &&
            mode === "edit")
    ) {
        for (
            const field of
                requiredFields[relationship]
        ) {
            if (!data[field]) {
                showWarningMessage(
                    `${getRelationshipFieldLabel(field)} is required.`
                );

                const input =
                    document.getElementById(
                        `relationshipItem_${field}`
                    );

                if (input) {
                    input.focus();
                }

                return;
            }
        }
    }

    // ========================================================
    // EDIT
    // ========================================================

    if (mode === "edit") {

        // ----------------------------------------------------
        // TOOL ↔ ISSUE TYPE
        // ----------------------------------------------------

        if (
            relationship === "issueType"
        ) {

            if (!item?.issue_type_id) {
                showErrorMessage(
                    "Issue Type ID is missing."
                );
                return;
            }

            try {

                await config.updateDetails(
                    toolId,
                    item.issue_type_id,
                    data
                );

                closeRelationshipModal();

                await loadRelationships();

                showSuccessMessage(
                    "Issue Type relationship updated successfully."
                );

            } catch (error) {

                console.error(
                    "Error updating Issue Type relationship:",
                    error
                );

                showErrorMessage(
                    error.message ||
                    "Error updating Issue Type relationship."
                );
            }

            return;
        }

        // ----------------------------------------------------
        // OTHER RELATIONSHIPS
        // ----------------------------------------------------

        if (!item?.id) {
            showErrorMessage(
                `${config.label} ID is missing.`
            );
            return;
        }

        try {

            await config.update(
                item.id,
                data
            );

            closeRelationshipModal();

            await loadRelationships();

            showSuccessMessage(
                `${config.label} updated successfully.`
            );

        } catch (error) {

            console.error(
                `Error saving ${relationship}:`,
                error
            );

            showErrorMessage(
                error.message ||
                `Error updating ${config.label.toLowerCase()}.`
            );
        }

        return;
    }

    // ========================================================
    // CREATE
    // ========================================================

    if (mode === "create") {

        try {

            const createdItem =
                await config.create(data);

            if (!createdItem?.id) {
                throw new Error(
                    `Created ${config.label} did not return an ID.`
                );
            }

            await config.add(
                toolId,
                createdItem.id
            );

            closeRelationshipModal();

            await loadRelationships();

            showSuccessMessage(
                `${config.label} created and added successfully.`
            );

        } catch (error) {

            console.error(
                `Error creating ${config.label}:`,
                error
            );

            showErrorMessage(
                error.message ||
                `Error creating ${config.label.toLowerCase()}.`
            );
        }

        return;
    }
}

function getRelationshipFieldLabel(field) {
    const labels = {
        name: "Name",
        description: "Description",
        form_template_id: "Form Template ID",
        category: "Category",
        display_name: "Display Name",
        search_keywords: "Search Keywords",
        access_request: "Access Request",
        password_reset: "Password Reset",
        generated_description: "Description",
        steps: "Troubleshooting Steps",
        article_number: "Article Number",
        title: "Title",
        url: "URL",
        content: "Content"
    };

    return labels[field] || field;
}

// ============================================================
// ADD RELATIONSHIP
// ============================================================

async function openIssueTypeModal() {
    const [
        allIssueTypes,
        relatedIssueTypes
    ] = await Promise.all([
        getIssueTypes(),
        getToolIssueTypes(toolId)
    ]);

    const relatedIds =
        new Set(
            relatedIssueTypes.map(
                item => item.id
            )
        );

    const availableIssueTypes =
        allIssueTypes.filter(
            item => !relatedIds.has(item.id)
        );

    await openAddRelationshipSelectModal({
        title: "Add Issue Type",
        label: "Issue Type",

        getAll: async () =>
            availableIssueTypes,

        getRelated: async () =>
            relatedIssueTypes,

        onAdd: id =>
            addToolIssueType(
                toolId,
                id
            ),

        getName: item =>
            item.name || "-"
    });
}

async function openQueueModal() {
    await openAddRelationshipSelectModal({
        title: "Add Queue",
        label: "Queue",
        getAll: getQueues,
        getRelated: () => getToolQueues(toolId),
        onAdd: id => addToolQueue(toolId, id),
        getName: item => item.name || "-"
    });
}

async function openKnowledgeBaseModal() {
    await openAddRelationshipSelectModal({
        title: "Add Knowledge Base",
        label: "Knowledge Base Article",
        getAll: getKnowledgeBaseItems,
        getRelated: () => getToolKnowledgeBase(toolId),
        onAdd: id => addToolKnowledgeBase(toolId, id),
        getName: item =>
            item.article_number
                ? `${item.article_number} - ${item.title || ""}`
                : item.title || "-"
    });
}

async function openTroubleshootingTemplateModal() {
    await openAddRelationshipSelectModal({
        title: "Add Troubleshooting Template",
        label: "Troubleshooting Template",
        getAll: getTroubleshootingTemplates,
        getRelated: () => getToolTroubleshootingTemplates(toolId),
        onAdd: id =>
            addToolTroubleshootingTemplate(toolId, id),
        getName: item =>
            item.name || `Template ${item.id}`
    });
}

async function openKnowledgeBaseNoteModal() {
    await openAddRelationshipSelectModal({
        title: "Add Knowledge Base Note",
        label: "Knowledge Base Note",
        getAll: getKnowledgeBaseNotes,
        getRelated: () => getToolKnowledgeBaseNotes(toolId),
        onAdd: id => addToolKnowledgeBaseNote(toolId, id),
        getName: item =>
            item.category
                ? `${item.title || ""} - ${item.category}`
                : item.title || `Note ${item.id}`
    });
}

function openAddRelationshipSelectModal({
    title,
    label,
    getAll,
    getRelated,
    onAdd,
    getName
}) {
    return Promise.all([getAll(), getRelated()])
        .then(([allItems, relatedItems]) => {
            const relatedIds = new Set(
                (relatedItems || []).map(item => Number(item.id))
            );

            const options = (allItems || [])
                .filter(item => !relatedIds.has(Number(item.id)))
                .map(item => `
                    <option value="${item.id}">
                        ${escapeToolHtml(getName(item))}
                    </option>
                `)
                .join("");

            const content = `
                <div class="form-group">
                    <label for="toolRelationshipSelect">
                        ${escapeToolHtml(label)}
                    </label>
                    <select
                        id="toolRelationshipSelect"
                        required
                    >
                        <option value="">
                            Select ${escapeToolHtml(label)}
                        </option>
                        ${options}
                    </select>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        id="toolRelationshipCancelButton"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        id="toolRelationshipSaveButton"
                    >
                        Add
                    </button>
                </div>
            `;

            renderModal({
                containerId: "relationshipModal",
                title,
                content,
                onClose: closeRelationshipModal
            });

            showRelationshipModal();

            document
                .getElementById("toolRelationshipCancelButton")
                .addEventListener(
                    "click",
                    closeRelationshipModal
                );

            document
                .getElementById("toolRelationshipSaveButton")
                .addEventListener("click", async () => {
                    const id = Number(
                        document.getElementById(
                            "toolRelationshipSelect"
                        ).value
                    );

                    if (!id) {
                        showWarningMessage(
                            `Please select ${label}.`
                        );
                        return;
                    }

                    try {
                        await onAdd(id);
                        closeRelationshipModal();
                        await loadRelationships();
                        showSuccessMessage(
                            `${label} added successfully.`
                        );
                    } catch (error) {
                        console.error(error);
                        showErrorMessage(
                            `Error adding ${label}.`
                        );
                    }
                });
        })
        .catch(error => {
            console.error(error);
            showErrorMessage(
                `Error loading ${label}.`
            );
        });
}

// ============================================================
// REMOVE RELATIONSHIP
// ============================================================

function openRemoveRelationshipModal({
    relationship,
    item
}) {
    const labels = {
        issueType: "Issue Type",
        queue: "Support Queue",
        knowledgeBase: "Knowledge Base",
        troubleshootingTemplate:
            "Troubleshooting Template",
        knowledgeBaseNote: "Knowledge Base Note"
    };

    const removeFunctions = {
        issueType: removeToolIssueType,
        queue: removeToolQueue,
        knowledgeBase: removeToolKnowledgeBase,
        troubleshootingTemplate:
            removeToolTroubleshootingTemplate,
        knowledgeBaseNote:
            removeToolKnowledgeBaseNote
    };

    const label = labels[relationship];
    const removeFunction = removeFunctions[relationship];

    const itemId =
        relationship === "issueType"
            ? item?.issue_type_id
            : item?.id;

    if (!label || !removeFunction || !itemId) {
        showErrorMessage(
            "Unable to remove relationship."
        );
        return;
    }

    const itemName =
        item.issue_type ||
        item.name ||
        item.title ||
        item.article_number ||
        `#${itemId}`;

    const content = `
        <p>
            Are you sure you want to remove
            <strong>${escapeToolHtml(itemName)}</strong>
            from this Tool?
        </p>

        <div class="modal-actions">
            <button
                type="button"
                id="removeRelationshipCancelButton"
            >
                Cancel
            </button>
            <button
                type="button"
                id="removeRelationshipConfirmButton"
            >
                Remove
            </button>
        </div>
    `;

    renderModal({
        containerId: "relationshipModal",
        title: `Remove ${label}`,
        content,
        onClose: closeRelationshipModal
    });

    showRelationshipModal();

    document
        .getElementById("removeRelationshipCancelButton")
        .addEventListener(
            "click",
            closeRelationshipModal
        );

    document
        .getElementById("removeRelationshipConfirmButton")
        .addEventListener("click", async () => {
            try {
                await removeFunction(toolId, itemId);

                closeRelationshipModal();
                await loadRelationships();

                showSuccessMessage(
                    `${label} removed successfully.`
                );
            } catch (error) {
                console.error(
                    `Error removing ${label}:`,
                    error
                );

                showErrorMessage(
                    `Error removing ${label}.`
                );
            }
        });
}

// ============================================================
// RELATIONSHIP MODAL HELPERS
// ============================================================

function showRelationshipModal() {
    const modal =
        document.getElementById("relationshipModal");

    if (modal) {
        modal.classList.remove("hidden");
    }
}

function closeRelationshipModal() {
    const modal =
        document.getElementById("relationshipModal");

    if (modal) {
        modal.classList.add("hidden");
        modal.innerHTML = "";
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeToolHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
