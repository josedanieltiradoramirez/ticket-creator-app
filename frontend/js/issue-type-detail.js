let issueTypeId = null;

let troubleshootingTemplateExpandedStates = new Map();

let currentIssueType = null;

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
                                ${escapeRelationshipHtml(note.title || "Alert")}
                            </div>
                            <div class="kb-special-note-content">
                                ${escapeRelationshipHtml(note.content || "")}
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
                            ${note.title ? `<div class="kb-special-note-title">${escapeRelationshipHtml(note.title)}</div>` : ""}
                            <div class="kb-special-note-content">
                                ${escapeRelationshipHtml(note.content || "")}
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
    const isPinned = isKnowledgeBaseNotePinned(item);
    const index = items.indexOf(item);
    const previousIsPinned =
        index > 0
            ? isKnowledgeBaseNotePinned(items[index - 1])
            : false;

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
                <div class="kb-note-item-title">
                    ${escapeRelationshipHtml(item.title || `Note ${item.id}`)}
                </div>
                <div class="kb-note-item-body">
                    ${escapeRelationshipHtml(item.content || "")}
                </div>
            </div>
        </div>
    `;
}



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

        issueTypeId =
            Number(
                params.get("id")
            );


        if (!issueTypeId) {

            showErrorMessage(
                "Invalid Issue Type ID."
            );

            window.location.href =
                "issue-types.html";

            return;

        }


        await loadIssueTypeDetail();
}
);


// ============================================================
// EVENT LISTENERS
// ============================================================

// ============================================================
// LOAD ISSUE TYPE
// ============================================================

async function loadIssueTypeDetail() {

    try {

        currentIssueType =
            await getIssueType(
                issueTypeId
            );
renderDetailHeader({
            containerId: "detailHeader",
            type: "Issue Type",
            title: currentIssueType.name,
            description: currentIssueType.description,

            onBack: () => {
                window.location.href = "issue-types.html";
            }
        });

        renderBasicInformation(
            currentIssueType
        );

        await loadForm();

        await loadRelationships();

    } catch (error) {

        console.error(
            "Error loading issue type detail:",
            error
        );

        showErrorMessage(
            "Error loading issue type details."
        );

    }

}

// ============================================================
// RELATIONSHIPS
// ============================================================

function preserveTroubleshootingTemplateStates() {
    const collapsibles = document.querySelectorAll(
        ".issue-type-troubleshooting-collapsible"
    );

    collapsibles.forEach(collapsible => {
        const templateId =
            collapsible.dataset.troubleshootingTemplateId;

        const header =
            collapsible.querySelector(
                ".issue-type-troubleshooting-collapsible-header"
            );

        if (!templateId || !header) {
            return;
        }

        troubleshootingTemplateExpandedStates.set(
            String(templateId),
            header.getAttribute("aria-expanded") === "true"
        );
    });
}


async function loadRelationships() {

    preserveTroubleshootingTemplateStates();

    try {

        const [
            queues,
            tools,
            troubleshootingTemplates,
            knowledgeBase,
            knowledgeBaseNotes
        ] = await Promise.all([

            getIssueTypeQueues(issueTypeId),

            getIssueTypeTools(issueTypeId),

            getIssueTypeTroubleshootingTemplates(
                issueTypeId
            ),

            getIssueTypeKnowledgeBase(
                issueTypeId
            ),

            getIssueTypeKnowledgeBaseNotes(
                issueTypeId
            )

        ]);


        // ========================================================
        // ENRICH TROUBLESHOOTING TEMPLATES
        // ========================================================
        //
        // The Issue Type -> Troubleshooting Template relationship
        // tells us which templates apply to this Issue Type.
        // Each template owns its own Knowledge Base relationship,
        // so load those KBs from the template itself.
        //
        // We intentionally enrich the data only for this page.
        // Shared relationship components are left unchanged.
        // ========================================================

        const enrichedTroubleshootingTemplates =
            await Promise.all(
                (troubleshootingTemplates || []).map(
                    async (template) => {
                        try {
                            const templateKnowledgeBase =
                                await getTroubleshootingTemplateKnowledgeBase(
                                    template.id
                                );

                            return {
                                ...template,
                                knowledge_base:
                                    templateKnowledgeBase || []
                            };
                        } catch (error) {
                            console.error(
                                `Error loading Knowledge Base for troubleshooting template ${template.id}:`,
                                error
                            );

                            return {
                                ...template,
                                knowledge_base: []
                            };
                        }
                    }
                )
            );


        // If there is only one troubleshooting template, it is displayed
        // expanded. Preserve that state so that when a second template is
        // added, the existing template remains expanded and the new one
        // starts collapsed.
        if (enrichedTroubleshootingTemplates.length === 1) {
            const templateId =
                enrichedTroubleshootingTemplates[0]?.id;

            if (templateId != null) {
                troubleshootingTemplateExpandedStates.set(
                    String(templateId),
                    true
                );
            }
        }

        renderSpecialKnowledgeBaseNotes(knowledgeBaseNotes);

        const regularKnowledgeBaseNotes =
            (knowledgeBaseNotes || [])
                .filter(note => {
                    if (!isKnowledgeBaseNoteActive(note)) return false;

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

                // ==================================================
                // TROUBLESHOOTING TEMPLATES
                // ==================================================

                {
                    title: "Troubleshooting Steps",

                    expanded: true,

                    entityLabel: "Troubleshooting Template",

                    addLabel: "Add Template",

                    items:
                        enrichedTroubleshootingTemplates,

                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },

                    renderItem: (item) => {
                        const templateName =
                            item.name ||
                            item.generated_description ||
                            `Template ${item.id}`;

                        const steps =
                            item.steps ||
                            "No troubleshooting steps available.";

                        const knowledgeBases =
                            item.knowledge_base || [];

                        const knowledgeBaseHtml =
                            knowledgeBases.length === 0
                                ? `
                                    <div class="issue-type-troubleshooting-empty">
                                        No related Knowledge Base articles.
                                    </div>
                                `
                                : `
                                    <ul class="issue-type-troubleshooting-kb-list">
                                        ${knowledgeBases
                                            .map((knowledgeBase) => {
                                                const articleNumber =
                                                    knowledgeBase.article_number ||
                                                    "";

                                                const title =
                                                    knowledgeBase.title ||
                                                    "Untitled Knowledge Base";

                                                const label = articleNumber
                                                    ? `${articleNumber} — ${title}`
                                                    : title;

                                                return `
                                                    <li class="issue-type-troubleshooting-kb-item">
                                                        ${escapeRelationshipHtml(label)}
                                                    </li>
                                                `;
                                            })
                                            .join("")}
                                    </ul>
                                `;

                        const templateContent = `
                            <div class="issue-type-troubleshooting-template">

                                <div class="issue-type-troubleshooting-block">
                                    <div class="issue-type-troubleshooting-label">
                                        Troubleshooting Steps
                                    </div>

                                    <div class="issue-type-troubleshooting-steps">
                                        ${escapeRelationshipHtml(steps)}
                                    </div>
                                </div>

                                <div class="issue-type-troubleshooting-block">
                                    <div class="issue-type-troubleshooting-label">
                                        Related Knowledge Base
                                    </div>

                                    ${knowledgeBaseHtml}
                                </div>

                            </div>
                        `;

                        // Keep each template independently collapsible when
                        // the Issue Type has multiple troubleshooting templates.
                        if (enrichedTroubleshootingTemplates.length > 1) {
                            const isExpanded =
                                troubleshootingTemplateExpandedStates.get(
                                    String(item.id)
                                ) ?? false;

                            return `
                                <div
                                    class="issue-type-troubleshooting-collapsible"
                                    data-troubleshooting-template-id="${item.id}"
                                >
                                    <button
                                        type="button"
                                        class="issue-type-troubleshooting-collapsible-header"
                                        aria-expanded="${isExpanded}"
                                    >
                                        <span class="issue-type-troubleshooting-collapsible-icon">
                                            ${isExpanded ? "▼" : "▶"}
                                        </span>

                                        <span class="issue-type-troubleshooting-template-name">
                                            ${escapeRelationshipHtml(templateName)}
                                        </span>
                                    </button>

                                    <div
                                        class="issue-type-troubleshooting-collapsible-content ${
                                            isExpanded
                                                ? "issue-type-troubleshooting-expanded"
                                                : "issue-type-troubleshooting-collapsed"
                                        }"
                                    >
                                        ${templateContent}
                                    </div>
                                </div>
                            `;
                        }

                        return `
                            <div class="issue-type-troubleshooting-template-wrapper">
                                <div class="issue-type-troubleshooting-template-name">
                                    ${escapeRelationshipHtml(templateName)}
                                </div>
                                ${templateContent}
                            </div>
                        `;
                    },

                    onAdd: () => {

                        openTroubleshootingTemplateModal();

                    },

                    onCreate: () => {

                        openRelationshipItemModal({
                            mode: "create",
                            relationship:
                                "troubleshootingTemplate"
                        });

                    },

                    onView: (item) => {

                        window.location.href =
                            `troubleshooting-template-detail.html?id=${item.id}`;

                    },

                    onEdit: (item) => {

                        openRelationshipItemModal({
                            mode: "edit",
                            relationship:
                                "troubleshootingTemplate",
                            item: item
                        });

                    },

                    onRemove: (item) => {

                        openRemoveRelationshipModal({
                            relationship:
                                "troubleshootingTemplate",
                            item: item
                        });

                    }
                },

                // ==================================================
                // QUEUES
                // ==================================================

                {
                    title: "Routing Queue",

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

                    getItemName: (item) =>
                        item.name || "-",

                    onAdd: () => {

                        openQueueModal();

                    },

                    onCreate: () => {

                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "queue"
                        });

                    },

                    onView: (item) => {

                        window.location.href =
                            `queue-detail.html?id=${item.id}`;

                    },

                    onEdit: (item) => {

                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "queue",
                            item: item
                        });

                    },

                    onRemove: (item) => {

                        openRemoveRelationshipModal({
                            relationship: "queue",
                            item: item
                        });

                    }
                },


                // ==================================================
                // TOOLS
                // ==================================================

                {
                    title: "Tools related to this Issue Type",
                    
                    expanded: false,

                    entityLabel: "Tool",

                    addLabel: "Add Tool",

                    items: tools || [],

                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },

                    getItemName: (item) =>
                        item.name || "-",

                    onAdd: () => {

                        openToolModal();

                    },

                    onCreate: () => {

                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "tool"
                        });

                    },

                    onView: (item) => {

                        window.location.href =
                            `tool-detail.html?id=${item.id}`;

                    },

                    onEdit: (item) => {

                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "tool",
                            item: item
                        });

                    },

                    onRemove: (item) => {

                        openRemoveRelationshipModal({
                            relationship: "tool",
                            item: item
                        });

                    }
                },


                


                // ==================================================
                // KNOWLEDGE BASE
                // ==================================================

                {
                    title: "KB articles related to this Issue Type",

                    expanded: false,

                    entityLabel: "Knowledge Base",

                    addLabel: "Add Knowledge Base",

                    items:
                        knowledgeBase || [],

                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },

                    getItemName: (item) =>
                        item.article_number
                            ? `${item.article_number} - ${item.title}`
                            : item.title || "-",

                    onAdd: () => {

                        openKnowledgeBaseModal();

                    },

                    onCreate: () => {

                        openRelationshipItemModal({
                            mode: "create",
                            relationship:
                                "knowledgeBase"
                        });

                    },

                    onView: (item) => {

                        window.location.href =
                            `knowledge-base-detail.html?id=${item.id}`;

                    },

                    onEdit: (item) => {

                        openRelationshipItemModal({
                            mode: "edit",
                            relationship:
                                "knowledgeBase",
                            item: item
                        });

                    },

                    onRemove: (item) => {

                        openRemoveRelationshipModal({
                            relationship:
                                "knowledgeBase",
                            item: item
                        });

                    }
                },


                // ==================================================
                // KNOWLEDGE BASE NOTES
                // ==================================================

                {
                    title: "Notes",

                    expanded: false,

                    entityLabel: "Knowledge Base Note",

                    addLabel: "Add Note",

                    items:
                        regularKnowledgeBaseNotes,

                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },

                    getItemName: (item) =>
                        item.category
                            ? `${item.title} - ${item.category}`
                            : item.title || "-",
                    renderItem: item =>
                        renderKnowledgeBaseNoteItem(
                            item,
                            regularKnowledgeBaseNotes
                        ),

                    onAdd: () => {

                        openKnowledgeBaseNoteModal();

                    },

                    onCreate: () => {

                        openRelationshipItemModal({
                            mode: "create",
                            relationship:
                                "knowledgeBaseNote"
                        });

                    },

                    onView: (item) => {

                        window.location.href =
                            `knowledge-base-note-detail.html?id=${item.id}`;

                    },

                    onEdit: (item) => {

                        openRelationshipItemModal({
                            mode: "edit",
                            relationship:
                                "knowledgeBaseNote",
                            item: item
                        });

                    },

                    onRemove: (item) => {

                        openRemoveRelationshipModal({
                            relationship:
                                "knowledgeBaseNote",
                            item: item
                        });

                    }
                }

            ]

        });

        setupTroubleshootingTemplateCollapsibles();

    } catch (error) {

        console.error(
            "Error loading relationships:",
            error
        );

        showErrorMessage(
            "Error loading relationships."
        );

    }

}

function setupTroubleshootingTemplateCollapsibles() {

    const collapsibles =
        document.querySelectorAll(
            ".issue-type-troubleshooting-collapsible"
        );

    collapsibles.forEach(collapsible => {

        const header =
            collapsible.querySelector(
                ".issue-type-troubleshooting-collapsible-header"
            );

        const icon =
            collapsible.querySelector(
                ".issue-type-troubleshooting-collapsible-icon"
            );

        const content =
            collapsible.querySelector(
                ".issue-type-troubleshooting-collapsible-content"
            );

        if (!header || !icon || !content) {
            return;
        }

        header.addEventListener("click", event => {
            event.stopPropagation();

            const expanded =
                header.getAttribute("aria-expanded") === "true";

            const nextExpanded = !expanded;

            const templateId =
                collapsible.dataset.troubleshootingTemplateId;

            if (templateId) {
                troubleshootingTemplateExpandedStates.set(
                    String(templateId),
                    nextExpanded
                );
            }

            header.setAttribute(
                "aria-expanded",
                String(nextExpanded)
            );

            icon.textContent =
                nextExpanded ? "▼" : "▶";

            content.classList.toggle(
                "issue-type-troubleshooting-expanded",
                nextExpanded
            );

            content.classList.toggle(
                "issue-type-troubleshooting-collapsed",
                !nextExpanded
            );
        });

    });
}


// ============================================================
// RELATIONSHIP ITEM MODAL
// ============================================================

function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {

    const configs = {

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
                    type: "textarea",
                    required: true
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ]
        },


        tool: {
            label: "Tool",
            fields: [
                {
                    key: "name",
                    label: "Tool Name",
                    type: "text",
                    required: true
                },
                {
                    key: "description",
                    label: "Description",
                    type: "textarea",
                    required: true
                },
                {
                    key: "access_request",
                    label: "Access Request",
                    type: "text"
                },
                {
                    key: "password_reset",
                    label: "Password Reset",
                    type: "text"
                },
                {
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ]
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
            ]
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
            ]
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
            ]
        }

    };


    const config =
        configs[relationship];


    if (!config) {

        console.error(
            `Unsupported relationship: ${relationship}`
        );

        return;

    }


    const isEdit =
        mode === "edit";


    const modalTitle =
        isEdit
            ? `Edit ${config.label}`
            : `Create ${config.label}`;


    let fieldsHtml = "";


    config.fields.forEach(
        (field) => {

            const value =
                item?.[field.key];


            if (
                field.type === "boolean"
            ) {

                const checked =
                    value ??
                    true;

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
                            ${field.label}
                        </label>

                    </div>

                `;

                return;

            }


            const safeValue =
                escapeRelationshipModalHtml(
                    value ?? ""
                );


            if (
                field.type === "select"
            ) {

                const selectedValue =
                    value ?? "Note";

                fieldsHtml += `

                    <div class="form-group">

                        <label
                            for="relationshipItem_${field.key}"
                        >
                            ${field.label}
                        </label>

                        <select
                            id="relationshipItem_${field.key}"
                        >
                            ${(field.options || []).map(option => `
                                <option
                                    value="${escapeRelationshipModalHtml(option.value)}"
                                    ${String(selectedValue) === String(option.value) ? "selected" : ""}
                                >
                                    ${escapeRelationshipModalHtml(option.label)}
                                </option>
                            `).join("")}
                        </select>

                    </div>

                `;

                return;

            }


            if (
                field.type === "textarea"
            ) {

                fieldsHtml += `

                    <div class="form-group">

                        <label
                            for="relationshipItem_${field.key}"
                        >
                            ${field.label}
                        </label>

                        <textarea
                            id="relationshipItem_${field.key}"
                            rows="6"
                            ${field.required ? "required" : ""}
                        >${safeValue}</textarea>

                    </div>

                `;

                return;

            }


            fieldsHtml += `

                <div class="form-group">

                    <label
                        for="relationshipItem_${field.key}"
                    >
                        ${field.label}
                    </label>

                    <input
                        type="text"
                        id="relationshipItem_${field.key}"
                        value="${safeValue}"
                        ${field.required ? "required" : ""}
                    >

                </div>

            `;

        }
    );


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


    renderModal({

        containerId:
            "relationshipItemModal",

        title:
            modalTitle,

        content:
            content,

        onClose: () => {

            closeRelationshipItemModal();

        }

    });


    document
        .getElementById(
            "relationshipItemCancelButton"
        )
        .addEventListener(
            "click",
            () => {

                closeRelationshipItemModal();

            }
        );


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


    document
        .getElementById(
            "relationshipItemModal"
        )
        .classList
        .remove("hidden");

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

        queue: {
            label: "Queue",

            create: createQueue,

            update: updateQueue,

            add: addIssueTypeQueue
        },


        tool: {
            label: "Tool",

            create: createTool,

            update: updateTool,

            add: addIssueTypeTool
        },


        troubleshootingTemplate: {
            label: "Troubleshooting Template",

            create:
                createTroubleshootingTemplate,

            update:
                updateTroubleshootingTemplate,

            add:
                addIssueTypeTroubleshootingTemplate
        },


        knowledgeBase: {
            label: "Knowledge Base",

            create:
                createKnowledgeBaseItem,

            update:
                updateKnowledgeBaseItem,

            add:
                addIssueTypeKnowledgeBase
        },


        knowledgeBaseNote: {
            label: "Knowledge Base Note",

            create:
                createKnowledgeBaseNote,

            update:
                updateKnowledgeBaseNote,

            add:
                addIssueTypeKnowledgeBaseNote
        }

    };


    const config =
        configs[relationship];


    if (!config) {

        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );

        return;

    }


    const fields = {

        queue: [
            "name",
            "description",
            "is_active"
        ],

        tool: [
            "name",
            "description",
            "access_request",
            "password_reset",
            "is_active"
        ],

        troubleshootingTemplate: [
            "name",
            "generated_description",
            "steps",
            "is_active"
        ],

        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ],

        knowledgeBaseNote: [
            "title",
            "content",
            "category",
            "is_pinned",
            "is_active"
        ]

    };


    const relationshipFields =
        fields[relationship];


    const data = {};


    for (
        const field of relationshipFields
    ) {

        const input =
            document.getElementById(
                `relationshipItem_${field}`
            );


        if (!input) {
            continue;
        }


        if (
            input.type === "checkbox"
        ) {

            data[field] =
                input.checked;

        } else {

            data[field] =
                input.value.trim();

        }

    }


    // ========================================================
    // VALIDATION
    // ========================================================

    const requiredFields = {

        queue: [
            "name",
            "description"
        ],

        tool: [
            "name",
            "description"
        ],

        troubleshootingTemplate: [
            "name",
            "steps"
        ],

        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ],

        knowledgeBaseNote: [
            "title",
            "content"
        ]

    };


    for (
        const field of requiredFields[relationship]
    ) {

        if (
            !data[field]
        ) {

            const input =
                document.getElementById(
                    `relationshipItem_${field}`
                );


            showWarningMessage(
                `${getRelationshipFieldLabel(field)} is required.`
            );


            if (input) {
                input.focus();
            }


            return;

        }

    }


    // ========================================================
    // CREATE
    // ========================================================

    if (
        mode === "create"
    ) {

        try {

            const createdItem =
                await config.create(
                    data
                );


            await config.add(
                issueTypeId,
                createdItem.id
            );


            closeRelationshipItemModal();


            showSuccessMessage(
                `${config.label} created successfully.`
            );


            await loadRelationships();

        } catch (error) {

            console.error(
                `Error creating ${relationship}:`,
                error
            );


            showErrorMessage(
                `Error creating ${config.label.toLowerCase()}.`
            );

        }

        return;

    }


    // ========================================================
    // EDIT
    // ========================================================

    if (
        mode === "edit"
    ) {

        if (
            !item?.id
        ) {

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


            closeRelationshipItemModal();


            showSuccessMessage(
                `${config.label} updated successfully.`
            );


            await loadRelationships();

        } catch (error) {

            console.error(
                `Error updating ${relationship}:`,
                error
            );


            showErrorMessage(
                `Error updating ${config.label.toLowerCase()}.`
            );

        }

    }

}

function getRelationshipFieldLabel(
    field
) {

    const labels = {

        name: "Name",

        description: "Description",

        access_request: "Access Request",

        password_reset: "Password Reset",

        generated_description:
            "Description",

        steps:
            "Troubleshooting Steps",

        article_number:
            "Article Number",

        title:
            "Title",

        url:
            "URL",

        content:
            "Content",

        category:
            "Category",

        is_pinned:
            "Pinned",

        is_active:
            "Active"

    };


    return (
        labels[field] ||
        field
    );

}


// ============================================================
// CLOSE RELATIONSHIP ITEM MODAL
// ============================================================

function closeRelationshipItemModal() {

    const modal =
        document.getElementById(
            "relationshipItemModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

}

function openRemoveRelationshipModal({
    relationship,
    item
}) {

    const labels = {

        queue:
            "Queue",

        tool:
            "Tool",

        troubleshootingTemplate:
            "Troubleshooting Template",

        knowledgeBase:
            "Knowledge Base",

        knowledgeBaseNote:
            "Knowledge Base Note"

    };


    const label =
        labels[relationship];


    if (!label) {

        console.error(
            `Unsupported relationship: ${relationship}`
        );

        return;

    }


    const content = `

        <p>
            Are you sure you want to remove
            this ${label} from the Issue Type?
        </p>

        <div class="modal-actions">

            <button
                type="button"
                id="relationshipRemoveCancelButton"
            >
                Cancel
            </button>

            <button
                type="button"
                id="relationshipRemoveConfirmButton"
            >
                Remove
            </button>

        </div>

    `;


    renderModal({

        containerId:
            "relationshipItemModal",

        title:
            `Remove ${label}`,

        content:
            content,

        onClose: () => {

            closeRelationshipItemModal();

        }

    });


    document
        .getElementById(
            "relationshipRemoveCancelButton"
        )
        .addEventListener(
            "click",
            () => {

                closeRelationshipItemModal();

            }
        );


    document
        .getElementById(
            "relationshipRemoveConfirmButton"
        )
        .addEventListener(
            "click",
            async () => {

                await removeRelationshipItem({
                    relationship,
                    item
                });

            }
        );


    document
        .getElementById(
            "relationshipItemModal"
        )
        .classList
        .remove("hidden");

}

async function removeRelationshipItem({
    relationship,
    item
}) {

    const configs = {

        queue: {
            label: "Queue",

            remove:
                removeIssueTypeQueue
        },

        tool: {
            label: "Tool",

            remove:
                removeIssueTypeTool
        },

        troubleshootingTemplate: {
            label:
                "Troubleshooting Template",

            remove:
                removeIssueTypeTroubleshootingTemplate
        },

        knowledgeBase: {
            label:
                "Knowledge Base",

            remove:
                removeIssueTypeKnowledgeBase
        },

        knowledgeBaseNote: {
            label:
                "Knowledge Base Note",

            remove:
                removeIssueTypeKnowledgeBaseNote
        }

    };


    const config =
        configs[relationship];


    if (!config) {

        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );

        return;

    }


    if (
        !item?.id
    ) {

        showErrorMessage(
            `${config.label} ID is missing.`
        );

        return;

    }


    try {

        await config.remove(
            issueTypeId,
            item.id
        );


        closeRelationshipItemModal();


        showSuccessMessage(
            `${config.label} removed successfully.`
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            `Error removing ${relationship}:`,
            error
        );


        showErrorMessage(
            `Error removing ${config.label.toLowerCase()}.`
        );

    }

}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeRelationshipModalHtml(
    value
) {

    return String(value ?? "")
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

// ============================================================
// BASIC INFORMATION
// ============================================================

function renderBasicInformation(issueType) {
    renderBasicInformationComponent({
        containerId: "basicInformation",

        data: issueType,

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
            },
            {
                key: "category",
                label: "Category",
                type: "text"
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
                label: "Status",
                type: "boolean"
            }
        ],

        expanded: false,

        onSave: async (updatedData) => {
            try {
                const data = {
                    name: updatedData.name,
                    description: updatedData.description,
                    category: updatedData.category,
                    display_name: updatedData.display_name,
                    search_keywords: updatedData.search_keywords,
                    is_active: updatedData.is_active
                };

                const updatedIssueType = await updateIssueType(
                    issueTypeId,
                    data
                );

                currentIssueType = updatedIssueType;

                renderDetailHeader({
                    containerId: "detailHeader",
                    type: "Issue Type",
                    title: currentIssueType.name,
                    description: currentIssueType.description,
                    onBack: () => {
                        window.location.href = "issue-types.html";
                    }
                });

                showSuccessMessage(
                    "Issue Type updated successfully."
                );
            } catch (error) {
                console.error(
                    "Error updating Issue Type:",
                    error
                );

                showErrorMessage(
                    "Error updating Issue Type."
                );

                throw error;
            }
        }
    });
}


// ============================================================
// FORM
// ============================================================

async function loadForm() {

    try {

        const forms =
            await getIssueTypeForm(
                issueTypeId
            );
const form =
            forms && forms.length > 0
                ? forms[0]
                : null;


        renderFormSection({

            containerId: "formSection",

            form: form,

            actions: {
                add: true,
                create: true,
                change: true,
                edit: true,
                remove: true
            },

            expanded: false,

            onAdd: () => {

                openChangeFormModal();

            },

            onCreate: () => {

                openCreateFormModal();

            },

            onChange: () => {

                openChangeFormModal();

            },

            onEdit: () => {

                if (!form) {
                    return;
                }

                openEditFormModal(form);

            },

            onRemove: () => {

                if (!form) {
                    return;
                }

                openRemoveFormModal();

            }

        });

    } catch (error) {

        console.error(
            "Error loading form:",
            error
        );


        renderFormSection({

            containerId: "formSection",

            form: null,

            actions: {
                add: true,
                create: true,
                change: false,
                edit: false,
                remove: false
            },

            expanded: true,

            onAdd: () => {

                openChangeFormModal();

            },

            onCreate: () => {

                openCreateFormModal();

            }

        });

    }

}

// ============================================================
// CHANGE FORM MODAL
// ============================================================

async function openChangeFormModal() {

    try {

        const forms =
            await getForms();


        const options = forms
            .map(form => `
                <option value="${form.id}">
                    ${escapeHtml(form.name)}
                </option>
            `)
            .join("");


        const currentFormId =
            currentIssueType &&
            currentIssueType.form_template_id
                ? String(
                    currentIssueType.form_template_id
                )
                : "";


        const content = `

            <div class="form-group">

                <label for="changeFormSelect">
                    Form
                </label>

                <select
                    id="changeFormSelect"
                >

                    <option value="">
                        Select a form
                    </option>

                    ${options}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelChangeFormButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveChangeFormButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId:
                "changeFormModal",

            title:
                "Change Form",

            content:
                content,

            onClose: () => {
                closeChangeFormModal();
            }

        });


        const select =
            document.getElementById(
                "changeFormSelect"
            );


        if (currentFormId) {

            select.value =
                currentFormId;

        }


        document
            .getElementById(
                "cancelChangeFormButton"
            )
            .addEventListener(
                "click",
                closeChangeFormModal
            );


        document
            .getElementById(
                "saveChangeFormButton"
            )
            .addEventListener(
                "click",
                saveChangedForm
            );


        document
            .getElementById(
                "changeFormModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading forms:",
            error
        );

        showErrorMessage(
            "Error loading forms."
        );

    }

}

// ============================================================
// SAVE CHANGED FORM
// ============================================================

async function saveChangedForm() {

    const select =
        document.getElementById(
            "changeFormSelect"
        );


    const formId =
        select.value
            ? Number(select.value)
            : null;


    if (!formId) {

        showWarningMessage(
            "Please select a form."
        );

        return;

    }


    try {

        const data = {

            name:
                currentIssueType.name,

            description:
                currentIssueType.description,

            category:
                currentIssueType.category,

            display_name:
                currentIssueType.display_name,

            search_keywords:
                currentIssueType.search_keywords,

            form_template_id:
                formId,

            is_active:
                currentIssueType.is_active

        };


        await updateIssueType(
            issueTypeId,
            data
        );


        showSuccessMessage(
            "Form updated successfully."
        );



        closeChangeFormModal();


        await loadIssueTypeDetail();

    } catch (error) {

        console.error(
            "Error changing form:",
            error
        );

        showErrorMessage(
            "Error changing form."
        );

    }

}
// ============================================================
// REMOVE FORM FROM ISSUE TYPE
// ============================================================

function openRemoveFormModal() {

    const content = `

        <p>
            Are you sure you want to remove this Form
            from the Issue Type?
        </p>


        <div class="modal-actions">

            <button
                type="button"
                id="cancelRemoveFormButton"
            >
                Cancel
            </button>

            <button
                type="button"
                id="confirmRemoveFormButton"
            >
                Remove
            </button>

        </div>

    `;


    renderModal({

        containerId:
            "removeFormModal",

        title:
            "Remove Form",

        content:
            content,

        onClose: () => {
            closeRemoveFormModal();
        }

    });


    document
        .getElementById(
            "cancelRemoveFormButton"
        )
        .addEventListener(
            "click",
            closeRemoveFormModal
        );


    document
        .getElementById(
            "confirmRemoveFormButton"
        )
        .addEventListener(
            "click",
            removeFormFromIssueType
        );


    document
        .getElementById(
            "removeFormModal"
        )
        .classList
        .remove("hidden");

}


// ============================================================
// CONFIRM REMOVE FORM
// ============================================================

async function removeFormFromIssueType() {

    if (!currentIssueType) {
        return;
    }


    try {

        const data = {

            name:
                currentIssueType.name,

            description:
                currentIssueType.description,

            category:
                currentIssueType.category,

            display_name:
                currentIssueType.display_name,

            search_keywords:
                currentIssueType.search_keywords,

            form_template_id:
                null,

            is_active:
                currentIssueType.is_active

        };


        const updatedIssueType =
            await updateIssueType(
                issueTypeId,
                data
            );


        currentIssueType =
            updatedIssueType;


        closeRemoveFormModal();


        showSuccessMessage(
            "Form removed successfully."
        );


        await loadIssueTypeDetail();


    } catch (error) {

        console.error(
            "Error removing form:",
            error
        );

        showErrorMessage(
            "Error removing form."
        );

    }

}


// ============================================================
// CLOSE REMOVE FORM MODAL
// ============================================================

function closeRemoveFormModal() {

    const modal =
        document.getElementById(
            "removeFormModal"
        );

    if (!modal) {
        return;
    }


    modal
        .classList
        .add("hidden");

}

// ============================================================
// CLOSE CHANGE FORM
// ============================================================

function closeChangeFormModal() {

    document
        .getElementById(
            "changeFormModal"
        )
        .classList
        .add("hidden");

}

// ============================================================
// CREATE FORM MODAL
// ============================================================

function openCreateFormModal() {

    const content = `

        <div class="form-group">

            <label for="createFormName">
                Form Name
            </label>

            <input
                type="text"
                id="createFormName"
                required
            >

        </div>


        <div class="form-group">

            <label for="createFormDescription">
                Information Needed
            </label>

            <textarea
                id="createFormDescription"
                rows="5"
            ></textarea>

        </div>


        <div class="form-group checkbox-group">

            <input
                type="checkbox"
                id="createFormIsActive"
                checked
            >

            <label for="createFormIsActive">
                Active
            </label>

        </div>


        <div class="modal-actions">

            <button
                type="button"
                id="cancelCreateFormButton"
            >
                Cancel
            </button>

            <button
                type="button"
                id="saveCreateFormButton"
            >
                Create
            </button>

        </div>

    `;


    renderModal({

        containerId:
            "createFormModal",

        title:
            "Create Form",

        content:
            content,

        onClose: () => {
            closeCreateFormModal();
        }

    });


    document
        .getElementById(
            "cancelCreateFormButton"
        )
        .addEventListener(
            "click",
            closeCreateFormModal
        );


    document
        .getElementById(
            "saveCreateFormButton"
        )
        .addEventListener(
            "click",
            saveCreatedForm
        );


    document
        .getElementById(
            "createFormModal"
        )
        .classList
        .remove("hidden");

}


// ============================================================
// SAVE CREATED FORM
// ============================================================

async function saveCreatedForm() {

    const nameInput =
        document.getElementById(
            "createFormName"
        );

    const descriptionInput =
        document.getElementById(
            "createFormDescription"
        );

    const isActiveInput =
        document.getElementById(
            "createFormIsActive"
        );


    const name =
        nameInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const isActive =
        isActiveInput.checked;


    if (!name) {

        showWarningMessage(
            "Please enter a Form Name."
        );

        return;

    }


    try {

        const formData = {

            name:
                name,

            description:
                description,

            is_active:
                isActive

        };


        const createdForm =
            await createForm(
                formData
            );


        const issueTypeData = {

            name:
                currentIssueType.name,

            description:
                currentIssueType.description,

            category:
                currentIssueType.category,

            display_name:
                currentIssueType.display_name,

            search_keywords:
                currentIssueType.search_keywords,

            form_template_id:
                createdForm.id,

            is_active:
                currentIssueType.is_active

        };


        const updatedIssueType =
            await updateIssueType(
                issueTypeId,
                issueTypeData
            );


        currentIssueType =
            updatedIssueType;


        closeCreateFormModal();


        showSuccessMessage(
            "Form created successfully."
        );


        await loadIssueTypeDetail();


    } catch (error) {

        console.error(
            "Error creating form:",
            error
        );


        showErrorMessage(
            "Error creating form."
        );

    }

}


// ============================================================
// CLOSE CREATE FORM MODAL
// ============================================================

function closeCreateFormModal() {

    const modal =
        document.getElementById(
            "createFormModal"
        );

    if (!modal) {
        return;
    }


    modal
        .classList
        .add("hidden");

}


// ============================================================
// EDIT FORM MODAL
// ============================================================

async function openEditFormModal(
    form
) {

    try {

        const currentForm =
            await getForm(
                form.id
            );


        const content = `

            <div class="form-group">

                <label for="editFormName">
                    Form Name
                </label>

                <input
                    type="text"
                    id="editFormName"
                    value="${escapeHtml(
                        currentForm.name || ""
                    )}"
                    required
                >

            </div>


            <div class="form-group">

                <label for="editFormDescription">
                    Information Needed
                </label>

                <textarea
                    id="editFormDescription"
                    rows="5"
                >${escapeHtml(
                    currentForm.description || ""
                )}</textarea>

            </div>


            <div class="form-group checkbox-group">

                <input
                    type="checkbox"
                    id="editFormIsActive"
                    ${
                        currentForm.is_active
                            ? "checked"
                            : ""
                    }
                >

                <label for="editFormIsActive">
                    Active
                </label>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelEditFormButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveEditFormButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId:
                "editFormModal",

            title:
                "Edit Form",

            content:
                content,

            onClose: () => {
                closeEditFormModal();
            }

        });


        document
            .getElementById(
                "cancelEditFormButton"
            )
            .addEventListener(
                "click",
                closeEditFormModal
            );


        document
            .getElementById(
                "saveEditFormButton"
            )
            .addEventListener(
                "click",
                () => {
                    saveEditedForm(
                        currentForm.id
                    );
                }
            );


        document
            .getElementById(
                "editFormModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading form for editing:",
            error
        );

        showErrorMessage(
            "Error loading form."
        );

    }

}


// ============================================================
// SAVE EDITED FORM
// ============================================================

async function saveEditedForm(
    formId
) {

    const nameInput =
        document.getElementById(
            "editFormName"
        );

    const descriptionInput =
        document.getElementById(
            "editFormDescription"
        );

    const isActiveInput =
        document.getElementById(
            "editFormIsActive"
        );


    const name =
        nameInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const isActive =
        isActiveInput.checked;


    if (!name) {

        showWarningMessage(
            "Please enter a Form Name."
        );

        return;

    }


    try {

        const formData = {

            name:
                name,

            description:
                description,

            is_active:
                isActive

        };


        await updateForm(
            formId,
            formData
        );


        closeEditFormModal();


        showSuccessMessage(
            "Form updated successfully."
        );


        await loadIssueTypeDetail();


    } catch (error) {

        console.error(
            "Error updating form:",
            error
        );

        showErrorMessage(
            "Error updating form."
        );

    }

}


// ============================================================
// CLOSE EDIT FORM MODAL
// ============================================================

function closeEditFormModal() {

    const modal =
        document.getElementById(
            "editFormModal"
        );

    if (!modal) {
        return;
    }


    modal
        .classList
        .add("hidden");

}

// ============================================================
// QUEUES
// ============================================================

// ============================================================
// OPEN QUEUE MODAL
// ============================================================

async function openQueueModal() {

    try {

        const [
            queues,
            assignedQueues
        ] = await Promise.all([

            getQueues(),

            getIssueTypeQueues(
                issueTypeId
            )

        ]);


        const assignedIds =
            assignedQueues.map(
                queue => queue.id
            );


        const availableQueues =
            queues.filter(
                queue =>
                    !assignedIds.includes(
                        queue.id
                    )
            );


        const options = availableQueues
            .map(queue => {

                return `
                    <option value="${queue.id}">
                        ${escapeHtml(queue.name)}
                    </option>
                `;

            })
            .join("");


        const content = `

            <div class="form-group">

                <label for="queueSelect">
                    Queue
                </label>

                <select
                    id="queueSelect"
                >

                    <option value="">
                        Select a queue
                    </option>

                    ${options}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelQueueButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveQueueButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId: "queueModal",

            title: "Add Queue",

            content: content,

            onClose: () => {
                closeQueueModal();
            }

        });


        document
            .getElementById(
                "cancelQueueButton"
            )
            .addEventListener(
                "click",
                () => {
                    closeQueueModal();
                }
            );


        document
            .getElementById(
                "saveQueueButton"
            )
            .addEventListener(
                "click",
                () => {
                    addSelectedQueue();
                }
            );


        document
            .getElementById(
                "queueModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading queues:",
            error
        );

        showErrorMessage(
            "Error loading queues."
        );

    }

}


// ============================================================
// ADD QUEUE
// ============================================================

async function addSelectedQueue() {

    const select =
        document.getElementById(
            "queueSelect"
        );


    const queueId =
        select.value
            ? Number(select.value)
            : null;


    if (!queueId) {

        showWarningMessage(
            "Please select a queue."
        );

        return;

    }


    try {

        await addIssueTypeQueue(
            issueTypeId,
            queueId
        );


        closeQueueModal();


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error adding queue:",
            error
        );

        showErrorMessage(
            "Error adding queue."
        );

    }

}


// ============================================================
// REMOVE QUEUE
// ============================================================

// ============================================================
// CONFIRM REMOVE QUEUE
// ============================================================

// ============================================================
// CLOSE REMOVE QUEUE MODAL
// ============================================================

// ============================================================
// CLOSE QUEUE MODAL
// ============================================================

function closeQueueModal() {

    document
        .getElementById(
            "queueModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// TOOLS
// ============================================================

// ============================================================
// OPEN TOOL MODAL
// ============================================================

async function openToolModal() {

    try {

        const [
            tools,
            assignedTools
        ] = await Promise.all([
            getTools(),
            getIssueTypeTools(
                issueTypeId
            )
        ]);


        const assignedIds =
            assignedTools.map(
                tool => tool.id
            );


        const availableTools =
            tools.filter(
                tool =>
                    !assignedIds.includes(
                        tool.id
                    )
            );


        const options = availableTools
            .map(tool => {
                return `
                    <option value="${tool.id}">
                        ${escapeHtml(tool.name)}
                    </option>
                `;
            })
            .join("");


        const content = `

            <div class="form-group">

                <label for="toolSelect">
                    Tool
                </label>

                <select id="toolSelect">

                    <option value="">
                        Select a tool
                    </option>

                    ${options}

                </select>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelToolButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveToolButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId: "toolModal",

            title: "Add Tool",

            content: content,

            onClose: () => {
                closeToolModal();
            }

        });


        document
            .getElementById(
                "cancelToolButton"
            )
            .addEventListener(
                "click",
                closeToolModal
            );


        document
            .getElementById(
                "saveToolButton"
            )
            .addEventListener(
                "click",
                addSelectedTool
            );


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

        showErrorMessage(
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
            ? Number(select.value)
            : null;


    if (!toolId) {

        showWarningMessage(
            "Please select a tool."
        );

        return;

    }


    try {

        await addIssueTypeTool(
            issueTypeId,
            toolId
        );


        closeToolModal();


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error adding tool:",
            error
        );

        showErrorMessage(
            "Error adding tool."
        );

    }

}


// ============================================================
// REMOVE TOOL
// ============================================================

// ============================================================
// CONFIRM REMOVE TOOL
// ============================================================

// ============================================================
// CLOSE REMOVE TOOL MODAL
// ============================================================

// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

// ============================================================
// OPEN TROUBLESHOOTING TEMPLATE MODAL
// ============================================================

async function openTroubleshootingTemplateModal() {

    try {

        const [
            templates,
            assignedTemplates
        ] = await Promise.all([

            getTroubleshootingTemplates(),

            getIssueTypeTroubleshootingTemplates(
                issueTypeId
            )

        ]);


        const assignedIds =
            assignedTemplates.map(
                template => template.id
            );


        const availableTemplates =
            templates.filter(
                template =>
                    !assignedIds.includes(
                        template.id
                    )
            );


        const options =
            availableTemplates
                .map(template => `
                    <option value="${template.id}">
                        ${escapeHtml(
                            template.name ||
                            `Template ${template.id}`
                        )}
                    </option>
                `)
                .join("");


        const content = `

            <div class="form-group">

                <label
                    for="troubleshootingTemplateSelect"
                >
                    Troubleshooting Template
                </label>

                <select
                    id="troubleshootingTemplateSelect"
                >

                    <option value="">
                        Select a template
                    </option>

                    ${options}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelTroubleshootingTemplateButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveTroubleshootingTemplateButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId:
                "troubleshootingTemplateModal",

            title:
                "Add Troubleshooting Template",

            content:
                content,

            onClose: () => {
                closeTroubleshootingTemplateModal();
            }

        });


        document
            .getElementById(
                "cancelTroubleshootingTemplateButton"
            )
            .addEventListener(
                "click",
                closeTroubleshootingTemplateModal
            );


        document
            .getElementById(
                "saveTroubleshootingTemplateButton"
            )
            .addEventListener(
                "click",
                addSelectedTroubleshootingTemplate
            );


        document
            .getElementById(
                "troubleshootingTemplateModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading troubleshooting templates:",
            error
        );

        showErrorMessage(
            "Error loading troubleshooting templates."
        );

    }

}


// ============================================================
// ADD TROUBLESHOOTING TEMPLATE
// ============================================================

async function addSelectedTroubleshootingTemplate() {

    const select =
        document.getElementById(
            "troubleshootingTemplateSelect"
        );


    const templateId =
        select.value
            ? Number(select.value)
            : null;


    if (!templateId) {

        showWarningMessage(
            "Please select a troubleshooting template."
        );

        return;

    }


    try {

        await addIssueTypeTroubleshootingTemplate(
            issueTypeId,
            templateId
        );


        closeTroubleshootingTemplateModal();


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error adding troubleshooting template:",
            error
        );

        showErrorMessage(
            "Error adding troubleshooting template."
        );

    }

}


// ============================================================
// REMOVE TROUBLESHOOTING TEMPLATE
// ============================================================

// ============================================================
// CLOSE TROUBLESHOOTING TEMPLATE MODAL
// ============================================================

function closeTroubleshootingTemplateModal() {

    document
        .getElementById(
            "troubleshootingTemplateModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

// ============================================================
// OPEN KNOWLEDGE BASE MODAL
// ============================================================

async function openKnowledgeBaseModal() {

    try {

        const [
            knowledgeBase,
            assignedKnowledgeBase
        ] = await Promise.all([

            getKnowledgeBaseItems(),

            getIssueTypeKnowledgeBase(
                issueTypeId
            )

        ]);


        const assignedIds =
            assignedKnowledgeBase.map(
                kb => kb.id
            );


        const availableKnowledgeBase =
            knowledgeBase.filter(
                kb =>
                    !assignedIds.includes(
                        kb.id
                    )
            );


        const options =
            availableKnowledgeBase
                .map(kb => `
                    <option value="${kb.id}">
                        ${escapeHtml(
                            `${kb.article_number} - ${kb.title}`
                        )}
                    </option>
                `)
                .join("");


        const content = `

            <div class="form-group">

                <label for="knowledgeBaseSelect">
                    Knowledge Base
                </label>

                <select
                    id="knowledgeBaseSelect"
                >

                    <option value="">
                        Select an article
                    </option>

                    ${options}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelKnowledgeBaseButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveKnowledgeBaseButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId:
                "knowledgeBaseModal",

            title:
                "Add Knowledge Base",

            content:
                content,

            onClose: () => {
                closeKnowledgeBaseModal();
            }

        });


        document
            .getElementById(
                "cancelKnowledgeBaseButton"
            )
            .addEventListener(
                "click",
                closeKnowledgeBaseModal
            );


        document
            .getElementById(
                "saveKnowledgeBaseButton"
            )
            .addEventListener(
                "click",
                addSelectedKnowledgeBase
            );


        document
            .getElementById(
                "knowledgeBaseModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading knowledge base:",
            error
        );

        showErrorMessage(
            "Error loading knowledge base."
        );

    }

}


// ============================================================
// ADD KNOWLEDGE BASE
// ============================================================

async function addSelectedKnowledgeBase() {

    const select =
        document.getElementById(
            "knowledgeBaseSelect"
        );


    const knowledgeBaseId =
        select.value
            ? Number(select.value)
            : null;


    if (!knowledgeBaseId) {

        showWarningMessage(
            "Please select a Knowledge Base article."
        );

        return;

    }


    try {

        await addIssueTypeKnowledgeBase(
            issueTypeId,
            knowledgeBaseId
        );


        closeKnowledgeBaseModal();


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error adding knowledge base:",
            error
        );

        showErrorMessage(
            "Error adding Knowledge Base."
        );

    }

}


// ============================================================
// REMOVE KNOWLEDGE BASE
// ============================================================

// ============================================================
// CLOSE KNOWLEDGE BASE MODAL
// ============================================================

function closeKnowledgeBaseModal() {

    document
        .getElementById(
            "knowledgeBaseModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// KNOWLEDGE BASE NOTES
// ============================================================

// ============================================================
// OPEN KNOWLEDGE BASE NOTE MODAL
// ============================================================

async function openKnowledgeBaseNoteModal() {

    try {

        const [
            notes,
            assignedNotes
        ] = await Promise.all([

            getKnowledgeBaseNotes(),

            getIssueTypeKnowledgeBaseNotes(
                issueTypeId
            )

        ]);


        const assignedIds =
            assignedNotes.map(
                note => note.id
            );


        const availableNotes =
            notes.filter(
                note =>
                    !assignedIds.includes(
                        note.id
                    )
            );


        const options =
            availableNotes
                .map(note => {

                    const label =
                        note.category
                            ? `${note.title} - ${note.category}`
                            : note.title;

                    return `
                        <option value="${note.id}">
                            ${escapeHtml(label)}
                        </option>
                    `;

                })
                .join("");


        const content = `

            <div class="form-group">

                <label for="knowledgeBaseNoteSelect">
                    Knowledge Base Note
                </label>

                <select
                    id="knowledgeBaseNoteSelect"
                >

                    <option value="">
                        Select a Knowledge Base Note
                    </option>

                    ${options}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    id="cancelKnowledgeBaseNoteButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveKnowledgeBaseNoteButton"
                >
                    Save
                </button>

            </div>

        `;


        renderModal({

            containerId:
                "knowledgeBaseNoteModal",

            title:
                "Add Knowledge Base Note",

            content:
                content,

            onClose: () => {
                closeKnowledgeBaseNoteModal();
            }

        });


        document
            .getElementById(
                "cancelKnowledgeBaseNoteButton"
            )
            .addEventListener(
                "click",
                closeKnowledgeBaseNoteModal
            );


        document
            .getElementById(
                "saveKnowledgeBaseNoteButton"
            )
            .addEventListener(
                "click",
                addSelectedKnowledgeBaseNote
            );


        document
            .getElementById(
                "knowledgeBaseNoteModal"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Error loading knowledge base notes:",
            error
        );

        showErrorMessage(
            "Error loading Knowledge Base Notes."
        );

    }

}

// ============================================================
// ADD KNOWLEDGE BASE NOTE
// ============================================================

async function addSelectedKnowledgeBaseNote() {

    const select =
        document.getElementById(
            "knowledgeBaseNoteSelect"
        );


    const noteId =
        select.value
            ? Number(select.value)
            : null;


    if (!noteId) {

        showWarningMessage(
            "Please select a Knowledge Base Note."
        );

        return;

    }


    try {

        await addIssueTypeKnowledgeBaseNote(
            issueTypeId,
            noteId
        );


        closeKnowledgeBaseNoteModal();


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error adding knowledge base note:",
            error
        );

        showErrorMessage(
            "Error adding Knowledge Base Note."
        );

    }

}


// ============================================================
// REMOVE KNOWLEDGE BASE NOTE
// ============================================================

// ============================================================
// CLOSE KNOWLEDGE BASE NOTE MODAL
// ============================================================

function closeKnowledgeBaseNoteModal() {

    document
        .getElementById(
            "knowledgeBaseNoteModal"
        )
        .classList
        .add("hidden");

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
// STATUS BADGE
// ============================================================

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
