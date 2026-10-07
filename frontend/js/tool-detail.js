// ============================================================
// TOOL DETAIL
// ============================================================

const params = new URLSearchParams(window.location.search);
const toolId = Number(params.get("id"));

let currentTool = null;

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
        expanded: true,
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
            getToolIssueTypes(toolId),
            getToolQueues(toolId),
            getToolKnowledgeBase(toolId),
            getToolTroubleshootingTemplates(toolId),
            getToolKnowledgeBaseNotes(toolId)
        ]);

        renderRelationships({
            containerId: "relationships",
            relationships: [
                // ========================================================
                // ISSUE TYPES
                // ========================================================
                {
                    title: "Issue Types",
                    expanded: false,
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
                    getItemName: item =>
                        item.name || "-",
                    onAdd: openIssueTypeModal,
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "issueType"
                        });
                    },
                    onView: item => {
                        window.location.href =
                            `issue-type-detail.html?id=${item.id}`;
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
                    title: "Queues",
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
                    title: "Knowledge Base",
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
                    title: "Troubleshooting Templates",
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
                    title: "Knowledge Base Notes",
                    expanded: false,
                    entityLabel: "Knowledge Base Note",
                    addLabel: "Add Knowledge Base Note",
                    items: knowledgeBaseNotes || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: item =>
                        item.title || `Note ${item.id}`,
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

function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {
    const configs = {
        issueType: {
            label: "Issue Type",
            fields: [
                { key: "name", label: "Name", type: "text", required: true },
                { key: "description", label: "Description", type: "textarea" },
                { key: "form_template_id", label: "Form Template ID", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "display_name", label: "Display Name", type: "text" },
                { key: "search_keywords", label: "Search Keywords", type: "text" },
                { key: "is_active", label: "Active", type: "boolean" }
            ],
            create: createIssueType,
            update: updateIssueType,
            add: addToolIssueType
        },
        queue: {
            label: "Queue",
            fields: [
                { key: "name", label: "Queue Name", type: "text", required: true },
                { key: "description", label: "Description", type: "textarea" },
                { key: "is_active", label: "Active", type: "boolean" }
            ],
            create: createQueue,
            update: updateQueue,
            add: addToolQueue
        },
        knowledgeBase: {
            label: "Knowledge Base",
            fields: [
                { key: "article_number", label: "Article Number", type: "text", required: true },
                { key: "title", label: "Title", type: "text", required: true },
                { key: "url", label: "URL", type: "text", required: true },
                { key: "description", label: "Description", type: "textarea", required: true }
            ],
            create: createKnowledgeBaseItem,
            update: updateKnowledgeBaseItem,
            add: addToolKnowledgeBase
        },
        troubleshootingTemplate: {
            label: "Troubleshooting Template",
            fields: [
                { key: "name", label: "Name", type: "text", required: true },
                { key: "generated_description", label: "Description", type: "textarea", required: true },
                { key: "steps", label: "Troubleshooting Steps", type: "textarea", required: true },
                { key: "is_active", label: "Active", type: "boolean" }
            ],
            create: createTroubleshootingTemplate,
            update: updateTroubleshootingTemplate,
            add: addToolTroubleshootingTemplate
        },
        knowledgeBaseNote: {
            label: "Knowledge Base Note",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "content", label: "Content", type: "textarea", required: true },
                { key: "category", label: "Category", type: "text" },
                { key: "is_pinned", label: "Pinned", type: "boolean" },
                { key: "is_active", label: "Active", type: "boolean" }
            ],
            create: createKnowledgeBaseNote,
            update: updateKnowledgeBaseNote,
            add: addToolKnowledgeBaseNote
        }
    };

    const config = configs[relationship];

    if (!config) {
        showErrorMessage(`Unsupported relationship: ${relationship}.`);
        return;
    }

    const modalTitle =
        mode === "edit"
            ? `Edit ${config.label}`
            : `Create ${config.label}`;

    let fieldsHtml = "";

    config.fields.forEach(field => {
        const value = item?.[field.key];

        if (field.type === "boolean") {
            const checked = value ?? true;

            fieldsHtml += `
                <div class="checkbox-group">
                    <input
                        type="checkbox"
                        id="relationshipItem_${field.key}"
                        ${checked ? "checked" : ""}
                    >
                    <label for="relationshipItem_${field.key}">
                        ${escapeToolHtml(field.label)}
                    </label>
                </div>
            `;

            return;
        }

        const safeValue = escapeToolHtml(value ?? "");

        if (field.type === "textarea") {
            fieldsHtml += `
                <div class="form-group">
                    <label for="relationshipItem_${field.key}">
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

        fieldsHtml += `
            <div class="form-group">
                <label for="relationshipItem_${field.key}">
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
        containerId: "relationshipModal",
        title: modalTitle,
        content,
        onClose: closeRelationshipModal
    });

    showRelationshipModal();

    document
        .getElementById("relationshipItemCancelButton")
        .addEventListener("click", closeRelationshipModal);

    document
        .getElementById("relationshipItemSaveButton")
        .addEventListener("click", async () => {
            await saveRelationshipItem({
                mode,
                relationship,
                item
            });
        });
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

    const fieldMap = {
        issueType: [
            "name",
            "description",
            "form_template_id",
            "category",
            "display_name",
            "search_keywords",
            "is_active"
        ],
        queue: [
            "name",
            "description",
            "is_active"
        ],
        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ],
        troubleshootingTemplate: [
            "name",
            "generated_description",
            "steps",
            "is_active"
        ],
        knowledgeBaseNote: [
            "title",
            "content",
            "category",
            "is_pinned",
            "is_active"
        ]
    };

    const config = configs[relationship];
    const fields = fieldMap[relationship];

    if (!config || !fields) {
        showErrorMessage(`Unsupported relationship: ${relationship}.`);
        return;
    }

    const data = {};

    fields.forEach(field => {
        const input = document.getElementById(
            `relationshipItem_${field}`
        );

        if (!input) {
            return;
        }

        data[field] =
            input.type === "checkbox"
                ? input.checked
                : input.value.trim();
    });

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
        knowledgeBaseNote: ["title", "content"]
    };

    for (const field of requiredFields[relationship]) {
        if (!data[field]) {
            showWarningMessage(
                `${getRelationshipFieldLabel(field)} is required.`
            );

            const input = document.getElementById(
                `relationshipItem_${field}`
            );

            if (input) {
                input.focus();
            }

            return;
        }
    }

    try {
        if (mode === "create") {
            const createdItem = await config.create(data);

            if (!createdItem?.id) {
                throw new Error(
                    `Created ${config.label} did not return an ID.`
                );
            }

            await config.add(toolId, createdItem.id);

            closeRelationshipModal();
            await loadRelationships();

            showSuccessMessage(
                `${config.label} created and added successfully.`
            );

            return;
        }

        if (mode === "edit") {
            if (!item?.id) {
                showErrorMessage(
                    `${config.label} ID is missing.`
                );
                return;
            }

            await config.update(item.id, data);

            closeRelationshipModal();
            await loadRelationships();

            showSuccessMessage(
                `${config.label} updated successfully.`
            );
        }
    } catch (error) {
        console.error(
            `Error saving ${relationship}:`,
            error
        );

        showErrorMessage(
            `Error ${mode === "create" ? "creating" : "updating"} ${config.label.toLowerCase()}.`
        );
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
    await openAddRelationshipSelectModal({
        title: "Add Issue Type",
        label: "Issue Type",
        getAll: getIssueTypes,
        getRelated: () => getToolIssueTypes(toolId),
        onAdd: id => addToolIssueType(toolId, id),
        getName: item => item.name || "-"
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

    if (!label || !removeFunction || !item?.id) {
        showErrorMessage(
            "Unable to remove relationship."
        );
        return;
    }

    const itemName =
        item.name ||
        item.title ||
        item.article_number ||
        `#${item.id}`;

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
                await removeFunction(toolId, item.id);

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
