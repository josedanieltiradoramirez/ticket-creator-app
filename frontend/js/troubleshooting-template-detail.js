let templateId = null;
let currentTemplate = null;

let relatedIssueTypes = [];
let relatedTools = [];
let relatedKnowledgeBase = [];

let currentRelationship = null;
let currentRelationshipMode = null;
let currentRelationshipItem = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    const params =
        new URLSearchParams(window.location.search);

    templateId =
        Number(params.get("id"));

    if (!templateId) {
        showErrorMessage(
            "Invalid troubleshooting template ID."
        );

        window.location.href =
            "troubleshooting-templates.html";

        return;
    }

    await loadTemplate();
});


// ============================================================
// LOAD TEMPLATE
// ============================================================

async function loadTemplate() {
    try {
        currentTemplate =
            await getTroubleshootingTemplate(
                templateId
            );

        const [
            issueTypes,
            tools,
            knowledgeBase
        ] = await Promise.all([
            getTemplateIssueTypes(templateId),
            getTemplateTools(templateId),
            getTemplateKnowledgeBase(templateId)
        ]);

        relatedIssueTypes =
            issueTypes || [];

        relatedTools =
            tools || [];

        relatedKnowledgeBase =
            knowledgeBase || [];

        renderTemplate();
    } catch (error) {
        console.error(
            "Error loading troubleshooting template:",
            error
        );

        showErrorMessage(
            "Error loading troubleshooting template."
        );
    }
}


// ============================================================
// RENDER TEMPLATE
// ============================================================

function renderTemplate() {
    document.title =
        `${currentTemplate.name || "Troubleshooting Template"} - Troubleshooting Template`;

    renderTemplateHeader();
    renderTemplateBasicInformation();
    renderTemplateRelationships();
}


// ============================================================
// DETAIL HEADER
// ============================================================

function renderTemplateHeader() {
    renderDetailHeader({
        containerId: "detailHeader",
        type: "Troubleshooting Template",
        title:
            currentTemplate.name ||
            "Troubleshooting Template",
        description: "",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href =
                "troubleshooting-templates.html";
        }
    });
}


// ============================================================
// BASIC INFORMATION
// ============================================================

function renderTemplateBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",
        data: currentTemplate,
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
        expanded: true,
        onSave: async (updatedData) => {
            const data = {
                name:
                    String(
                        updatedData.name ?? ""
                    ).trim(),
                generated_description:
                    updatedData.generated_description,
                steps:
                    updatedData.steps,
                is_active:
                    Boolean(
                        updatedData.is_active
                    )
            };

            if (!data.name) {
                showWarningMessage(
                    "Name is required."
                );
                return;
            }

            if (!data.generated_description) {
                showWarningMessage(
                    "Description is required."
                );
                return;
            }

            if (!data.steps) {
                showWarningMessage(
                    "Troubleshooting Steps is required."
                );
                return;
            }

            try {
                const updatedTemplate =
                    await updateTroubleshootingTemplate(
                        templateId,
                        data
                    );

                Object.assign(
                    currentTemplate,
                    updatedTemplate || data
                );

                renderTemplateHeader();

                showSuccessMessage(
                    "Troubleshooting template updated successfully."
                );
            } catch (error) {
                console.error(
                    "Error updating troubleshooting template:",
                    error
                );

                showErrorMessage(
                    "Error updating troubleshooting template."
                );

                throw error;
            }
        }
    });
}


// ============================================================
// RELATIONSHIPS
// ============================================================

function renderTemplateRelationships() {
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
                    item.name || `Issue Type ${item.id}`,

                onAdd: () => {
                    openRelationshipItemModal({
                        mode: "add",
                        relationship: "issueType"
                    });
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
                    openRemoveRelationshipModal({
                        relationship: "issueType",
                        item: item
                    });
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
                    item.name || `Tool ${item.id}`,

                onAdd: () => {
                    openRelationshipItemModal({
                        mode: "add",
                        relationship: "tool"
                    });
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
                title: "Knowledge Base",
                expanded: false,
                entityLabel: "Knowledge Base",
                addLabel: "Add Knowledge Base",
                items: relatedKnowledgeBase || [],

                actions: {
                    view: true,
                    edit: true,
                    remove: true,
                    add: true,
                    create: true
                },

                getItemName: (item) =>
                    item.article_number
                        ? `${item.article_number} - ${item.title || ""}`
                        : item.title || `Knowledge Base ${item.id}`,

                onAdd: () => {
                    openRelationshipItemModal({
                        mode: "add",
                        relationship: "knowledgeBase"
                    });
                },

                onCreate: () => {
                    openRelationshipItemModal({
                        mode: "create",
                        relationship: "knowledgeBase"
                    });
                },

                onView: (item) => {
                    window.location.href =
                        `knowledge-base-detail.html?id=${item.id}`;
                },

                onEdit: (item) => {
                    openRelationshipItemModal({
                        mode: "edit",
                        relationship: "knowledgeBase",
                        item: item
                    });
                },

                onRemove: (item) => {
                    openRemoveRelationshipModal({
                        relationship: "knowledgeBase",
                        item: item
                    });
                }
            }
        ]
    });
}


// ============================================================
// RELATIONSHIP API
// ============================================================

async function templateFetch(
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
        let message =
            "Request failed.";

        try {
            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;
        } catch (error) {
            // Ignore JSON parsing errors.
        }

        throw new Error(message);
    }

    return response.json();
}


async function getTemplateIssueTypes(
    id
) {
    return templateFetch(
        `/api/troubleshooting_templates/${id}/issue-types`
    );
}


async function getTemplateTools(
    id
) {
    return templateFetch(
        `/api/troubleshooting_templates/${id}/tools`
    );
}


async function getTemplateKnowledgeBase(
    id
) {
    return templateFetch(
        `/api/troubleshooting_templates/${id}/knowledge-base`
    );
}


async function addTemplateIssueType(
    issueTypeId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/issue-types/${issueTypeId}`,
        {
            method: "POST"
        }
    );
}


async function removeTemplateIssueType(
    issueTypeId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/issue-types/${issueTypeId}`,
        {
            method: "DELETE"
        }
    );
}


async function addTemplateTool(
    toolId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/tools/${toolId}`,
        {
            method: "POST"
        }
    );
}


async function removeTemplateTool(
    toolId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/tools/${toolId}`,
        {
            method: "DELETE"
        }
    );
}


async function addTemplateKnowledgeBase(
    knowledgeBaseId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "POST"
        }
    );
}


async function removeTemplateKnowledgeBase(
    knowledgeBaseId
) {
    return templateFetch(
        `/api/troubleshooting_templates/${templateId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "DELETE"
        }
    );
}


// ============================================================
// RELATIONSHIP MODAL
// ============================================================

async function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {
    currentRelationshipMode =
        mode;

    currentRelationship =
        relationship;

    currentRelationshipItem =
        item;

    if (mode === "add") {
        await openAddRelationshipModal(
            relationship
        );

        return;
    }

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
                    key: "form_template_id",
                    label: "Form Template ID",
                    type: "text"
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

        knowledgeBase: {
            label: "Knowledge Base",
            create: createKnowledgeBaseItem,
            update: updateKnowledgeBaseItem,
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

    const data =
        item || {};

    const fieldsHtml =
        config.fields
            .map((field) =>
                renderRelationshipField(
                    field,
                    data[field.key]
                )
            )
            .join("");

    const title =
        mode === "create"
            ? `Create ${config.label}`
            : `Edit ${config.label}`;

    const content = `
        <div class="relationship-item-form">
            ${fieldsHtml}

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="relationshipItemCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="relationshipItemSaveButton"
                >
                    ${mode === "create" ? "Create" : "Save"}
                </button>
            </div>
        </div>
    `;

    renderModal({
        containerId: "relationshipModal",
        title: title,
        content: content,
        onClose: closeRelationshipModal
    });

    const modal =
        document.getElementById(
            "relationshipModal"
        );

    modal.classList.remove("hidden");

    document
        .getElementById(
            "relationshipItemCancelButton"
        )
        .addEventListener(
            "click",
            closeRelationshipModal
        );

    document
        .getElementById(
            "relationshipItemSaveButton"
        )
        .addEventListener(
            "click",
            saveRelationshipItem
        );
}


function renderRelationshipField(
    field,
    value
) {
    if (field.type === "boolean") {
        const checked =
            value ?? true;

        return `
            <div class="checkbox-group">
                <input
                    type="checkbox"
                    id="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
                    ${checked ? "checked" : ""}
                >
                <label
                    for="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
                >
                    ${escapeTroubleshootingHtml(field.label)}
                </label>
            </div>
        `;
    }

    if (field.type === "textarea") {
        return `
            <div class="form-group">
                <label
                    for="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
                >
                    ${escapeTroubleshootingHtml(field.label)}
                </label>

                <textarea
                    id="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
                    rows="6"
                    ${field.required ? "required" : ""}
                >${escapeTroubleshootingHtml(value ?? "")}</textarea>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label
                for="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
            >
                ${escapeTroubleshootingHtml(field.label)}
            </label>

            <input
                type="text"
                id="relationshipItem_${escapeTroubleshootingHtml(field.key)}"
                value="${escapeTroubleshootingHtml(value ?? "")}"
                ${field.required ? "required" : ""}
            >
        </div>
    `;
}


// ============================================================
// SAVE RELATIONSHIP ITEM
// ============================================================

async function saveRelationshipItem() {
    const configs = {
        issueType: {
            label: "Issue Type",
            create: createIssueType,
            update: updateIssueType,
            add: addTemplateIssueType
        },

        tool: {
            label: "Tool",
            create: createTool,
            update: updateTool,
            add: addTemplateTool
        },

        knowledgeBase: {
            label: "Knowledge Base",
            create: createKnowledgeBaseItem,
            update: updateKnowledgeBaseItem,
            add: addTemplateKnowledgeBase
        }
    };

    const config =
        configs[currentRelationship];

    if (!config) {
        showErrorMessage(
            "Unsupported relationship."
        );
        return;
    }

    const fieldsByRelationship = {
        issueType: [
            "name",
            "description",
            "form_template_id",
            "category",
            "display_name",
            "search_keywords",
            "is_active"
        ],

        tool: [
            "name",
            "description",
            "is_active"
        ],

        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ]
    };

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

        knowledgeBase: [
            "article_number",
            "title",
            "url",
            "description"
        ]
    };

    const data = {};

    for (
        const field of
        fieldsByRelationship[currentRelationship]
    ) {
        const input =
            document.getElementById(
                `relationshipItem_${field}`
            );

        if (!input) {
            continue;
        }

        if (input.type === "checkbox") {
            data[field] =
                input.checked;
        } else {
            data[field] =
                input.value.trim();
        }
    }

    for (
        const field of
        requiredFields[currentRelationship]
    ) {
        if (!data[field]) {
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

    if (
        currentRelationship === "issueType"
    ) {
        data.form_template_id =
            data.form_template_id === ""
                ? null
                : Number(
                    data.form_template_id
                );
    }

    try {
        if (
            currentRelationshipMode ===
            "create"
        ) {
            const createdItem =
                await config.create(
                    data
                );

            await config.add(
                createdItem.id
            );

            closeRelationshipModal();

            showSuccessMessage(
                `${config.label} created and added successfully.`
            );

            await loadTemplate();

            return;
        }

        if (
            currentRelationshipMode ===
            "edit"
        ) {
            let updateData =
                { ...data };

            if (
                currentRelationship ===
                "issueType"
            ) {
                const current =
                    await getIssueType(
                        currentRelationshipItem.id
                    );

                if (
                    updateData.form_template_id ===
                    null
                ) {
                    updateData.form_template_id =
                        current.form_template_id;
                }
            }

            await config.update(
                currentRelationshipItem.id,
                updateData
            );

            closeRelationshipModal();

            showSuccessMessage(
                `${config.label} updated successfully.`
            );

            await loadTemplate();
        }
    } catch (error) {
        console.error(
            `Error saving ${currentRelationship}:`,
            error
        );

        showErrorMessage(
            `Error saving ${config.label.toLowerCase()}.`
        );
    }
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
            loader: getIssueTypes,
            relatedItems: relatedIssueTypes
        },

        tool: {
            label: "Tool",
            loader: getTools,
            relatedItems: relatedTools
        },

        knowledgeBase: {
            label: "Knowledge Base",
            loader: getKnowledgeBaseItems,
            relatedItems: relatedKnowledgeBase
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
            await config.loader();

        const relatedIds =
            new Set(
                (config.relatedItems || [])
                    .map(item => Number(item.id))
            );

        const availableItems =
            (allItems || [])
                .filter(
                    item =>
                        !relatedIds.has(
                            Number(item.id)
                        )
                );

        const options =
            availableItems.length > 0
                ? availableItems
                    .map(item => `
                        <option value="${item.id}">
                            ${escapeTroubleshootingHtml(
                                getRelationshipItemName(
                                    relationship,
                                    item
                                )
                            )}
                        </option>
                    `)
                    .join("")
                : `
                    <option value="">
                        No available ${escapeTroubleshootingHtml(
                            config.label.toLowerCase()
                        )}s
                    </option>
                `;

        const content = `
            <div class="form-group">
                <label
                    for="relationshipAddSelect"
                >
                    ${escapeTroubleshootingHtml(
                        config.label
                    )}
                </label>

                <select
                    id="relationshipAddSelect"
                    ${availableItems.length === 0 ? "disabled" : ""}
                >
                    ${options}
                </select>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    class="secondary-button"
                    id="relationshipAddCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="relationshipAddSaveButton"
                    ${availableItems.length === 0 ? "disabled" : ""}
                >
                    Add
                </button>
            </div>
        `;

        renderModal({
            containerId: "relationshipModal",
            title: `Add ${config.label}`,
            content: content,
            onClose: closeRelationshipModal
        });

        document
            .getElementById(
                "relationshipModal"
            )
            .classList
            .remove("hidden");

        document
            .getElementById(
                "relationshipAddCancelButton"
            )
            .addEventListener(
                "click",
                closeRelationshipModal
            );

        document
            .getElementById(
                "relationshipAddSaveButton"
            )
            .addEventListener(
                "click",
                async () => {
                    const select =
                        document.getElementById(
                            "relationshipAddSelect"
                        );

                    if (!select?.value) {
                        showWarningMessage(
                            `Select a ${config.label.toLowerCase()}.`
                        );
                        return;
                    }

                    try {
                        if (
                            relationship ===
                            "issueType"
                        ) {
                            await addTemplateIssueType(
                                Number(select.value)
                            );
                        } else if (
                            relationship ===
                            "tool"
                        ) {
                            await addTemplateTool(
                                Number(select.value)
                            );
                        } else if (
                            relationship ===
                            "knowledgeBase"
                        ) {
                            await addTemplateKnowledgeBase(
                                Number(select.value)
                            );
                        }

                        closeRelationshipModal();

                        showSuccessMessage(
                            `${config.label} added successfully.`
                        );

                        await loadTemplate();
                    } catch (error) {
                        console.error(
                            "Error adding relationship:",
                            error
                        );

                        showErrorMessage(
                            `Error adding ${config.label.toLowerCase()}.`
                        );
                    }
                }
            );
    } catch (error) {
        console.error(
            "Error loading available relationships:",
            error
        );

        showErrorMessage(
            `Error loading ${config.label.toLowerCase()}s.`
        );
    }
}


// ============================================================
// REMOVE RELATIONSHIP
// ============================================================

function openRemoveRelationshipModal({
    relationship,
    item
}) {
    const configs = {
        issueType: {
            label: "Issue Type",
            remove: removeTemplateIssueType
        },

        tool: {
            label: "Tool",
            remove: removeTemplateTool
        },

        knowledgeBase: {
            label: "Knowledge Base",
            remove: removeTemplateKnowledgeBase
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

    const itemName =
        getRelationshipItemName(
            relationship,
            item
        );

    const content = `
        <p>
            Are you sure you want to remove
            <strong>
                ${escapeTroubleshootingHtml(itemName)}
            </strong>
            from this troubleshooting template?
        </p>

        <div class="modal-actions">
            <button
                type="button"
                class="secondary-button"
                id="removeRelationshipCancelButton"
            >
                Cancel
            </button>

            <button
                type="button"
                class="danger-button"
                id="removeRelationshipConfirmButton"
            >
                Remove
            </button>
        </div>
    `;

    renderModal({
        containerId: "confirmationModal",
        title: `Remove ${config.label}`,
        content: content,
        onClose: closeConfirmationModal
    });

    document
        .getElementById(
            "confirmationModal"
        )
        .classList
        .remove("hidden");

    document
        .getElementById(
            "removeRelationshipCancelButton"
        )
        .addEventListener(
            "click",
            closeConfirmationModal
        );

    document
        .getElementById(
            "removeRelationshipConfirmButton"
        )
        .addEventListener(
            "click",
            async () => {
                try {
                    await config.remove(
                        Number(item.id)
                    );

                    closeConfirmationModal();

                    showSuccessMessage(
                        `${config.label} removed successfully.`
                    );

                    await loadTemplate();
                } catch (error) {
                    console.error(
                        "Error removing relationship:",
                        error
                    );

                    showErrorMessage(
                        `Error removing ${config.label.toLowerCase()}.`
                    );
                }
            }
        );
}


// ============================================================
// MODAL HELPERS
// ============================================================

function closeRelationshipModal() {
    const container =
        document.getElementById(
            "relationshipModal"
        );

    if (!container) {
        return;
    }

    container.classList.add("hidden");
    container.innerHTML = "";

    currentRelationship = null;
    currentRelationshipMode = null;
    currentRelationshipItem = null;
}


function closeConfirmationModal() {
    const container =
        document.getElementById(
            "confirmationModal"
        );

    if (!container) {
        return;
    }

    container.classList.add("hidden");
    container.innerHTML = "";
}


// ============================================================
// RELATIONSHIP HELPERS
// ============================================================

function getRelationshipItemName(
    relationship,
    item
) {
    if (relationship === "knowledgeBase") {
        return item.article_number
            ? `${item.article_number} - ${item.title || ""}`
            : item.title ||
                `Knowledge Base ${item.id}`;
    }

    return (
        item.name ||
        item.generated_description ||
        `${relationship} ${item.id}`
    );
}


function getRelationshipFieldLabel(
    field
) {
    const labels = {
        name: "Name",
        description: "Description",
        form_template_id: "Form Template ID",
        category: "Category",
        display_name: "Display Name",
        search_keywords: "Search Keywords",
        is_active: "Active",
        article_number: "Article Number",
        title: "Title",
        url: "URL"
    };

    return (
        labels[field] ||
        field
    );
}


function escapeTroubleshootingHtml(
    value
) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
