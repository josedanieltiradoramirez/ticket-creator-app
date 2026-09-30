let issueTypeId = null;

let currentIssueType = null;


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


        try {

            setupEventListeners();

        } catch (error) {

            console.error(
                "Error setting up Issue Type event listeners:",
                error
            );

        }

    }
);


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // ========================================================
    // QUEUE MODAL
    // ========================================================


    // ========================================================
    // TOOL MODAL
    // ========================================================



    // ========================================================
    // TROUBLESHOOTING TEMPLATE MODAL
    // ========================================================



    // ========================================================
    // KNOWLEDGE BASE MODAL
    // ========================================================


    // ========================================================
    // KNOWLEDGE BASE NOTE MODAL
    // ========================================================


    // ========================================================
    // FORM MODAL
    // ========================================================

}

// ============================================================
// LOAD ISSUE TYPE
// ============================================================

async function loadIssueTypeDetail() {

    try {

        currentIssueType =
            await getIssueType(
                issueTypeId
            );
            
        console.log(
            "CURRENT ISSUE TYPE:",
            currentIssueType
        );

        renderDetailHeader({
            containerId: "detailHeader",
            type: "Issue Type",
            title: currentIssueType.name,
            description: currentIssueType.description
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

async function loadRelationships() {

    try {

        const [
            queues,
            tools,
            troubleshootingTemplates,
            knowledgeBase,
            knowledgeBaseNotes
        ] = await Promise.all([

            getIssueTypeQueues(
                issueTypeId
            ),

            getIssueTypeTools(
                issueTypeId
            ),

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


        renderRelationships({
            containerId: "relationships",

            relationships: [

                // ==================================================
                // QUEUES
                // ==================================================

                {
                    title: "Queues",

                    addLabel: "Add Queue",

                    items: queues || [],

                    actions: {
                        view: true,
                        edit: false,
                        remove: true
                    },

                    getItemName: (item) =>
                        item.name || "-",

                    onAdd: () => {
                        openQueueModal();
                    },

                    onView: (item) => {
                        window.location.href =
                            `queue-detail.html?id=${item.id}`;
                    },

                    onEdit: (item) => {
                        window.location.href =
                            `queue-detail.html?id=${item.id}`;
                    },

                    onRemove: async (item) => {

                        await removeQueue(
                            item.id
                        );

                    }
                },


                // ==================================================
                // TOOLS
                // ==================================================

                {
                    title: "Tools",

                    addLabel: "Add Tool",

                    items: tools || [],

                    getItemName: (item) =>
                        item.name || "-",

                    onAdd: () => {
                        openToolModal();
                    },

                    onView: (item) => {
                        window.location.href =
                            `tool-detail.html?id=${item.id}`;
                    },

                    onEdit: (item) => {
                        window.location.href =
                            `tool-detail.html?id=${item.id}`;
                    },

                    onRemove: async (item) => {

                        await removeTool(
                            item.id
                        );

                    }
                },


                // ==================================================
                // TROUBLESHOOTING TEMPLATES
                // ==================================================

                {
                    title: "Troubleshooting Templates",

                    addLabel: "Add Template",

                    items:
                        troubleshootingTemplates || [],

                    getItemName: (item) =>
                        item.name || "-",

                    onAdd: () => {
                        openTroubleshootingTemplateModal();
                    },

                    onView: (item) => {
                        window.location.href =
                            `troubleshooting-template-detail.html?id=${item.id}`;
                    },

                    onEdit: (item) => {
                        window.location.href =
                            `troubleshooting-template-detail.html?id=${item.id}`;
                    },

                    onRemove: async (item) => {

                        await removeTroubleshootingTemplate(
                            item.id
                        );

                    }
                },


                // ==================================================
                // KNOWLEDGE BASE
                // ==================================================

                {
                    title: "Knowledge Base",

                    addLabel: "Add Knowledge Base",

                    items:
                        knowledgeBase || [],

                    getItemName: (item) =>
                        item.article_number
                            ? `${item.article_number} - ${item.title}`
                            : item.title || "-",

                    onAdd: () => {
                        openKnowledgeBaseModal();
                    },

                    onView: (item) => {
                        window.location.href =
                            `knowledge-base-detail.html?id=${item.id}`;
                    },

                    onEdit: (item) => {
                        window.location.href =
                            `knowledge-base-detail.html?id=${item.id}`;
                    },

                    onRemove: async (item) => {

                        await removeKnowledgeBase(
                            item.id
                        );

                    }
                },


                // ==================================================
                // KNOWLEDGE BASE NOTES
                // ==================================================

                {
                    title: "Knowledge Base Notes",

                    addLabel: "Add Note",

                    items:
                        knowledgeBaseNotes || [],

                    getItemName: (item) =>
                        item.category
                            ? `${item.title} - ${item.category}`
                            : item.title || "-",

                    onAdd: () => {
                        openKnowledgeBaseNoteModal();
                    },

                    onView: (item) => {
                        window.location.href =
                            `knowledge-base-note-detail.html?id=${item.id}`;
                    },

                    onEdit: (item) => {
                        window.location.href =
                            `knowledge-base-note-detail.html?id=${item.id}`;
                    },

                    onRemove: async (item) => {

                        await removeKnowledgeBaseNote(
                            item.id
                        );

                    }
                }

            ]

        });

    } catch (error) {

        console.error(
            "Error loading relationships:",
            error
        );

    }

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

        onSave: async (updatedData) => {
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

        console.log("FORM RESPONSE:", forms);

        const form =
            forms && forms.length > 0
                ? forms[0]
                : null;


        renderFormSection({

            containerId: "formSection",

            form: form,

            onChange: () => {
                openChangeFormModal();
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

            onChange: () => {
                openChangeFormModal();
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
// QUEUES
// ============================================================

async function loadQueues() {

    const tableBody =
        document.getElementById(
            "queuesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "queuesEmptyMessage"
        );


    try {

        const queues =
            await getIssueTypeQueues(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !queues ||
            queues.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        queues.forEach(queue => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        queue.name || "-"
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeQueue(${queue.id})"
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
            "Error loading queues:",
            error
        );

        emptyMessage.style.display =
            "block";

    }

}


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

async function removeQueue(
    queueId
) {

    if (
        !confirm(
            "Remove this queue from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeQueue(
            issueTypeId,
            queueId
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error removing queue:",
            error
        );

        showErrorMessage(
            "Error removing queue."
        );

    }

}


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
            await getIssueTypeTools(
                issueTypeId
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
                    ${escapeHtml(
                        tool.description || "-"
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        tool.is_active
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

async function removeTool(
    toolId
) {

    if (
        !confirm(
            "Remove this tool from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeTool(
            issueTypeId,
            toolId
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error removing tool:",
            error
        );

        showErrorMessage(
            "Error removing tool."
        );

    }

}


// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function loadTroubleshootingTemplates() {

    const tableBody =
        document.getElementById(
            "troubleshootingTemplatesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "troubleshootingTemplatesEmptyMessage"
        );


    try {

        const templates =
            await getIssueTypeTroubleshootingTemplates(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !templates ||
            templates.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        templates.forEach(template => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        template.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        template.generated_description || "-"
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        template.is_active
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeTroubleshootingTemplate(${template.id})"
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
            "Error loading troubleshooting templates:",
            error
        );

        emptyMessage.style.display =
            "block";

    }

}


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

async function removeTroubleshootingTemplate(
    templateId
) {

    if (
        !confirm(
            "Remove this troubleshooting template from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeTroubleshootingTemplate(
            issueTypeId,
            templateId
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error removing troubleshooting template:",
            error
        );

        showErrorMessage(
            "Error removing troubleshooting template."
        );

    }

}


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

async function loadKnowledgeBase() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "knowledgeBaseEmptyMessage"
        );


    try {

        const knowledgeBase =
            await getIssueTypeKnowledgeBase(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        knowledgeBase.forEach(kb => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        kb.article_number || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        kb.title || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        kb.description || "-"
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeKnowledgeBase(${kb.id})"
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
            "Error loading knowledge base:",
            error
        );

        emptyMessage.style.display =
            "block";

    }

}


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

async function removeKnowledgeBase(
    knowledgeBaseId
) {

    if (
        !confirm(
            "Remove this Knowledge Base article from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeKnowledgeBase(
            issueTypeId,
            knowledgeBaseId
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error removing knowledge base:",
            error
        );

        showErrorMessage(
            "Error removing Knowledge Base."
        );

    }

}


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

async function loadKnowledgeBaseNotes() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseNotesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "knowledgeBaseNotesEmptyMessage"
        );


    try {

        const notes =
            await getIssueTypeKnowledgeBaseNotes(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !notes ||
            notes.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        notes.forEach(note => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        note.title || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        note.category || "-"
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        note.is_active
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeKnowledgeBaseNote(${note.id})"
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
            "Error loading knowledge base notes:",
            error
        );

        emptyMessage.style.display =
            "block";

    }

}


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

async function removeKnowledgeBaseNote(
    noteId
) {

    if (
        !confirm(
            "Remove this Knowledge Base Note from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeKnowledgeBaseNote(
            issueTypeId,
            noteId
        );


        await loadRelationships();

    } catch (error) {

        console.error(
            "Error removing knowledge base note:",
            error
        );

        showErrorMessage(
            "Error removing Knowledge Base Note."
        );

    }

}


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