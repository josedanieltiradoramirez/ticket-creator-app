const ticketDetails = document.getElementById("ticketDetails");

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

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
        

        document.getElementById("ticketNumber").textContent =
            ticket.ticket_number ?? "Ticket";

        document.getElementById("ticketTitle").value =
            ticket.title ?? "";


        // User

        document.getElementById("userName").value =
            ticket.user_name ?? "";

        document.getElementById("userEmail").value =
            ticket.user_email ?? "";

        document.getElementById("userPhone").value =
            ticket.user_best_contact_number ?? "";

        document.getElementById("userType").value =
            ticket.user_type ?? "";


        // Issue

        document.getElementById("issueDescription").value =
            ticket.issue_description ?? "";


        // Troubleshooting


        document.getElementById("troubleshootingSteps").value =
            ticket.troubleshooting_steps ?? "";


        // Configuration


        document.getElementById("knowledgeBase").textContent =
            ticket.knowledge_base?.title ?? "";


        // Dates

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

async function loadPriorities(currentPriorityId) {

    const priorities = await getPriorities();

    const prioritySelect = document.getElementById("priority");

    prioritySelect.innerHTML = "";

    priorities.forEach(priority => {

        const option = document.createElement("option");

        option.value = priority.id;
        option.textContent = priority.name;

        if (priority.id === currentPriorityId) {
            option.selected = true;
        }

        prioritySelect.appendChild(option);
    });
}

async function loadStatuses(currentStatusId) {

    const statuses = await getTicketStatuses();

    const statusSelect = document.getElementById("status");

    statusSelect.innerHTML = "";

    statuses.forEach(status => {

        const option = document.createElement("option");

        option.value = status.id;
        option.textContent = status.name;

        if (status.id === currentStatusId) {
            option.selected = true;
        }

        statusSelect.appendChild(option);
    });
}

async function loadQueues(currentQueueId) {

    const queues = await getQueues();

    const queueSelect = document.getElementById("queue");

    queueSelect.innerHTML = "";

    queues.forEach(queue => {

        const option = document.createElement("option");

        option.value = queue.id;
        option.textContent = queue.name;

        if (queue.id === currentQueueId) {
            option.selected = true;
        }

        queueSelect.appendChild(option);
    });
}

async function loadTools(currentToolId) {

    const tools = await getTools();

    const toolSelect = document.getElementById("tool");

    toolSelect.innerHTML = "";

    tools.forEach(tool => {

        const option = document.createElement("option");

        option.value = tool.id;
        option.textContent = tool.name;

        if (tool.id === currentToolId) {
            option.selected = true;
        }

        toolSelect.appendChild(option);
    });
}

async function loadLocations(currentLocationId) {

    const locations = await getLocations();

    const locationSelect = document.getElementById("location");

    locationSelect.innerHTML = "";

    locations.forEach(location => {

        const option = document.createElement("option");

        option.value = location.id;
        option.textContent = location.name;

        if (location.id === currentLocationId) {
            option.selected = true;
        }

        locationSelect.appendChild(option);
    });
}

async function loadIssueTypes(currentIssueTypeId) {

    const issueTypes = await getIssueTypes();

    const issueTypeSelect = document.getElementById("issueType");

    issueTypeSelect.innerHTML = "";

    issueTypes.forEach(issueType => {

        const option = document.createElement("option");

        option.value = issueType.id;
        option.textContent = issueType.name;

        if (issueType.id === currentIssueTypeId) {
            option.selected = true;
        }

        issueTypeSelect.appendChild(option);
    });
}

let troubleshootingTemplates = [];

async function loadTroubleshootingTemplates(
    issueTypeId,
    currentTemplateId = null
) {

    troubleshootingTemplates =
        await getIssueTypeTroubleshootingTemplates(issueTypeId);

    const templateSelect =
        document.getElementById("troubleshootingTemplate");

    templateSelect.innerHTML = "";

    troubleshootingTemplates.forEach(template => {

        const option = document.createElement("option");

        option.value = template.id;
        option.textContent = template.name;

        if (template.id === currentTemplateId) {
            option.selected = true;
        }

        templateSelect.appendChild(option);
    });


    loadTemplatePreview();
}

function loadTemplatePreview() {

    const templateSelect =
        document.getElementById("troubleshootingTemplate");

    const preview =
        document.getElementById("troubleshootingTemplatePreview");

    const selectedTemplateId =
        Number(templateSelect.value);

    const selectedTemplate =
        troubleshootingTemplates.find(
            template => template.id === selectedTemplateId
        );

    if (selectedTemplate) {
        preview.value = selectedTemplate.steps ?? "";
    } else {
        preview.value = "";
    }
}

document.getElementById("troubleshootingTemplate").addEventListener(
    "change",
    () => {
        loadTemplatePreview();
    }
);

document.getElementById("copyTemplateButton").addEventListener(
    "click",
    async () => {

        const preview =
            document.getElementById(
                "troubleshootingTemplatePreview"
            );

        await navigator.clipboard.writeText(preview.value);
    }
);

document.getElementById("issueType").addEventListener(
    "change",
    async (event) => {

        const issueTypeId = Number(event.target.value);

        await loadTroubleshootingTemplates(issueTypeId);
    }
);

document.getElementById("backButton").addEventListener("click", () => {

    window.location.href = "index.html";

});


loadTicket();