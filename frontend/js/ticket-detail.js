// ============================================================
// GLOBAL VARIABLES
// ============================================================

const params =
    new URLSearchParams(window.location.search);

const ticketId =
    params.get("id");


let troubleshootingTemplates = [];

let forms = [];

// KBs that the user explicitly marked as used
let usedKnowledgeBase = [];


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTicketPage();

    }
);


// ============================================================
// INITIALIZE PAGE
// ============================================================

async function initializeTicketPage() {

    setupEventListeners();

    await loadTicket();
}


// ============================================================
// LOAD TICKET
// ============================================================

async function loadTicket() {

    try {

        const ticket =
            await getTicket(ticketId);


        // ====================================================
        // LOAD USED KNOWLEDGE BASE
        // ====================================================

        await loadUsedKnowledgeBase();


        // ====================================================
        // BASIC SELECTS
        // ====================================================

        await loadPriorities(
            ticket.priority_id
        );

        await loadStatuses(
            ticket.status_id
        );

        await loadQueues(
            ticket.queue_id
        );

        await loadLocations(
            ticket.location_id
        );


        // ====================================================
        // TOOL
        // ====================================================

        await loadTools(
            ticket.tool_id
        );

        await loadToolKnowledgeBase(
            ticket.tool_id
        );


        // ====================================================
        // ISSUE TYPE
        // ====================================================

        await loadIssueTypes(
            ticket.issue_type_id
        );

        await loadIssueTypeKnowledgeBase(
            ticket.issue_type_id
        );


        // ====================================================
        // TROUBLESHOOTING TEMPLATES
        // ====================================================

        await loadTroubleshootingTemplates(
            ticket.issue_type_id,
            ticket.troubleshooting_template_id
        );


        // ====================================================
        // FORMS
        // ====================================================

        await loadForms(
            ticket.issue_type_id,
            ticket.form_template_id
        );


        // ====================================================
        // TICKET INFORMATION
        // ====================================================

        document.getElementById(
            "ticketNumber"
        ).value =
            ticket.ticket_number ?? "";


        document.getElementById(
            "ticketTitle"
        ).value =
            ticket.title ?? "";


        // ====================================================
        // USER
        // ====================================================

        document.getElementById(
            "userName"
        ).value =
            ticket.user_name ?? "";


        document.getElementById(
            "userEmail"
        ).value =
            ticket.user_email ?? "";


        document.getElementById(
            "userPhone"
        ).value =
            ticket.user_best_contact_number ?? "";


        document.getElementById(
            "userType"
        ).value =
            ticket.user_type ?? "";


        // ====================================================
        // ISSUE
        // ====================================================

        document.getElementById(
            "issueDescription"
        ).value =
            ticket.issue_description ?? "";


        // ====================================================
        // TROUBLESHOOTING
        // ====================================================

        document.getElementById(
            "troubleshootingSteps"
        ).value =
            ticket.troubleshooting_steps ?? "";


        // ====================================================
        // ADDITIONAL NOTES
        // ====================================================

        document.getElementById(
            "additionalNotes"
        ).value =
            ticket.additional_notes ?? "";


        // ====================================================
        // FORM CONTENT
        // ====================================================

        document.getElementById(
            "formContent"
        ).value =
            ticket.form_content ?? "";


        // ====================================================
        // CONFIGURATION
        // ====================================================

        document.getElementById(
            "knowledgeBase"
        ).textContent =
            ticket.knowledge_base?.title ?? "";


        // ====================================================
        // DATES
        // ====================================================

        document.getElementById(
            "createdAt"
        ).textContent =
            ticket.created_at
                ? new Date(
                    ticket.created_at
                ).toLocaleString()
                : "";


        document.getElementById(
            "updatedAt"
        ).textContent =
            ticket.updated_at
                ? new Date(
                    ticket.updated_at
                ).toLocaleString()
                : "";


        document.getElementById(
            "closedAt"
        ).textContent =
            ticket.closed_at
                ? new Date(
                    ticket.closed_at
                ).toLocaleString()
                : "Not closed";


    } catch (error) {

        console.error(
            "Error loading ticket:",
            error
        );

        alert(
            "Error loading ticket."
        );
    }
}


// ============================================================
// PRIORITIES
// ============================================================

async function loadPriorities(
    currentPriorityId
) {

    const priorities =
        await getPriorities();


    const prioritySelect =
        document.getElementById(
            "priority"
        );


    prioritySelect.innerHTML = "";


    priorities.forEach(
        priority => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                priority.id;

            option.textContent =
                priority.name;


            if (
                priority.id ===
                currentPriorityId
            ) {

                option.selected = true;
            }


            prioritySelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// STATUSES
// ============================================================

async function loadStatuses(
    currentStatusId
) {

    const statuses =
        await getTicketStatuses();


    const statusSelect =
        document.getElementById(
            "status"
        );


    statusSelect.innerHTML = "";


    statuses.forEach(
        status => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                status.id;

            option.textContent =
                status.name;


            if (
                status.id ===
                currentStatusId
            ) {

                option.selected = true;
            }


            statusSelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// QUEUES
// ============================================================

async function loadQueues(
    currentQueueId
) {

    const queues =
        await getQueues();


    const queueSelect =
        document.getElementById(
            "queue"
        );


    queueSelect.innerHTML = "";


    queues.forEach(
        queue => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                queue.id;

            option.textContent =
                queue.name;


            if (
                queue.id ===
                currentQueueId
            ) {

                option.selected = true;
            }


            queueSelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// TOOLS
// ============================================================

async function loadTools(
    currentToolId
) {

    const tools =
        await getTools();


    const toolSelect =
        document.getElementById(
            "tool"
        );


    toolSelect.innerHTML = "";


    tools.forEach(
        tool => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tool.id;

            option.textContent =
                tool.name;


            if (
                tool.id ===
                currentToolId
            ) {

                option.selected = true;
            }


            toolSelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// TOOL KNOWLEDGE BASE
// ============================================================

async function loadToolKnowledgeBase(
    toolId
) {

    const container =
        document.getElementById(
            "toolKnowledgeBase"
        );


    container.innerHTML = "";


    if (!toolId) {

        container.innerHTML =
            "<p>No Knowledge Base articles selected.</p>";

        return;
    }


    try {

        const knowledgeBase =
            await getToolKnowledgeBase(
                toolId
            );


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            container.innerHTML =
                "<p>No Knowledge Base articles associated.</p>";

            return;
        }


        knowledgeBase.forEach(
            kb => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.textContent =
                    `${kb.article_number} - ${kb.title}`;


                container.appendChild(
                    item
                );
            }
        );


    } catch (error) {

        console.error(
            "Error loading Tool KB:",
            error
        );

        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================
// LOCATIONS
// ============================================================

async function loadLocations(
    currentLocationId
) {

    const locations =
        await getLocations();


    const locationSelect =
        document.getElementById(
            "location"
        );


    locationSelect.innerHTML = "";


    locations.forEach(
        location => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                location.id;

            option.textContent =
                location.name;


            if (
                location.id ===
                currentLocationId
            ) {

                option.selected = true;
            }


            locationSelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// ISSUE TYPES
// ============================================================

async function loadIssueTypes(
    currentIssueTypeId
) {

    const issueTypes =
        await getIssueTypes();


    const issueTypeSelect =
        document.getElementById(
            "issueType"
        );


    issueTypeSelect.innerHTML = "";


    issueTypes.forEach(
        issueType => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                issueType.id;

            option.textContent =
                issueType.name;


            if (
                issueType.id ===
                currentIssueTypeId
            ) {

                option.selected = true;
            }


            issueTypeSelect.appendChild(
                option
            );
        }
    );
}


// ============================================================
// ISSUE TYPE KNOWLEDGE BASE
// ============================================================

async function loadIssueTypeKnowledgeBase(
    issueTypeId
) {

    const container =
        document.getElementById(
            "issueTypeKnowledgeBase"
        );


    container.innerHTML = "";


    if (!issueTypeId) {

        container.innerHTML =
            "<p>No Knowledge Base articles selected.</p>";

        return;
    }


    try {

        const knowledgeBase =
            await getIssueTypeKnowledgeBase(
                issueTypeId
            );


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            container.innerHTML =
                "<p>No Knowledge Base articles associated.</p>";

            return;
        }


        knowledgeBase.forEach(
            kb => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.textContent =
                    `${kb.article_number} - ${kb.title}`;


                container.appendChild(
                    item
                );
            }
        );


    } catch (error) {

        console.error(
            "Error loading Issue Type KB:",
            error
        );

        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function loadTroubleshootingTemplates(
    issueTypeId,
    currentTemplateId = null
) {

    const relatedTemplates =
        issueTypeId
            ? await getIssueTypeTroubleshootingTemplates(
                issueTypeId
            )
            : [];


    const allTemplates =
        await getTroubleshootingTemplates();


    troubleshootingTemplates =
        allTemplates;


    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );


    templateSelect.innerHTML = "";


    // Empty option

    const emptyOption =
        document.createElement(
            "option"
        );


    emptyOption.value = "";

    emptyOption.textContent =
        "Select a template";


    templateSelect.appendChild(
        emptyOption
    );


    // Related template IDs

    const relatedIds =
        new Set(
            relatedTemplates.map(
                template =>
                    template.id
            )
        );


    // Related templates

    if (
        relatedTemplates.length > 0
    ) {

        const relatedGroup =
            document.createElement(
                "optgroup"
            );


        relatedGroup.label =
            "Related";


        relatedTemplates.forEach(
            template => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    template.id;


                option.textContent =
                    template.name ??
                    template.generated_description ??
                    `Template ${template.id}`;


                if (
                    template.id ===
                    currentTemplateId
                ) {

                    option.selected =
                        true;
                }


                relatedGroup.appendChild(
                    option
                );
            }
        );


        templateSelect.appendChild(
            relatedGroup
        );
    }


    // Other templates

    const otherTemplates =
        allTemplates.filter(
            template =>
                !relatedIds.has(
                    template.id
                )
        );


    if (
        otherTemplates.length > 0
    ) {

        const allGroup =
            document.createElement(
                "optgroup"
            );


        allGroup.label =
            "All";


        otherTemplates.forEach(
            template => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    template.id;


                option.textContent =
                    template.name ??
                    template.generated_description ??
                    `Template ${template.id}`;


                if (
                    template.id ===
                    currentTemplateId
                ) {

                    option.selected =
                        true;
                }


                allGroup.appendChild(
                    option
                );
            }
        );


        templateSelect.appendChild(
            allGroup
        );
    }


    // Select first related template
    // only for a new ticket

    if (
        currentTemplateId === null &&
        relatedTemplates.length > 0
    ) {

        templateSelect.value =
            relatedTemplates[0].id;
    }


    await loadSelectedTemplate();
}


// ============================================================
// SELECTED TEMPLATE
// ============================================================

async function loadSelectedTemplate() {

    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );


    const templateId =
        templateSelect.value
            ? Number(
                templateSelect.value
            )
            : null;


    loadTemplatePreview();


    await loadTemplateKnowledgeBase(
        templateId
    );
}


// ============================================================
// TEMPLATE PREVIEW
// ============================================================

function loadTemplatePreview() {

    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );


    const preview =
        document.getElementById(
            "troubleshootingTemplatePreview"
        );


    const selectedTemplateId =
        templateSelect.value
            ? Number(
                templateSelect.value
            )
            : null;


    const selectedTemplate =
        troubleshootingTemplates.find(
            template =>
                template.id ===
                selectedTemplateId
        );


    if (selectedTemplate) {

        preview.value =
            selectedTemplate.steps ??
            selectedTemplate.generated_description ??
            "";

    } else {

        preview.value = "";
    }
}


// ============================================================
// TEMPLATE KNOWLEDGE BASE
// ============================================================

async function loadTemplateKnowledgeBase(
    templateId
) {

    const container =
        document.getElementById(
            "templateKnowledgeBase"
        );


    container.innerHTML = "";


    if (!templateId) {

        container.innerHTML =
            "<p>No Knowledge Base articles associated.</p>";

        return;
    }


    try {

        const knowledgeBase =
            await getTroubleshootingTemplateKnowledgeBase(
                templateId
            );


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            container.innerHTML =
                "<p>No Knowledge Base articles associated.</p>";

            return;
        }


        knowledgeBase.forEach(
            kb => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.textContent =
                    `${kb.article_number} - ${kb.title}`;


                container.appendChild(
                    item
                );
            }
        );


    } catch (error) {

        console.error(
            "Error loading Template KB:",
            error
        );

        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================
// FORMS
// ============================================================

async function loadForms(
    issueTypeId,
    currentFormId = null
) {

    const relatedForms =
        issueTypeId
            ? await getIssueTypeForm(
                issueTypeId
            )
            : [];


    const allForms =
        await getForms();


    forms =
        allForms;


    const formSelect =
        document.getElementById(
            "form"
        );


    formSelect.innerHTML = "";


    // Empty option

    const emptyOption =
        document.createElement(
            "option"
        );


    emptyOption.value = "";

    emptyOption.textContent =
        "Select a form";


    formSelect.appendChild(
        emptyOption
    );


    // Related forms

    if (
        relatedForms.length > 0
    ) {

        const relatedGroup =
            document.createElement(
                "optgroup"
            );


        relatedGroup.label =
            "Related";


        relatedForms.forEach(
            form => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    form.id;


                option.textContent =
                    form.name;


                if (
                    form.id ===
                    currentFormId
                ) {

                    option.selected =
                        true;
                }


                relatedGroup.appendChild(
                    option
                );
            }
        );


        formSelect.appendChild(
            relatedGroup
        );
    }


    // Related IDs

    const relatedIds =
        new Set(
            relatedForms.map(
                form =>
                    form.id
            )
        );


    // Other forms

    const otherForms =
        allForms.filter(
            form =>
                !relatedIds.has(
                    form.id
                )
        );


    if (
        otherForms.length > 0
    ) {

        const allGroup =
            document.createElement(
                "optgroup"
            );


        allGroup.label =
            "All";


        otherForms.forEach(
            form => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    form.id;


                option.textContent =
                    form.name;


                if (
                    form.id ===
                    currentFormId
                ) {

                    option.selected =
                        true;
                }


                allGroup.appendChild(
                    option
                );
            }
        );


        formSelect.appendChild(
            allGroup
        );
    }


    // Select first related form
    // only for a new ticket

    if (
        currentFormId === null &&
        relatedForms.length > 0
    ) {

        formSelect.value =
            relatedForms[0].id;
    }


    await loadSelectedForm(
        formSelect.value
    );
}


// ============================================================
// SELECTED FORM
// ============================================================

async function loadSelectedForm(
    formId
) {

    await loadFormPreview(
        formId
    );
}


// ============================================================
// FORM PREVIEW
// ============================================================

async function loadFormPreview(
    formId
) {

    const preview =
        document.getElementById(
            "formPreview"
        );


    if (!formId) {

        preview.value = "";

        return;
    }


    const form =
        forms.find(
            form =>
                form.id ===
                Number(formId)
        );


    if (!form) {

        preview.value = "";

        return;
    }


    try {

        const fields =
            await getFormFields(
                formId
            );


        if (
            !fields ||
            fields.length === 0
        ) {

            preview.value =
                form.description ?? "";

            return;
        }


        let previewText = "";


        fields.forEach(
            field => {

                previewText +=
                    `${field.label}:\n\n`;
            }
        );


        preview.value =
            previewText;


    } catch (error) {

        console.error(
            "Error loading Form Preview:",
            error
        );


        preview.value =
            form.description ?? "";
    }
}


// ============================================================
// COPY FORM PREVIEW
// ============================================================

async function copyFormPreview() {

    const preview =
        document.getElementById(
            "formPreview"
        );


    if (!preview.value) {

        return;
    }


    try {

        await navigator.clipboard.writeText(
            preview.value
        );


        alert(
            "Form copied to clipboard."
        );


    } catch (error) {

        console.error(
            "Error copying form:",
            error
        );
    }
}


// ============================================================
// COPY TEMPLATE
// ============================================================

async function copyTemplatePreview() {

    const preview =
        document.getElementById(
            "troubleshootingTemplatePreview"
        );


    if (!preview.value) {

        return;
    }


    try {

        await navigator.clipboard.writeText(
            preview.value
        );


        alert(
            "Template copied to clipboard."
        );


    } catch (error) {

        console.error(
            "Error copying template:",
            error
        );
    }
}


// ============================================================
// LOAD USED KNOWLEDGE BASE
// ============================================================

async function loadUsedKnowledgeBase() {

    try {

        const knowledgeBaseItems =
            await getTicketKnowledgeBase(
                ticketId
            );


        usedKnowledgeBase =
            knowledgeBaseItems ?? [];


        renderUsedKnowledgeBase();


    } catch (error) {

        console.error(
            "Error loading Used Knowledge Base:",
            error
        );


        usedKnowledgeBase = [];

        renderUsedKnowledgeBase();
    }
}


// ============================================================
// USED KNOWLEDGE BASE
// ============================================================

async function useCurrentTemplate() {

    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );


    const templateId =
        templateSelect.value
            ? Number(
                templateSelect.value
            )
            : null;


    if (!templateId) {

        alert(
            "Please select a troubleshooting template first."
        );

        return;
    }


    try {

        const knowledgeBase =
            await getTroubleshootingTemplateKnowledgeBase(
                templateId
            );


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            alert(
                "This template has no associated Knowledge Base articles."
            );

            return;
        }


        for (
            const kb of knowledgeBase
        ) {

            const alreadyExists =
                usedKnowledgeBase.some(
                    existingKb =>
                        existingKb.id ===
                        kb.id
                );


            if (
                !alreadyExists
            ) {

                await addTicketKnowledgeBase(
                    ticketId,
                    kb.id
                );

                usedKnowledgeBase.push(
                    kb
                );
            }
        }


        renderUsedKnowledgeBase();


    } catch (error) {

        console.error(
            "Error adding template KBs:",
            error
        );


        alert(
            "Error adding Knowledge Base articles."
        );
    }
}


// ============================================================
// RENDER USED KNOWLEDGE BASE
// ============================================================

function renderUsedKnowledgeBase() {

    const container =
        document.getElementById(
            "usedKnowledgeBase"
        );


    container.innerHTML = "";


    if (
        usedKnowledgeBase.length === 0
    ) {

        container.innerHTML =
            "<p>No Knowledge Base articles selected.</p>";

        return;
    }


    usedKnowledgeBase.forEach(
        kb => {

            const item =
                document.createElement(
                    "div"
                );


            item.innerHTML = `
                <span>
                    ${kb.article_number} - ${kb.title}
                </span>

                <button
                    type="button"
                    onclick="removeUsedKnowledgeBase(${kb.id})"
                >
                    Remove
                </button>
            `;


            container.appendChild(
                item
            );
        }
    );
}


// ============================================================
// REMOVE USED KNOWLEDGE BASE
// ============================================================

async function removeUsedKnowledgeBase(
    knowledgeBaseId
) {

    try {

        await removeTicketKnowledgeBase(
            ticketId,
            knowledgeBaseId
        );


        usedKnowledgeBase =
            usedKnowledgeBase.filter(
                kb =>
                    kb.id !==
                    knowledgeBaseId
            );


        renderUsedKnowledgeBase();


    } catch (error) {

        console.error(
            "Error removing Knowledge Base:",
            error
        );


        alert(
            "Error removing Knowledge Base article."
        );
    }
}


// ============================================================
// TEMPLATE NOT USED
// ============================================================

function doNotUseTemplate() {

    // Intentionally does nothing.

    // Selecting a template is only for visualization.
    // KBs are added only when the user explicitly clicks Yes.
}


// ============================================================
// SETUP EVENT LISTENERS
// ============================================================

function setupEventListeners() {


    // ========================================================
    // BACK
    // ========================================================

    document.getElementById(
        "backButton"
    ).addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );


    // ========================================================
    // SAVE
    // ========================================================

    document.getElementById(
        "saveButton"
    ).addEventListener(
        "click",
        saveTicket
    );


    // ========================================================
    // COPY FORM
    // ========================================================

    document.getElementById(
        "copyFormButton"
    ).addEventListener(
        "click",
        copyFormPreview
    );


    // ========================================================
    // COPY TEMPLATE
    // ========================================================

    document.getElementById(
        "copyTemplateButton"
    ).addEventListener(
        "click",
        copyTemplatePreview
    );


    // ========================================================
    // TEMPLATE CHANGE
    // ========================================================

    document.getElementById(
        "troubleshootingTemplate"
    ).addEventListener(
        "change",
        async () => {

            await loadSelectedTemplate();

        }
    );


    // ========================================================
    // TEMPLATE USED — YES
    // ========================================================

    document.getElementById(
        "useTemplateYes"
    ).addEventListener(
        "click",
        useCurrentTemplate
    );


    // ========================================================
    // TEMPLATE USED — NO
    // ========================================================

    document.getElementById(
        "useTemplateNo"
    ).addEventListener(
        "click",
        doNotUseTemplate
    );


    // ========================================================
    // FORM CHANGE
    // ========================================================

    document.getElementById(
        "form"
    ).addEventListener(
        "change",
        async event => {

            const formId =
                event.target.value
                    ? Number(
                        event.target.value
                    )
                    : null;


            await loadSelectedForm(
                formId
            );
        }
    );


    // ========================================================
    // TOOL CHANGE
    // ========================================================

    document.getElementById(
        "tool"
    ).addEventListener(
        "change",
        async event => {

            const toolId =
                event.target.value
                    ? Number(
                        event.target.value
                    )
                    : null;


            await loadToolKnowledgeBase(
                toolId
            );
        }
    );


    // ========================================================
    // ISSUE TYPE CHANGE
    // ========================================================

    document.getElementById(
        "issueType"
    ).addEventListener(
        "change",
        async event => {

            const issueTypeId =
                event.target.value
                    ? Number(
                        event.target.value
                    )
                    : null;


            // Reload forms

            await loadForms(
                issueTypeId
            );


            // Reload troubleshooting templates

            await loadTroubleshootingTemplates(
                issueTypeId
            );


            // Reload Issue Type KB

            await loadIssueTypeKnowledgeBase(
                issueTypeId
            );
        }
    );
}


// ============================================================
// SAVE TICKET
// ============================================================

async function saveTicket() {

    const ticketData = {

        ticket_number:
            document.getElementById(
                "ticketNumber"
            ).value,


        title:
            document.getElementById(
                "ticketTitle"
            ).value,


        user_name:
            document.getElementById(
                "userName"
            ).value,


        user_email:
            document.getElementById(
                "userEmail"
            ).value,


        user_best_contact_number:
            document.getElementById(
                "userPhone"
            ).value,


        user_type:
            document.getElementById(
                "userType"
            ).value,


        issue_description:
            document.getElementById(
                "issueDescription"
            ).value,


        troubleshooting_steps:
            document.getElementById(
                "troubleshootingSteps"
            ).value,


        additional_notes:
            document.getElementById(
                "additionalNotes"
            ).value,


        form_template_id:
            document.getElementById(
                "form"
            ).value
                ? Number(
                    document.getElementById(
                        "form"
                    ).value
                )
                : null,


        tool_id:
            document.getElementById(
                "tool"
            ).value
                ? Number(
                    document.getElementById(
                        "tool"
                    ).value
                )
                : null,


        location_id:
            document.getElementById(
                "location"
            ).value
                ? Number(
                    document.getElementById(
                        "location"
                    ).value
                )
                : null,


        priority_id:
            document.getElementById(
                "priority"
            ).value
                ? Number(
                    document.getElementById(
                        "priority"
                    ).value
                )
                : null,


        issue_type_id:
            document.getElementById(
                "issueType"
            ).value
                ? Number(
                    document.getElementById(
                        "issueType"
                    ).value
                )
                : null,


        troubleshooting_template_id:
            document.getElementById(
                "troubleshootingTemplate"
            ).value
                ? Number(
                    document.getElementById(
                        "troubleshootingTemplate"
                    ).value
                )
                : null,


        status_id:
            document.getElementById(
                "status"
            ).value
                ? Number(
                    document.getElementById(
                        "status"
                    ).value
                )
                : null,


        queue_id:
            document.getElementById(
                "queue"
            ).value
                ? Number(
                    document.getElementById(
                        "queue"
                    ).value
                )
                : null
    };


    try {

        await updateTicket(
            ticketId,
            ticketData
        );


        alert(
            "Ticket updated successfully."
        );


    } catch (error) {

        console.error(
            "Error updating ticket:",
            error
        );


        alert(
            "Error updating ticket."
        );
    }
}