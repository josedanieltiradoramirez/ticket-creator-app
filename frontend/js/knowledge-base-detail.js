
let knowledgeBaseId = null;
let currentKnowledgeBase = null;

let relatedIssueTypes = [];
let relatedTools = [];
let relatedTroubleshootingTemplates = [];

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);

    knowledgeBaseId = Number(
        params.get("id")
    );

    if (!knowledgeBaseId) {
        showErrorMessage(
            "Invalid Knowledge Base ID."
        );

        window.location.href =
            "knowledge-base.html";

        return;
    }

    await loadKnowledgeBase();
});

// ============================================================
// LOAD
// ============================================================

async function loadKnowledgeBase() {
    try {
        currentKnowledgeBase =
            await getKnowledgeBaseItem(
                knowledgeBaseId
            );

        await loadRelationships();

        renderKnowledgeBase();

    } catch (error) {
        console.error(
            "Error loading Knowledge Base:",
            error
        );

        showErrorMessage(
            "Error loading Knowledge Base."
        );

        window.location.href =
            "knowledge-base.html";
    }
}

// ============================================================
// RENDER
// ============================================================

function renderKnowledgeBase() {
    document.title =
        `${currentKnowledgeBase.title || "Knowledge Base"} - Knowledge Base`;

    renderDetailHeader({
        containerId: "detailHeader",
        type: "Knowledge Base",
        title:
            currentKnowledgeBase.title ||
            "Knowledge Base",
        description: "",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href =
                "knowledge-base.html";
        }
    });

    renderBasicInformation();
}

function renderBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",
        data: currentKnowledgeBase,
        fields: [
            {
                key: "id",
                label: "ID",
                type: "text",
                readonly: true
            },
            {
                key: "article_number",
                label: "Article Number",
                type: "text"
            },
            {
                key: "title",
                label: "Title",
                type: "text"
            },
            {
                key: "url",
                label: "URL",
                type: "text"
            },
            {
                key: "description",
                label: "Description",
                type: "text"
            }
        ],
        expanded: true,
        onSave: async (updatedData) => {
            const data = {
                article_number:
                    updatedData.article_number,
                title:
                    updatedData.title,
                url:
                    updatedData.url,
                description:
                    updatedData.description
            };

            try {
                const updated =
                    await updateKnowledgeBaseItem(
                        knowledgeBaseId,
                        data
                    );

                Object.assign(
                    currentKnowledgeBase,
                    updated || data
                );

                renderKnowledgeBase();

                showSuccessMessage(
                    "Knowledge Base updated successfully."
                );

            } catch (error) {
                console.error(
                    "Error updating Knowledge Base:",
                    error
                );

                showErrorMessage(
                    "Error updating Knowledge Base."
                );

                throw error;
            }
        }
    });
}

// ============================================================
// RELATIONSHIPS
// ============================================================

async function loadRelationships() {
    const results =
        await Promise.all([
            loadIssueTypes(),
            loadTools(),
            loadTroubleshootingTemplates()
        ]);

    renderRelationshipsComponent();
}

async function loadIssueTypes() {
    try {
        relatedIssueTypes =
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/issue-types`
            );

        return relatedIssueTypes;

    } catch (error) {
        console.error(
            "Error loading related Issue Types:",
            error
        );

        relatedIssueTypes = [];

        return [];
    }
}

async function loadTools() {
    try {
        relatedTools =
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/tools`
            );

        return relatedTools;

    } catch (error) {
        console.error(
            "Error loading related Tools:",
            error
        );

        relatedTools = [];

        return [];
    }
}

async function loadTroubleshootingTemplates() {
    try {
        relatedTroubleshootingTemplates =
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates`
            );

        return relatedTroubleshootingTemplates;

    } catch (error) {
        console.error(
            "Error loading related Troubleshooting Templates:",
            error
        );

        relatedTroubleshootingTemplates = [];

        return [];
    }
}

function renderRelationshipsComponent() {
    renderRelationships({
        containerId: "relationships",

        relationships: [
            // ==================================================
            // ISSUE TYPES
            // ==================================================

            {
                title: "Issue Types",
                expanded: false,
                entityLabel: "Issue Type",
                addLabel: "Add Issue Type",
                items: relatedIssueTypes || [],

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
                    openAddRelationshipModal(
                        "issueType"
                    );
                },

                onCreate: () => {
                    openRelationshipItemModal({
                        mode: "create",
                        relationship: "issueType"
                    });
                },

                onView: (item) => {
                    window.location.href =
                        `issue-type-detail.html?id=${item.id}`;
                },

                onEdit: (item) => {
                    openRelationshipItemModal({
                        mode: "edit",
                        relationship: "issueType",
                        item: item
                    });
                },

                onRemove: (item) => {
                    openRemoveRelationshipModal(
                        "issueType",
                        item
                    );
                }
            },

            // ==================================================
            // TOOLS
            // ==================================================

            {
                title: "Tools",
                expanded: false,
                entityLabel: "Tool",
                addLabel: "Add Tool",
                items: relatedTools || [],

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
                    openAddRelationshipModal(
                        "tool"
                    );
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
                    openRemoveRelationshipModal(
                        "tool",
                        item
                    );
                }
            },

            // ==================================================
            // TROUBLESHOOTING TEMPLATES
            // ==================================================

            {
                title: "Troubleshooting Templates",
                expanded: false,
                entityLabel: "Troubleshooting Template",
                addLabel: "Add Template",
                items:
                    relatedTroubleshootingTemplates || [],

                actions: {
                    view: true,
                    edit: true,
                    remove: true,
                    add: true,
                    create: true
                },

                getItemName: (item) =>
                    item.name ||
                    item.generated_description ||
                    `Template ${item.id}`,

                onAdd: () => {
                    openAddRelationshipModal(
                        "troubleshootingTemplate"
                    );
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
                    openRemoveRelationshipModal(
                        "troubleshootingTemplate",
                        item
                    );
                }
            }
        ]
    });
}

// ============================================================
// API HELPER
// ============================================================

async function knowledgeBaseFetch(
    endpoint,
    options = {}
) {
    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                }
            }
        );

    if (!response.ok) {
        let errorMessage =
            "Request failed.";

        try {
            const errorData =
                await response.json();

            errorMessage =
                errorData.detail ||
                errorMessage;

        } catch (error) {
            // Ignore JSON parsing errors.
        }

        throw new Error(
            errorMessage
        );
    }

    return response.json();
}

// ============================================================
// ADD EXISTING RELATIONSHIP
// ============================================================

async function openAddRelationshipModal(
    relationship
) {
    const configs = {
        issueType: {
            label: "Issue Type",
            getAll: getIssueTypes,
            related: relatedIssueTypes
        },

        tool: {
            label: "Tool",
            getAll: getTools,
            related: relatedTools
        },

        troubleshootingTemplate: {
            label: "Troubleshooting Template",
            getAll:
                getTroubleshootingTemplates,
            related:
                relatedTroubleshootingTemplates
        }
    };

    const config =
        configs[relationship];

    if (!config) {
        showErrorMessage(
            "Unsupported relationship."
        );

        return;
    }

    try {
        const allItems =
            await config.getAll();

        const relatedIds =
            new Set(
                config.related.map(
                    item => item.id
                )
            );

        const available =
            allItems.filter(
                item =>
                    !relatedIds.has(item.id)
            );

        if (available.length === 0) {
            showInfoMessage(
                `There are no available ${config.label}s to add.`
            );

            return;
        }

        const options =
            available
                .map(item => `
                    <option value="${escapeKnowledgeBaseAttribute(item.id)}">
                        ${escapeKnowledgeBaseHtml(
                            getRelationshipDisplayName(
                                relationship,
                                item
                            )
                        )}
                    </option>
                `)
                .join("");

        renderModal({
            containerId: "relationshipModal",

            title:
                `Add ${config.label}`,

            content: `
                <div class="form-group">
                    <label for="relationshipSelect">
                        ${escapeKnowledgeBaseHtml(
                            config.label
                        )}
                    </label>

                    <select
                        id="relationshipSelect"
                    >
                        ${options}
                    </select>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        id="cancelRelationshipButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveRelationshipButton"
                    >
                        Add
                    </button>
                </div>
            `,

            onClose:
                closeRelationshipModal
        });

        document
            .getElementById(
                "relationshipModal"
            )
            ?.classList.remove("hidden");

        document
            .getElementById(
                "cancelRelationshipButton"
            )
            ?.addEventListener(
                "click",
                closeRelationshipModal
            );

        document
            .getElementById(
                "saveRelationshipButton"
            )
            ?.addEventListener(
                "click",
                () =>
                    addExistingRelationship(
                        relationship
                    )
            );

    } catch (error) {
        console.error(
            `Error loading ${config.label}:`,
            error
        );

        showErrorMessage(
            `Error loading ${config.label}.`
        );
    }
}

async function addExistingRelationship(
    relationship
) {
    const itemId =
        document.getElementById(
            "relationshipSelect"
        )?.value;

    if (!itemId) {
        return;
    }

    const endpoints = {
        issueType:
            `/api/knowledge_base/${knowledgeBaseId}/issue-types/${itemId}`,

        tool:
            `/api/knowledge_base/${knowledgeBaseId}/tools/${itemId}`,

        troubleshootingTemplate:
            `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates/${itemId}`
    };

    try {
        await knowledgeBaseFetch(
            endpoints[relationship],
            {
                method: "POST"
            }
        );

        closeRelationshipModal();

        await loadRelationships();

        renderRelationshipsComponent();

        showSuccessMessage(
            "Relationship added successfully."
        );

    } catch (error) {
        console.error(
            "Error adding relationship:",
            error
        );

        showErrorMessage(
            "Error adding relationship."
        );
    }
}

// ============================================================
// CREATE / EDIT RELATIONSHIP ITEM
// ============================================================

function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {
    const configs = {
        issueType: {
            label: "Issue Type",
            create: createIssueType,
            update: updateIssueType,
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
                    type: "textarea",
                    required: true
                },
                {
                    key: "category",
                    label: "Category",
                    type: "text",
                    required: true
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
                    key: "form_template_id",
                    label: "Form Template ID",
                    type: "text"
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
            create: createTool,
            update: updateTool,
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
                    key: "is_active",
                    label: "Active",
                    type: "boolean"
                }
            ]
        },

        troubleshootingTemplate: {
            label: "Troubleshooting Template",
            create: createTroubleshootingTemplate,
            update: updateTroubleshootingTemplate,
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
        }
    };

    const config =
        configs[relationship];

    if (!config) {
        showErrorMessage(
            "Unsupported relationship."
        );
        return;
    }

    const title =
        mode === "create"
            ? `Create ${config.label}`
            : `Edit ${config.label}`;

    const fields =
        config.fields
            .map(field =>
                renderRelationshipField(
                    field,
                    item
                )
            )
            .join("");

    renderModal({
        containerId:
            "relationshipItemModal",
        title: title,
        content: `
            ${fields}

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRelationshipItemButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveRelationshipItemButton"
                >
                    ${
                        mode === "create"
                            ? "Create"
                            : "Save Changes"
                    }
                </button>
            </div>
        `,
        onClose:
            closeRelationshipItemModal
    });

    document
        .getElementById(
            "relationshipItemModal"
        )
        ?.classList.remove("hidden");

    document
        .getElementById(
            "cancelRelationshipItemButton"
        )
        ?.addEventListener(
            "click",
            closeRelationshipItemModal
        );

    document
        .getElementById(
            "saveRelationshipItemButton"
        )
        ?.addEventListener(
            "click",
            () =>
                saveRelationshipItem({
                    mode,
                    relationship,
                    item,
                    config
                })
        );
}

function renderRelationshipField(
    field,
    item
) {
    const value =
        item?.[field.key];

    if (field.type === "boolean") {
        const checked = value ?? true;

        return `
            <div class="checkbox-group">
                <input
                    type="checkbox"
                    id="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}"
                    ${checked ? "checked" : ""}
                >
                <label
                    for="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}"
                >
                    ${escapeKnowledgeBaseHtml(field.label)}
                </label>
            </div>
        `;
    }

    if (field.type === "textarea") {
        return `
            <div class="form-group">
                <label for="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}">
                    ${escapeKnowledgeBaseHtml(field.label)}
                </label>

                <textarea
                    id="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}"
                    rows="6"
                    ${field.required ? "required" : ""}
                >${escapeKnowledgeBaseHtml(value ?? "")}</textarea>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label for="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}">
                ${escapeKnowledgeBaseHtml(field.label)}
            </label>

            <input
                type="text"
                id="relationshipItem_${escapeKnowledgeBaseAttribute(field.key)}"
                value="${escapeKnowledgeBaseAttribute(value ?? "")}" 
                ${field.required ? "required" : ""}
            >
        </div>
    `;
}


async function saveRelationshipItem({
    mode,
    relationship,
    item,
    config
}) {
    const data = {};

    for (const field of config.fields) {
        const input =
            document.getElementById(
                `relationshipItem_${field.key}`
            );

        if (!input) {
            continue;
        }

        if (field.type === "boolean") {
            data[field.key] =
                input.checked;
        } else {
            data[field.key] =
                input.value.trim();
        }
    }

    const requiredFields = {
        issueType: [
            "name",
            "description",
            "category"
        ],

        tool: [
            "name",
            "description"
        ],

        troubleshootingTemplate: [
            "name",
            "generated_description",
            "steps"
        ]
    };

    for (
        const field of
        requiredFields[relationship] || []
    ) {
        if (!data[field]) {
            showWarningMessage(
                `${getKnowledgeBaseFieldLabel(field)} is required.`
            );

            document
                .getElementById(
                    `relationshipItem_${field}`
                )
                ?.focus();

            return;
        }
    }

    if (relationship === "issueType") {
        if (data.form_template_id === "") {
            data.form_template_id = null;
        } else {
            const formTemplateId =
                Number(data.form_template_id);

            if (
                Number.isNaN(formTemplateId)
            ) {
                showWarningMessage(
                    "Form Template ID must be a valid number."
                );
                return;
            }

            data.form_template_id =
                formTemplateId;
        }
    }

    try {
        let savedItem;

        if (mode === "create") {
            savedItem =
                await config.create(
                    data
                );

            await addCreatedRelationship(
                relationship,
                savedItem.id
            );

        } else {
            if (
                relationship === "issueType"
            ) {
                const currentIssueType =
                    await getIssueType(
                        item.id
                    );

                data.form_template_id =
                    data.form_template_id === ""
                        ? currentIssueType.form_template_id
                        : data.form_template_id;
            }

            savedItem =
                await config.update(
                    item.id,
                    data
                );
        }

        closeRelationshipItemModal();

        await loadRelationships();

        renderRelationshipsComponent();

        showSuccessMessage(
            `${config.label} ${
                mode === "create"
                    ? "created"
                    : "updated"
            } successfully.`
        );

    } catch (error) {
        console.error(
            `Error ${mode === "create" ? "creating" : "updating"} ${config.label}:`,
            error
        );

        showErrorMessage(
            `Error ${mode === "create" ? "creating" : "updating"} ${config.label.toLowerCase()}.`
        );
    }
}

async function addCreatedRelationship(
    relationship,
    itemId
) {
    const endpoints = {
        issueType:
            `/api/knowledge_base/${knowledgeBaseId}/issue-types/${itemId}`,

        tool:
            `/api/knowledge_base/${knowledgeBaseId}/tools/${itemId}`,

        troubleshootingTemplate:
            `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates/${itemId}`
    };

    await knowledgeBaseFetch(
        endpoints[relationship],
        {
            method: "POST"
        }
    );
}

// ============================================================
// REMOVE RELATIONSHIP
// ============================================================

function openRemoveRelationshipModal(
    relationship,
    item
) {
    const labels = {
        issueType: "Issue Type",
        tool: "Tool",
        troubleshootingTemplate:
            "Troubleshooting Template"
    };

    const label =
        labels[relationship] ||
        "relationship";

    const name =
        getRelationshipDisplayName(
            relationship,
            item
        );

    renderModal({
        containerId:
            "confirmationModal",

        title:
            `Remove ${label}`,

        content: `
            <p>
                Are you sure you want to remove
                <strong>
                    ${escapeKnowledgeBaseHtml(name)}
                </strong>
                from this Knowledge Base article?
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveRelationshipButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveRelationshipButton"
                >
                    Remove
                </button>
            </div>
        `,

        onClose:
            closeConfirmationModal
    });

    document
        .getElementById(
            "confirmationModal"
        )
        ?.classList.remove("hidden");

    document
        .getElementById(
            "cancelRemoveRelationshipButton"
        )
        ?.addEventListener(
            "click",
            closeConfirmationModal
        );

    document
        .getElementById(
            "confirmRemoveRelationshipButton"
        )
        ?.addEventListener(
            "click",
            () =>
                removeRelationship(
                    relationship,
                    item.id
                )
        );
}

async function removeRelationship(
    relationship,
    itemId
) {
    const endpoints = {
        issueType:
            `/api/knowledge_base/${knowledgeBaseId}/issue-types/${itemId}`,

        tool:
            `/api/knowledge_base/${knowledgeBaseId}/tools/${itemId}`,

        troubleshootingTemplate:
            `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates/${itemId}`
    };

    try {
        await knowledgeBaseFetch(
            endpoints[relationship],
            {
                method: "DELETE"
            }
        );

        closeConfirmationModal();

        await loadRelationships();

        renderRelationshipsComponent();

        showSuccessMessage(
            "Relationship removed successfully."
        );

    } catch (error) {
        console.error(
            "Error removing relationship:",
            error
        );

        showErrorMessage(
            "Error removing relationship."
        );
    }
}

// ============================================================
// MODALS
// ============================================================

function closeRelationshipModal() {
    document
        .getElementById(
            "relationshipModal"
        )
        ?.classList.add("hidden");
}

function closeRelationshipItemModal() {
    document
        .getElementById(
            "relationshipItemModal"
        )
        ?.classList.add("hidden");
}

function closeConfirmationModal() {
    document
        .getElementById(
            "confirmationModal"
        )
        ?.classList.add("hidden");
}

// ============================================================
// HELPERS
// ============================================================

function getRelationshipDisplayName(
    relationship,
    item
) {
    if (relationship === "troubleshootingTemplate") {
        return (
            item.name ||
            item.generated_description ||
            `Template ${item.id}`
        );
    }

    return item.name || "-";
}

function getKnowledgeBaseFieldLabel(
    field
) {
    const labels = {
        name: "Name",
        description: "Description",
        steps: "Steps",
        article_number: "Article Number",
        title: "Title",
        url: "URL"
    };

    return labels[field] || field;
}

function escapeKnowledgeBaseHtml(
    value
) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeKnowledgeBaseAttribute(
    value
) {
    return escapeKnowledgeBaseHtml(
        value
    );
}
