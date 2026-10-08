// ============================================================
// KNOWLEDGE BASE NOTE DETAIL
// ============================================================

let noteId = null;
let currentNote = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        noteId =
            params.get("id");

        if (!noteId) {

            console.error(
                "Knowledge Base Note ID is missing."
            );

            showErrorMessage(
                "Knowledge Base Note ID is missing."
            );

            return;
        }

        setupNavigation();

        await loadNoteDetail();
    }
);


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const navigationItems = {

        tickets:
            "tickets.html",

        tools:
            "tools.html",

        locations:
            "locations.html",

        queues:
            "queues.html",

        wms:
            "wms.html",

        forms:
            "forms.html",

        troubleshootingTemplates:
            "troubleshooting-templates.html",

        knowledgeBase:
            "knowledge-base.html",

        knowledgeBaseNotes:
            "knowledge-base-notes.html"
    };

    if (
        typeof renderNavigation ===
        "function"
    ) {
        renderNavigation({
            containerId:
                "appNavigation",
            items:
                navigationItems
        });
    }
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

        if (!currentNote) {

            showErrorMessage(
                "Knowledge Base Note not found."
            );

            return;
        }

        prepareDisplayValues();

        renderNoteDetailHeader();

        renderBasicInformation();

        renderNoteEditorSection();

        await loadRelationships();

    } catch (error) {

        console.error(
            "Error loading Knowledge Base Note:",
            error
        );

        showErrorMessage(
            "Error loading Knowledge Base Note."
        );
    }
}


// ============================================================
// PREPARE DISPLAY VALUES
// ============================================================

function prepareDisplayValues() {

    if (!currentNote) {
        return;
    }

    currentNote.created_at_display =
        formatDate(
            currentNote.created_at
        );

    currentNote.updated_at_display =
        formatDate(
            currentNote.updated_at
        );
}


// ============================================================
// DETAIL HEADER
// ============================================================

function renderNoteDetailHeader() {

    renderDetailHeader({

        containerId:
            "detailHeader",

        type:
            "Knowledge Base Note",

        title:
            currentNote.title,

        description:
            currentNote.category || "",

        actions: {
            back: true,
            edit: false
        },

        onBack: () => {

            window.location.href =
                "knowledge-base-notes.html";
        }
    });
}


// ============================================================
// BASIC INFORMATION
// ============================================================

function renderBasicInformation() {

    renderBasicInformationComponent({

        containerId:
            "basicInformation",

        fields: [

            {
                key:
                    "id",

                label:
                    "ID",

                type:
                    "text",

                readonly:
                    true
            },

            {
                key:
                    "title",

                label:
                    "Title",

                type:
                    "text"
            },

            {
                key:
                    "category",

                label:
                    "Category",

                type:
                    "text"
            },

            {
                key:
                    "is_pinned",

                label:
                    "Pinned",

                type:
                    "boolean"
            },

            {
                key:
                    "is_active",

                label:
                    "Status",

                type:
                    "boolean"
            },

            {
                key:
                    "created_by",

                label:
                    "Created By",

                type:
                    "text",

                readonly:
                    true
            },

            {
                key:
                    "created_at_display",

                label:
                    "Created At",

                type:
                    "text",

                readonly:
                    true
            },

            {
                key:
                    "updated_at_display",

                label:
                    "Updated At",

                type:
                    "text",

                readonly:
                    true
            }
        ],

        data:
            currentNote,

        onSave:
            async (
                updatedData
            ) => {

                const data = {

                    title:
                        updatedData.title,

                    category:
                        updatedData.category,

                    is_pinned:
                        updatedData.is_pinned,

                    is_active:
                        updatedData.is_active,

                    content:
                        currentNote.content
                };

                currentNote =
                    await updateKnowledgeBaseNote(
                        noteId,
                        data
                    );

                prepareDisplayValues();

                renderNoteDetailHeader();

                renderBasicInformation();

                renderNoteEditorSection();

                showSuccessMessage(
                    "Knowledge Base Note updated successfully."
                );
            }
    });
}


// ============================================================
// NOTE EDITOR
// ============================================================

function renderNoteEditorSection() {

    renderNoteEditor({

        containerId:
            "noteEditor",

        content:
            currentNote.content || "",

        onSave:
            async (
                newContent
            ) => {

                const data = {

                    title:
                        currentNote.title,

                    category:
                        currentNote.category,

                    is_pinned:
                        currentNote.is_pinned,

                    is_active:
                        currentNote.is_active,

                    content:
                        newContent
                };

                currentNote =
                    await updateKnowledgeBaseNote(
                        noteId,
                        data
                    );

                prepareDisplayValues();

                renderNoteDetailHeader();

                showSuccessMessage(
                    "Note content updated successfully."
                );
            }
    });
}


// ============================================================
// LOAD RELATIONSHIPS
// ============================================================

async function loadRelationships() {

    const relationshipsContainer =
        document.getElementById(
            "relationships"
        );

    if (!relationshipsContainer) {
        return;
    }

    try {

        const tools =
            await getKnowledgeBaseNoteTools(
                noteId
            );

        const issueTypes =
            await getKnowledgeBaseNoteIssueTypes(
                noteId
            );

        const relationshipSections = [

            {
                title:
                    "Tools",

                entityLabel:
                    "Tool",

                items:
                    tools || [],

                addLabel:
                    "Add Tool",

                expanded:
                    true,

                actions: {

                    view:
                        true,

                    edit:
                        true,

                    remove:
                        true,

                    add:
                        true,

                    create:
                        true
                },

                getItemName:
                    (item) =>
                        item.name || "-",

                onView:
                    (item) => {

                        window.location.href =
                            `tool-detail.html?id=${item.id}`;
                    },

                onEdit:
                    (item) => {

                        openRelationshipItemModal({
                            mode:
                                "edit",

                            relationship:
                                "tool",

                            item:
                                item
                        });
                    },

                onRemove:
                    (item) => {

                        openRemoveRelationshipModal({
                            relationship:
                                "tool",

                            item:
                                item
                        });
                    },

                onAdd:
                    () => {

                        openToolModal();
                    },

                onCreate:
                    () => {

                        openRelationshipItemModal({
                            mode:
                                "create",

                            relationship:
                                "tool",

                            item:
                                null
                        });
                    }
            },


            {
                title:
                    "Issue Types",

                entityLabel:
                    "Issue Type",

                items:
                    issueTypes || [],

                addLabel:
                    "Add Issue Type",

                expanded:
                    true,

                actions: {

                    view:
                        true,

                    edit:
                        true,

                    remove:
                        true,

                    add:
                        true,

                    create:
                        true
                },

                getItemName:
                    (item) =>
                        item.name || "-",

                onView:
                    (item) => {

                        window.location.href =
                            `issue-type-detail.html?id=${item.id}`;
                    },

                onEdit:
                    (item) => {

                        openRelationshipItemModal({
                            mode:
                                "edit",

                            relationship:
                                "issueType",

                            item:
                                item
                        });
                    },

                onRemove:
                    (item) => {

                        openRemoveRelationshipModal({
                            relationship:
                                "issueType",

                            item:
                                item
                        });
                    },

                onAdd:
                    () => {

                        openIssueTypeModal();
                    },

                onCreate:
                    () => {

                        openRelationshipItemModal({
                            mode:
                                "create",

                            relationship:
                                "issueType",

                            item:
                                null
                        });
                    }
            }
        ];

        renderRelationships({

            containerId:
                "relationships",

            relationships:
                relationshipSections,

            expanded:
                true
        });

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


// ============================================================
// OPEN RELATIONSHIP ITEM MODAL
// ============================================================

async function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {

    const isEdit =
        mode === "edit";

    const isCreate =
        mode === "create";

    let modalTitle = "";

    let fields = [];

    if (relationship === "tool") {

        modalTitle =
            isEdit
                ? "Edit Tool"
                : "Create Tool";

        fields = [

            {
                key:
                    "name",

                label:
                    "Name",

                type:
                    "text",

                required:
                    true
            },

            {
                key:
                    "description",

                label:
                    "Description",

                type:
                    "textarea"
            },

            {
                key:
                    "access_request",

                label:
                    "Access Request",

                type:
                    "textarea"
            },

            {
                key:
                    "password_reset",

                label:
                    "Password Reset",

                type:
                    "textarea"
            },

            {
                key:
                    "is_active",

                label:
                    "Active",

                type:
                    "boolean"
            }
        ];
    }

    else if (
        relationship === "issueType"
    ) {

        modalTitle =
            isEdit
                ? "Edit Issue Type"
                : "Create Issue Type";

        fields = [

            {
                key:
                    "name",

                label:
                    "Name",

                type:
                    "text",

                required:
                    true
            },

            {
                key:
                    "description",

                label:
                    "Description",

                type:
                    "textarea"
            },

            {
                key:
                    "form_template_id",

                label:
                    "Form Template ID",

                type:
                    "number"
            },

            {
                key:
                    "category",

                label:
                    "Category",

                type:
                    "text"
            },

            {
                key:
                    "display_name",

                label:
                    "Display Name",

                type:
                    "text"
            },

            {
                key:
                    "search_keywords",

                label:
                    "Search Keywords",

                type:
                    "text"
            },

            {
                key:
                    "is_active",

                label:
                    "Active",

                type:
                    "boolean"
            }
        ];
    }

    else {

        console.error(
            `Unsupported relationship: ${relationship}`
        );

        return;
    }

    const fieldsHtml =
        fields
            .map(
                (
                    field
                ) => {

                    const value =
                        item?.[
                            field.key
                        ];

                    return renderRelationshipField(
                        field,
                        value
                    );
                }
            )
            .join("");

    const content = `
        <form
            id="relationshipItemForm"
            class="relationship-item-form"
        >

            <div class="modal-form-fields">
                ${fieldsHtml}
            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="relationshipItemCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                    id="relationshipItemSaveButton"
                >
                    ${
                        isEdit
                            ? "Save"
                            : "Create"
                    }
                </button>

            </div>

        </form>
    `;

    renderModal({

        containerId:
            "relationshipItemModal",

        title:
            modalTitle,

        content:
            content,

        onClose:
            closeRelationshipItemModal
    });

    const modal =
        document.getElementById(
            "relationshipItemModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    // ========================================================
    // CANCEL
    // ========================================================

    const cancelButton =
        modal.querySelector(
            "#relationshipItemCancelButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {
                closeRelationshipItemModal();
            }
        );
    }

    // ========================================================
    // FORM SUBMIT
    // ========================================================

    const form =
        modal.querySelector(
            "#relationshipItemForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            async (
                event
            ) => {

                event.preventDefault();

                await saveRelationshipItem({
                    mode:
                        mode,

                    relationship:
                        relationship,

                    item:
                        item
                });
            }
        );
    }
}


// ============================================================
// RENDER RELATIONSHIP FIELD
// ============================================================

function renderRelationshipField(
    field,
    value
) {

    const safeValue =
        value ?? "";

    if (
        field.type ===
        "boolean"
    ) {

        const checked =
            value === true;

        return `
            <div class="modal-field">

                <label
                    for="relationship-${field.key}"
                >
                    ${escapeHtml(
                        field.label
                    )}
                </label>

                <div class="checkbox-group">

                    <input
                        type="checkbox"
                        id="relationship-${field.key}"
                        data-relationship-field="${field.key}"
                        ${
                            checked
                                ? "checked"
                                : ""
                        }
                    >

                    <label
                        for="relationship-${field.key}"
                    >
                        Active
                    </label>

                </div>

            </div>
        `;
    }

    if (
        field.type ===
        "textarea"
    ) {

        return `
            <div class="modal-field">

                <label
                    for="relationship-${field.key}"
                >
                    ${escapeHtml(
                        field.label
                    )}
                </label>

                <textarea
                    id="relationship-${field.key}"
                    data-relationship-field="${field.key}"
                    rows="5"
                    ${
                        field.required
                            ? "required"
                            : ""
                    }
                >${escapeHtml(
                    safeValue
                )}</textarea>

            </div>
        `;
    }

    return `
        <div class="modal-field">

            <label
                for="relationship-${field.key}"
            >
                ${escapeHtml(
                    field.label
                )}
                ${
                    field.required
                        ? `
                            <span class="required">
                                *
                            </span>
                        `
                        : ""
                }
            </label>

            <input
                type="${field.type || "text"}"
                id="relationship-${field.key}"
                data-relationship-field="${field.key}"
                value="${escapeHtml(
                    safeValue
                )}"
                ${
                    field.required
                        ? "required"
                        : ""
                }
            >

        </div>
    `;
}


// ============================================================
// SAVE RELATIONSHIP ITEM
// ============================================================

async function saveRelationshipItem({
    mode,
    relationship,
    item
}) {

    const modal =
        document.getElementById(
            "relationshipItemModal"
        );

    if (!modal) {
        return;
    }

    const configMap = {

        tool: {

            label:
                "Tool",

            create:
                createTool,

            update:
                updateTool,

            add:
                addKnowledgeBaseNoteTool
        },

        issueType: {

            label:
                "Issue Type",

            create:
                createIssueType,

            update:
                updateIssueType,

            add:
                addKnowledgeBaseNoteIssueType
        }
    };

    const config =
        configMap[
            relationship
        ];

    if (!config) {

        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );

        return;
    }

    const form =
        modal.querySelector(
            "#relationshipItemForm"
        );

    if (!form) {
        return;
    }

    const inputs =
        form.querySelectorAll(
            "[data-relationship-field]"
        );

    const payload = {};

    inputs.forEach(
        (
            input
        ) => {

            const key =
                input.dataset
                    .relationshipField;

            if (
                input.type ===
                "checkbox"
            ) {

                payload[key] =
                    input.checked;

            } else {

                payload[key] =
                    input.value.trim();
            }
        }
    );

    if (
        !payload.name
    ) {

        showErrorMessage(
            `${config.label} name is required.`
        );

        return;
    }

    if (
        payload.form_template_id ===
        ""
    ) {

        payload.form_template_id =
            null;
    }

    const saveButton =
        modal.querySelector(
            "#relationshipItemSaveButton"
        );

    if (saveButton) {
        saveButton.disabled =
            true;
    }

    try {

        let savedItem = null;

        if (
            mode ===
            "create"
        ) {

            savedItem =
                await config.create(
                    payload
                );

            if (
                savedItem?.id
            ) {

                await config.add(
                    noteId,
                    savedItem.id
                );
            }

            showSuccessMessage(
                `${config.label} created successfully.`
            );

        }

        else if (
            mode ===
            "edit"
        ) {

            savedItem =
                await config.update(
                    item.id,
                    payload
                );

            showSuccessMessage(
                `${config.label} updated successfully.`
            );

        }

        else {

            console.error(
                `Unsupported mode: ${mode}`
            );

            return;
        }

        closeRelationshipItemModal();

        await loadRelationships();

    } catch (error) {

        console.error(
            `Error saving ${config.label}:`,
            error
        );

        showErrorMessage(
            `Error saving ${config.label}.`
        );

    } finally {

        if (saveButton) {
            saveButton.disabled =
                false;
        }
    }
}


// ============================================================
// OPEN TOOL MODAL
// ============================================================

async function openToolModal() {

    try {

        const tools =
            await getTools();

        const relatedTools =
            await getKnowledgeBaseNoteTools(
                noteId
            );

        const relatedIds =
            new Set(
                relatedTools.map(
                    tool =>
                        Number(tool.id)
                )
            );

        const availableTools =
            tools.filter(
                tool =>
                    !relatedIds.has(
                        Number(tool.id)
                    )
            );

        const options =
            availableTools
                .map(
                    tool => `
                        <option
                            value="${tool.id}"
                        >
                            ${escapeHtml(
                                tool.name
                            )}
                        </option>
                    `
                )
                .join("");

        const content = `
            <div class="modal-field">

                <label
                    for="knowledgeBaseNoteToolSelect"
                >
                    Tool
                </label>

                <select
                    id="knowledgeBaseNoteToolSelect"
                >
                    <option value="">
                        Select a Tool
                    </option>

                    ${options}
                </select>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="knowledgeBaseNoteToolCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="knowledgeBaseNoteToolAddButton"
                >
                    Add
                </button>

            </div>
        `;

        renderModal({

            containerId:
                "relationshipItemModal",

            title:
                "Add Tool",

            content:
                content,

            onClose:
                closeRelationshipItemModal
        });

        const modal =
            document.getElementById(
                "relationshipItemModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "hidden"
        );

        const cancelButton =
            modal.querySelector(
                "#knowledgeBaseNoteToolCancelButton"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeRelationshipItemModal
            );
        }

        const addButton =
            modal.querySelector(
                "#knowledgeBaseNoteToolAddButton"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                addSelectedTool
            );
        }

    } catch (error) {

        console.error(
            "Error opening Tool modal:",
            error
        );

        showErrorMessage(
            "Error loading Tools."
        );
    }
}


// ============================================================
// ADD SELECTED TOOL
// ============================================================

async function addSelectedTool() {

    const select =
        document.getElementById(
            "knowledgeBaseNoteToolSelect"
        );

    if (!select) {
        return;
    }

    const toolId =
        select.value;

    if (!toolId) {

        showWarningMessage(
            "Please select a Tool."
        );

        return;
    }

    try {

        await addKnowledgeBaseNoteTool(
            noteId,
            Number(toolId)
        );

        closeRelationshipItemModal();

        await loadRelationships();

        showSuccessMessage(
            "Tool added successfully."
        );

    } catch (error) {

        console.error(
            "Error adding Tool:",
            error
        );

        showErrorMessage(
            "Error adding Tool."
        );
    }
}


// ============================================================
// OPEN ISSUE TYPE MODAL
// ============================================================

async function openIssueTypeModal() {

    try {

        const issueTypes =
            await getIssueTypes();

        const relatedIssueTypes =
            await getKnowledgeBaseNoteIssueTypes(
                noteId
            );

        const relatedIds =
            new Set(
                relatedIssueTypes.map(
                    issueType =>
                        Number(
                            issueType.id
                        )
                )
            );

        const availableIssueTypes =
            issueTypes.filter(
                issueType =>
                    !relatedIds.has(
                        Number(
                            issueType.id
                        )
                    )
            );

        const options =
            availableIssueTypes
                .map(
                    issueType => `
                        <option
                            value="${issueType.id}"
                        >
                            ${escapeHtml(
                                issueType.name
                            )}
                        </option>
                    `
                )
                .join("");

        const content = `
            <div class="modal-field">

                <label
                    for="knowledgeBaseNoteIssueTypeSelect"
                >
                    Issue Type
                </label>

                <select
                    id="knowledgeBaseNoteIssueTypeSelect"
                >
                    <option value="">
                        Select an Issue Type
                    </option>

                    ${options}
                </select>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="knowledgeBaseNoteIssueTypeCancelButton"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="knowledgeBaseNoteIssueTypeAddButton"
                >
                    Add
                </button>

            </div>
        `;

        renderModal({

            containerId:
                "relationshipItemModal",

            title:
                "Add Issue Type",

            content:
                content,

            onClose:
                closeRelationshipItemModal
        });

        const modal =
            document.getElementById(
                "relationshipItemModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "hidden"
        );

        const cancelButton =
            modal.querySelector(
                "#knowledgeBaseNoteIssueTypeCancelButton"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeRelationshipItemModal
            );
        }

        const addButton =
            modal.querySelector(
                "#knowledgeBaseNoteIssueTypeAddButton"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                addSelectedIssueType
            );
        }

    } catch (error) {

        console.error(
            "Error opening Issue Type modal:",
            error
        );

        showErrorMessage(
            "Error loading Issue Types."
        );
    }
}


// ============================================================
// ADD SELECTED ISSUE TYPE
// ============================================================

async function addSelectedIssueType() {

    const select =
        document.getElementById(
            "knowledgeBaseNoteIssueTypeSelect"
        );

    if (!select) {
        return;
    }

    const issueTypeId =
        select.value;

    if (!issueTypeId) {

        showWarningMessage(
            "Please select an Issue Type."
        );

        return;
    }

    try {

        await addKnowledgeBaseNoteIssueType(
            noteId,
            Number(issueTypeId)
        );

        closeRelationshipItemModal();

        await loadRelationships();

        showSuccessMessage(
            "Issue Type added successfully."
        );

    } catch (error) {

        console.error(
            "Error adding Issue Type:",
            error
        );

        showErrorMessage(
            "Error adding Issue Type."
        );
    }
}


// ============================================================
// OPEN REMOVE RELATIONSHIP MODAL
// ============================================================

function openRemoveRelationshipModal({
    relationship,
    item
}) {

    const labels = {

        tool:
            "Tool",

        issueType:
            "Issue Type"
    };

    const label =
        labels[
            relationship
        ];

    if (!label) {

        console.error(
            `Unsupported relationship: ${relationship}`
        );

        return;
    }

    const itemName =
        item?.name ||
        item?.title ||
        "this item";

    const content = `
        <p class="remove-confirmation-message">

            Are you sure you want to remove

            <strong>
                ${escapeHtml(
                    itemName
                )}
            </strong>

            from this Knowledge Base Note?

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

        containerId:
            "relationshipItemModal",

        title:
            `Remove ${label}`,

        content:
            content,

        onClose:
            closeRelationshipItemModal
    });

    const modal =
        document.getElementById(
            "relationshipItemModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    const cancelButton =
        modal.querySelector(
            "#removeRelationshipCancelButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeRelationshipItemModal
        );
    }

    const confirmButton =
        modal.querySelector(
            "#removeRelationshipConfirmButton"
        );

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async () => {

                await removeRelationshipItem({
                    relationship:
                        relationship,

                    item:
                        item
                });
            }
        );
    }
}


// ============================================================
// REMOVE RELATIONSHIP ITEM
// ============================================================

async function removeRelationshipItem({
    relationship,
    item
}) {

    const configs = {

        tool: {

            label:
                "Tool",

            remove:
                removeKnowledgeBaseNoteTool
        },

        issueType: {

            label:
                "Issue Type",

            remove:
                removeKnowledgeBaseNoteIssueType
        }
    };

    const config =
        configs[
            relationship
        ];

    if (!config) {

        showErrorMessage(
            `Unsupported relationship: ${relationship}.`
        );

        return;
    }

    if (!item?.id) {

        showErrorMessage(
            `${config.label} ID is missing.`
        );

        return;
    }

    try {

        await config.remove(
            noteId,
            item.id
        );

        closeRelationshipItemModal();

        await loadRelationships();

        showSuccessMessage(
            `${config.label} removed successfully.`
        );

    } catch (error) {

        console.error(
            `Error removing ${config.label}:`,
            error
        );

        showErrorMessage(
            `Error removing ${config.label}.`
        );
    }
}


// ============================================================
// CLOSE RELATIONSHIP MODAL
// ============================================================

function closeRelationshipItemModal() {

    const modal =
        document.getElementById(
            "relationshipItemModal"
        );

    if (!modal) {
        return;
    }

    modal.innerHTML =
        "";

    modal.classList.add(
        "hidden"
    );
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString();
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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