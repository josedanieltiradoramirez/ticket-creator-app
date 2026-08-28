const ticketDetails = document.getElementById("ticketDetails");

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

let troubleshootingTemplates = [];
let forms = [];


// ============================================================
// LOAD TICKET
// ============================================================

async function loadTicket() {

    try {

        const ticket = await getTicket(ticketId);

        await loadPriorities(ticket.priority_id);
        await loadStatuses(ticket.status_id);
        await loadQueues(ticket.queue_id);
        await loadLocations(ticket.location_id);
        await loadTools(ticket.tool_id);
        await loadIssueTypes(ticket.issue_type_id);

        await loadTroubleshootingTemplates(
            ticket.issue_type_id,
            ticket.troubleshooting_template_id
        );

        await loadForms(
            ticket.issue_type_id,
            ticket.form_id
        );


        // ====================================================
        // TICKET INFORMATION
        // ====================================================

        document.getElementById("ticketNumber").value =
            ticket.ticket_number ?? "";

        document.getElementById("ticketTitle").value =
            ticket.title ?? "";


        // ====================================================
        // USER
        // ====================================================

        document.getElementById("userName").value =
            ticket.user_name ?? "";

        document.getElementById("userEmail").value =
            ticket.user_email ?? "";

        document.getElementById("userPhone").value =
            ticket.user_best_contact_number ?? "";

        document.getElementById("userType").value =
            ticket.user_type ?? "";


        // ====================================================
        // ISSUE
        // ====================================================

        document.getElementById("issueDescription").value =
            ticket.issue_description ?? "";


        // ====================================================
        // TROUBLESHOOTING
        // ====================================================

        document.getElementById("troubleshootingSteps").value =
            ticket.troubleshooting_steps ?? "";


        // ====================================================
        // ADDITIONAL NOTES
        // ====================================================

        document.getElementById("additionalNotes").value =
            ticket.additional_notes ?? "";


        // ====================================================
        // FORM CONTENT
        // ====================================================

        document.getElementById("formContent").value =
            ticket.form_content ?? "";


        // ====================================================
        // CONFIGURATION
        // ====================================================

        document.getElementById("knowledgeBase").textContent =
            ticket.knowledge_base?.title ?? "";


        // ====================================================
        // DATES
        // ====================================================

        document.getElementById("createdAt").textContent =
            new Date(ticket.created_at).toLocaleString();

        document.getElementById("updatedAt").textContent =
            new Date(ticket.updated_at).toLocaleString();

        document.getElementById("closedAt").textContent =
            ticket.closed_at
                ? new Date(ticket.closed_at).toLocaleString()
                : "Not closed";


    } catch (error) {

        console.error(error);

        document.body.innerHTML =
            "<h2>Error loading ticket.</h2>";
    }
}


// ============================================================
// PRIORITIES
// ============================================================

async function loadPriorities(currentPriorityId) {

    const priorities = await getPriorities();

    const prioritySelect =
        document.getElementById("priority");

    prioritySelect.innerHTML = "";

    priorities.forEach(priority => {

        const option =
            document.createElement("option");

        option.value = priority.id;
        option.textContent = priority.name;

        if (priority.id === currentPriorityId) {
            option.selected = true;
        }

        prioritySelect.appendChild(option);
    });
}


// ============================================================
// STATUSES
// ============================================================

async function loadStatuses(currentStatusId) {

    const statuses = await getTicketStatuses();

    const statusSelect =
        document.getElementById("status");

    statusSelect.innerHTML = "";

    statuses.forEach(status => {

        const option =
            document.createElement("option");

        option.value = status.id;
        option.textContent = status.name;

        if (status.id === currentStatusId) {
            option.selected = true;
        }

        statusSelect.appendChild(option);
    });
}


// ============================================================
// QUEUES
// ============================================================

async function loadQueues(currentQueueId) {

    const queues = await getQueues();

    const queueSelect =
        document.getElementById("queue");

    queueSelect.innerHTML = "";

    queues.forEach(queue => {

        const option =
            document.createElement("option");

        option.value = queue.id;
        option.textContent = queue.name;

        if (queue.id === currentQueueId) {
            option.selected = true;
        }

        queueSelect.appendChild(option);
    });
}


// ============================================================
// TOOLS
// ============================================================

async function loadTools(currentToolId) {

    const tools = await getTools();

    const toolSelect =
        document.getElementById("tool");

    toolSelect.innerHTML = "";

    tools.forEach(tool => {

        const option =
            document.createElement("option");

        option.value = tool.id;
        option.textContent = tool.name;

        if (tool.id === currentToolId) {
            option.selected = true;
        }

        toolSelect.appendChild(option);
    });
}


// ============================================================
// LOCATIONS
// ============================================================

async function loadLocations(currentLocationId) {

    const locations = await getLocations();

    const locationSelect =
        document.getElementById("location");

    locationSelect.innerHTML = "";

    locations.forEach(location => {

        const option =
            document.createElement("option");

        option.value = location.id;
        option.textContent = location.name;

        if (location.id === currentLocationId) {
            option.selected = true;
        }

        locationSelect.appendChild(option);
    });
}


// ============================================================
// ISSUE TYPES
// ============================================================

async function loadIssueTypes(currentIssueTypeId) {

    const issueTypes = await getIssueTypes();

    const issueTypeSelect =
        document.getElementById("issueType");

    issueTypeSelect.innerHTML = "";

    issueTypes.forEach(issueType => {

        const option =
            document.createElement("option");

        option.value = issueType.id;
        option.textContent = issueType.name;

        if (issueType.id === currentIssueTypeId) {
            option.selected = true;
        }

        issueTypeSelect.appendChild(option);
    });
}


// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function loadTroubleshootingTemplates(
    issueTypeId,
    currentTemplateId = null
) {

    const relatedTemplates =
        await getIssueTypeTroubleshootingTemplates(issueTypeId);

    const allTemplates =
        await getTroubleshootingTemplates();

    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );

    templateSelect.innerHTML = "";

    troubleshootingTemplates = allTemplates;


    // Empty option

    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";
    emptyOption.textContent = "Select a template";

    templateSelect.appendChild(emptyOption);


    // Related template IDs

    const relatedIds = new Set(
        relatedTemplates.map(
            template => template.id
        )
    );


    // Related templates

    if (relatedTemplates.length > 0) {

        const relatedGroup =
            document.createElement("optgroup");

        relatedGroup.label = "Related";

        relatedTemplates.forEach(template => {

            const option =
                document.createElement("option");

            option.value = template.id;
            option.textContent =
                template.name ??
                template.generated_description;

            if (template.id === currentTemplateId) {
                option.selected = true;
            }

            relatedGroup.appendChild(option);
        });

        templateSelect.appendChild(relatedGroup);
    }


    // Other templates

    const otherTemplates =
        allTemplates.filter(
            template =>
                !relatedIds.has(template.id)
        );


    if (otherTemplates.length > 0) {

        const allGroup =
            document.createElement("optgroup");

        allGroup.label = "All";

        otherTemplates.forEach(template => {

            const option =
                document.createElement("option");

            option.value = template.id;
            option.textContent =
                template.name ??
                template.generated_description;

            if (template.id === currentTemplateId) {
                option.selected = true;
            }

            allGroup.appendChild(option);
        });

        templateSelect.appendChild(allGroup);
    }


    // Select first related template
    // only if ticket doesn't already have one

    if (
        currentTemplateId === null &&
        relatedTemplates.length > 0
    ) {

        templateSelect.value =
            relatedTemplates[0].id;
    }


    loadTemplatePreview();
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
        Number(templateSelect.value);

    const selectedTemplate =
        troubleshootingTemplates.find(
            template =>
                template.id === selectedTemplateId
        );


    if (selectedTemplate) {

        preview.value =
            selectedTemplate.steps ?? "";

    } else {

        preview.value = "";
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
        await getIssueTypeForm(issueTypeId);

    const allForms =
        await getForms();

    forms = allForms;

    const formSelect =
        document.getElementById("form");

    formSelect.innerHTML = "";


    // Empty option

    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";
    emptyOption.textContent = "Select a form";

    formSelect.appendChild(emptyOption);


    // Related forms

    if (relatedForms.length > 0) {

        const relatedGroup =
            document.createElement("optgroup");

        relatedGroup.label = "Related";

        relatedForms.forEach(form => {

            const option =
                document.createElement("option");

            option.value = form.id;
            option.textContent = form.name;

            if (form.id === currentFormId) {
                option.selected = true;
            }

            relatedGroup.appendChild(option);
        });

        formSelect.appendChild(relatedGroup);
    }


    // Related IDs

    const relatedIds = new Set(
        relatedForms.map(
            form => form.id
        )
    );


    // Other forms

    const otherForms =
        allForms.filter(
            form =>
                !relatedIds.has(form.id)
        );


    if (otherForms.length > 0) {

        const allGroup =
            document.createElement("optgroup");

        allGroup.label = "All";

        otherForms.forEach(form => {

            const option =
                document.createElement("option");

            option.value = form.id;
            option.textContent = form.name;

            if (form.id === currentFormId) {
                option.selected = true;
            }

            allGroup.appendChild(option);
        });

        formSelect.appendChild(allGroup);
    }


    // Select first related form
    // only when ticket doesn't already have one

    if (
        currentFormId === null &&
        relatedForms.length > 0
    ) {

        formSelect.value =
            relatedForms[0].id;
    }


    // Load preview

    await loadSelectedForm(
        formSelect.value
    );
}


// ============================================================
// SELECTED FORM
// ============================================================

async function loadSelectedForm(formId) {

    await loadFormPreview(formId);
}


// ============================================================
// FORM PREVIEW
// ============================================================

async function loadFormPreview(formId) {

    const preview =
        document.getElementById("formPreview");

    if (!formId) {

        preview.value = "";

        return;
    }


    const form =
        forms.find(
            form =>
                form.id === Number(formId)
        );


    if (!form) {

        preview.value = "";

        return;
    }


    const fields =
        await getFormFields(formId);


    if (fields.length === 0) {

        preview.value =
            form.description ?? "";

        return;
    }


    let previewText = "";

    fields.forEach(field => {

        previewText +=
            `${field.label}:\n\n`;

    });


    preview.value = previewText;
}


// ============================================================
// COPY FORM PREVIEW
// ============================================================

document.getElementById(
    "copyFormButton"
).addEventListener(
    "click",
    async () => {

        const preview =
            document.getElementById("formPreview");

        await navigator.clipboard.writeText(
            preview.value
        );
    }
);


// ============================================================
// TROUBLESHOOTING TEMPLATE CHANGE
// ============================================================

document.getElementById(
    "troubleshootingTemplate"
).addEventListener(
    "change",
    () => {

        loadTemplatePreview();
    }
);


// ============================================================
// FORM CHANGE
// ============================================================

document.getElementById(
    "form"
).addEventListener(
    "change",
    async (event) => {

        const formId =
            event.target.value
                ? Number(event.target.value)
                : null;

        await loadSelectedForm(formId);
    }
);


// ============================================================
// ISSUE TYPE CHANGE
// ============================================================

document.getElementById(
    "issueType"
).addEventListener(
    "change",
    async (event) => {

        const issueTypeId =
            Number(event.target.value);

        await loadForms(issueTypeId);

        await loadTroubleshootingTemplates(
            issueTypeId
        );
    }
);


// ============================================================
// BACK BUTTON
// ============================================================

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    () => {

        window.location.href =
            "index.html";
    }
);


// ============================================================
// SAVE TICKET
// ============================================================

document.getElementById(
    "saveButton"
).addEventListener(
    "click",
    async () => {

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

            form_content:
                document.getElementById(
                    "formContent"
                ).value,

            tool_id:
                Number(
                    document.getElementById(
                        "tool"
                    ).value
                ),

            location_id:
                Number(
                    document.getElementById(
                        "location"
                    ).value
                ),

            priority_id:
                Number(
                    document.getElementById(
                        "priority"
                    ).value
                ),

            issue_type_id:
                Number(
                    document.getElementById(
                        "issueType"
                    ).value
                ),

            form_id:
                document.getElementById(
                    "form"
                ).value
                    ? Number(
                        document.getElementById(
                            "form"
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
                Number(
                    document.getElementById(
                        "status"
                    ).value
                ),

            queue_id:
                Number(
                    document.getElementById(
                        "queue"
                    ).value
                )
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

            console.error(error);

            alert(
                "Error updating ticket."
            );
        }
    }
);


// ============================================================
// INITIAL LOAD
// ============================================================

loadTicket();