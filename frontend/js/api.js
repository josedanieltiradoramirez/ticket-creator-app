const API_URL = "http://127.0.0.1:8000";

async function getTickets(page = 1, limit = 20, filters = {}) {

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            params.append(key, value);
        }
    });

    const response = await fetch(
        `${API_URL}/api/tickets/?${params.toString()}`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error while fetching tickets");
    }

    return await response.json();
}

async function getTicketStatuses() {

    const response = await fetch(
        `${API_URL}/api/ticket_status/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error while fetching ticket statuses");
    }

    return await response.json();
}

async function getIssueTypes() {

    const response = await fetch(
        `${API_URL}/api/issue_types/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading issue types");
    }

    return await response.json();
}

async function getPriorities() {

    const response = await fetch(
        `${API_URL}/api/priorities/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading priorities");
    }

    return await response.json();
}


async function getQueues() {

    const response = await fetch(
        `${API_URL}/api/queues/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading queues");
    }

    return await response.json();
}


async function getTools() {

    const response = await fetch(
        `${API_URL}/api/tools/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading tools");
    }

    return await response.json();
}


async function getLocations() {

    const response = await fetch(
        `${API_URL}/api/locations/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading locations");
    }

    return await response.json();
}

async function login(username, password) {

    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/api/auth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Invalid username or password");
    }

    return await response.json();
}


async function getTicket(ticketId) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading ticket");
    }

    return await response.json();
}

async function getIssueTypeTroubleshootingTemplates(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/troubleshooting-templates`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading troubleshooting templates for the selected issue type"
        );
    }

    return await response.json();
}

async function getTroubleshootingTemplates() {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading troubleshooting templates");
    }

    return await response.json();
}

async function getIssueTypeForm(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/form`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading form for issue type");
    }

    return await response.json();
}

async function getForms() {

    const response = await fetch(
        `${API_URL}/api/forms/`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading forms");
    }

    return await response.json();
}

async function getFormFields(formId) {

    const response = await fetch(
        `${API_URL}/api/forms/${formId}/fields`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading form fields");
    }

    return await response.json();
}


async function getToolKnowledgeBase(toolId) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/knowledge-base`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading tool knowledge base");
    }

    return await response.json();
}

async function getIssueTypeKnowledgeBase(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/knowledge-base`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error loading issue type knowledge base");
    }

    return await response.json();
}

async function updateTicket(ticketId, ticketData) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ticketData)
        }
    );

    if (!response.ok) {
        throw new Error("Error updating ticket");
    }

    return await response.json();
}