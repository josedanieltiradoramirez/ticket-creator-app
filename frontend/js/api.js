const API_URL = "http://127.0.0.1:8000";

// ============================================================
// AUTHORIZATION
// ============================================================

function getAuthHeaders() {
    return {
        "Authorization":
            `Bearer ${localStorage.getItem("access_token")}`
    };
}


// ============================================================
// TICKETS
// ============================================================

async function getTickets(page = 1, limit = 20, filters = {}) {

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    Object.entries(filters).forEach(([key, value]) => {

        if (
            value !== "" &&
            value !== null &&
            value !== undefined
        ) {
            params.append(key, value);
        }

    });

    const response = await fetch(
        `${API_URL}/api/tickets/?${params.toString()}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error while fetching tickets"
        );
    }

    return await response.json();
}


async function getTicket(ticketId) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading ticket"
        );
    }

    return await response.json();
}


async function updateTicket(ticketId, ticketData) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json"
            },

            body: JSON.stringify(ticketData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating ticket"
        );
    }

    return await response.json();
}


async function createTicket(ticketData) {

    const response = await fetch(
        `${API_URL}/api/tickets/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json"
            },

            body: JSON.stringify(ticketData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating ticket"
        );
    }

    return await response.json();
}


// ============================================================
// AUTH
// ============================================================

async function login(username, password) {

    const formData =
        new URLSearchParams();

    formData.append(
        "username",
        username
    );

    formData.append(
        "password",
        password
    );

    const response = await fetch(
        `${API_URL}/api/auth/token`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: formData
        }
    );

    if (!response.ok) {

        let message =
            "Invalid username or password";

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {
                message =
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : JSON.stringify(errorData.detail);
            }

        } catch (error) {
            // Ignore
        }

        throw new Error(message);
    }

    return await response.json();
}


// ============================================================
// STATUSES
// ============================================================

async function getTicketStatuses() {

    const response = await fetch(
        `${API_URL}/api/ticket_status/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error while fetching ticket statuses"
        );
    }

    return await response.json();
}


// ============================================================
// PRIORITIES
// ============================================================

async function getPriorities() {

    const response = await fetch(
        `${API_URL}/api/priorities/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading priorities"
        );
    }

    return await response.json();
}


// ============================================================
// ISSUE TYPES
// ============================================================

async function getIssueTypes() {

    const response = await fetch(
        `${API_URL}/api/issue_types/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading issue types"
        );
    }

    return await response.json();
}


async function getIssueType(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading issue type"
        );
    }

    return await response.json();
}


async function createIssueType(issueTypeData) {

    const response = await fetch(
        `${API_URL}/api/issue_types/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(issueTypeData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating issue type"
        );
    }

    return await response.json();
}


async function updateIssueType(
    issueTypeId,
    issueTypeData
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(issueTypeData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating issue type"
        );
    }

    return await response.json();
}


async function deleteIssueType(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting issue type"
        );
    }

    return await response.json();
}


// ============================================================
// ISSUE TYPE - TOOLS
// ============================================================

async function getIssueTypeTools(issueTypeId) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/tools`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading issue type tools"
        );
    }

    return await response.json();
}


async function addIssueTypeTool(
    issueTypeId,
    toolId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/tools/${toolId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding tool to issue type"
        );
    }

    return await response.json();
}


async function removeIssueTypeTool(
    issueTypeId,
    toolId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/tools/${toolId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing tool from issue type"
        );
    }

    return await response.json();
}


// ============================================================
// ISSUE TYPE - KNOWLEDGE BASE
// ============================================================

async function getIssueTypeKnowledgeBase(
    issueTypeId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/knowledge-base`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading issue type knowledge base"
        );
    }

    return await response.json();
}


async function addIssueTypeKnowledgeBase(
    issueTypeId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding knowledge base to issue type"
        );
    }

    return await response.json();
}


async function removeIssueTypeKnowledgeBase(
    issueTypeId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing knowledge base from issue type"
        );
    }

    return await response.json();
}


// ============================================================
// ISSUE TYPE - TROUBLESHOOTING TEMPLATES
// ============================================================

async function getIssueTypeTroubleshootingTemplates(
    issueTypeId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/troubleshooting-templates`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading issue type troubleshooting templates"
        );
    }

    return await response.json();
}


async function addIssueTypeTroubleshootingTemplate(
    issueTypeId,
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/troubleshooting-templates/${templateId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding troubleshooting template to issue type"
        );
    }

    return await response.json();
}


async function removeIssueTypeTroubleshootingTemplate(
    issueTypeId,
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/troubleshooting-templates/${templateId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing troubleshooting template from issue type"
        );
    }

    return await response.json();
}


// ============================================================
// ISSUE TYPE - FORM
// ============================================================

async function getIssueTypeForm(
    issueTypeId
) {

    const response = await fetch(
        `${API_URL}/api/issue_types/${issueTypeId}/form`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading form for issue type"
        );
    }

    return await response.json();
}


// ============================================================
// TOOLS
// ============================================================

async function getTools() {

    const response = await fetch(
        `${API_URL}/api/tools/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading tools"
        );
    }

    return await response.json();
}


async function getTool(toolId) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading tool"
        );
    }

    return await response.json();
}


async function createTool(toolData) {

    const response = await fetch(
        `${API_URL}/api/tools/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(toolData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating tool"
        );
    }

    return await response.json();
}


async function updateTool(
    toolId,
    toolData
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(toolData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating tool"
        );
    }

    return await response.json();
}


async function deleteToolApi(toolId) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting tool"
        );
    }

    return await response.json();
}


// ============================================================
// TOOL - ISSUE TYPES
// ============================================================

async function getToolIssueTypes(toolId) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/issue-types`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading tool issue types"
        );
    }

    return await response.json();
}


async function addToolIssueType(
    toolId,
    issueTypeId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/issue-types/${issueTypeId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding issue type to tool"
        );
    }

    return await response.json();
}


async function removeToolIssueType(
    toolId,
    issueTypeId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/issue-types/${issueTypeId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing issue type from tool"
        );
    }

    return await response.json();
}


// ============================================================
// TOOL - KNOWLEDGE BASE
// ============================================================

async function getToolKnowledgeBase(
    toolId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/knowledge-base`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading tool knowledge base"
        );
    }

    return await response.json();
}


async function addToolKnowledgeBase(
    toolId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding knowledge base to tool"
        );
    }

    return await response.json();
}


async function removeToolKnowledgeBase(
    toolId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing knowledge base from tool"
        );
    }

    return await response.json();
}


// ============================================================
// TOOL - TROUBLESHOOTING TEMPLATES
// ============================================================

async function getToolTroubleshootingTemplates(
    toolId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/troubleshooting-templates`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading tool troubleshooting templates"
        );
    }

    return await response.json();
}


async function addToolTroubleshootingTemplate(
    toolId,
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/troubleshooting-templates/${templateId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error adding troubleshooting template to tool"
        );
    }

    return await response.json();
}


async function removeToolTroubleshootingTemplate(
    toolId,
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/tools/${toolId}/troubleshooting-templates/${templateId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error removing troubleshooting template from tool"
        );
    }

    return await response.json();
}


// ============================================================
// LOCATIONS
// ============================================================

async function getLocations() {

    const response = await fetch(
        `${API_URL}/api/locations/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading locations"
        );
    }

    return await response.json();
}


async function getLocation(locationId) {

    const response = await fetch(
        `${API_URL}/api/locations/${locationId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading location"
        );
    }

    return await response.json();
}


async function createLocation(locationData) {

    const response = await fetch(
        `${API_URL}/api/locations/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(locationData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating location"
        );
    }

    return await response.json();
}


async function updateLocation(
    locationId,
    locationData
) {

    const response = await fetch(
        `${API_URL}/api/locations/${locationId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(locationData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating location"
        );
    }

    return await response.json();
}


async function deleteLocationApi(
    locationId
) {

    const response = await fetch(
        `${API_URL}/api/locations/${locationId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting location"
        );
    }

    return await response.json();
}


// ============================================================
// QUEUES
// ============================================================

async function getQueues() {

    const response = await fetch(
        `${API_URL}/api/queues/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading queues"
        );
    }

    return await response.json();
}


async function getQueue(queueId) {

    const response = await fetch(
        `${API_URL}/api/queues/${queueId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading queue"
        );
    }

    return await response.json();
}


async function createQueue(queueData) {

    const response = await fetch(
        `${API_URL}/api/queues/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(queueData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating queue"
        );
    }

    return await response.json();
}


async function updateQueue(
    queueId,
    queueData
) {

    const response = await fetch(
        `${API_URL}/api/queues/${queueId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(queueData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating queue"
        );
    }

    return await response.json();
}


async function deleteQueueApi(queueId) {

    const response = await fetch(
        `${API_URL}/api/queues/${queueId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting queue"
        );
    }

    return await response.json();
}


// ============================================================
// WAREHOUSE MANAGEMENT SYSTEMS
// ============================================================

async function getWarehouseManagementSystems() {

    const response = await fetch(
        `${API_URL}/api/warehouse_management_systems/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading WMS"
        );
    }

    return await response.json();
}


async function getWarehouseManagementSystem(
    wmsId
) {

    const response = await fetch(
        `${API_URL}/api/warehouse_management_systems/${wmsId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading WMS"
        );
    }

    return await response.json();
}


async function createWarehouseManagementSystem(
    wmsData
) {

    const response = await fetch(
        `${API_URL}/api/warehouse_management_systems/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(wmsData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating WMS"
        );
    }

    return await response.json();
}


async function updateWarehouseManagementSystem(
    wmsId,
    wmsData
) {

    const response = await fetch(
        `${API_URL}/api/warehouse_management_systems/${wmsId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(wmsData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating WMS"
        );
    }

    return await response.json();
}


async function deleteWarehouseManagementSystem(
    wmsId
) {

    const response = await fetch(
        `${API_URL}/api/warehouse_management_systems/${wmsId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting WMS"
        );
    }

    return await response.json();
}


// ============================================================
// FORMS
// ============================================================

async function getForms() {

    const response = await fetch(
        `${API_URL}/api/forms/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading forms"
        );
    }

    return await response.json();
}


async function getForm(formId) {

    const response = await fetch(
        `${API_URL}/api/forms/${formId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading form"
        );
    }

    return await response.json();
}


async function getFormFields(formId) {

    const response = await fetch(
        `${API_URL}/api/forms/${formId}/fields`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading form fields"
        );
    }

    return await response.json();
}


async function createForm(formData) {

    const response = await fetch(
        `${API_URL}/api/forms/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(formData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating form"
        );
    }

    return await response.json();
}


async function updateForm(
    formId,
    formData
) {

    const response = await fetch(
        `${API_URL}/api/forms/${formId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(formData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating form"
        );
    }

    return await response.json();
}


async function deleteForm(formId) {

    const response = await fetch(
        `${API_URL}/api/forms/${formId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting form"
        );
    }

    return await response.json();
}


// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function getTroubleshootingTemplates() {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading troubleshooting templates"
        );
    }

    return await response.json();
}


async function getTroubleshootingTemplate(
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/${templateId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading troubleshooting template"
        );
    }

    return await response.json();
}


async function getTroubleshootingTemplateKnowledgeBase(
    troubleshootingTemplateId
) {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/${troubleshootingTemplateId}/knowledge-base`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading knowledge base for troubleshooting template"
        );
    }

    return await response.json();
}


async function createTroubleshootingTemplate(
    templateData
) {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(templateData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating troubleshooting template"
        );
    }

    return await response.json();
}


async function updateTroubleshootingTemplate(
    templateId,
    templateData
) {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/${templateId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(templateData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating troubleshooting template"
        );
    }

    return await response.json();
}


async function deleteTroubleshootingTemplate(
    templateId
) {

    const response = await fetch(
        `${API_URL}/api/troubleshooting_templates/${templateId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting troubleshooting template"
        );
    }

    return await response.json();
}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

async function getKnowledgeBaseItems() {

    const response = await fetch(
        `${API_URL}/api/knowledge_base/`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading knowledge base"
        );
    }

    return await response.json();
}


async function getKnowledgeBaseItem(
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/knowledge_base/${knowledgeBaseId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error loading knowledge base item"
        );
    }

    return await response.json();
}


async function createKnowledgeBaseItem(
    itemData
) {

    const response = await fetch(
        `${API_URL}/api/knowledge_base/`,
        {
            method: "POST",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(itemData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error creating knowledge base item"
        );
    }

    return await response.json();
}


async function updateKnowledgeBaseItem(
    knowledgeBaseId,
    itemData
) {

    const response = await fetch(
        `${API_URL}/api/knowledge_base/${knowledgeBaseId}`,
        {
            method: "PUT",

            headers: {
                ...getAuthHeaders(),
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(itemData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error updating knowledge base item"
        );
    }

    return await response.json();
}


async function deleteKnowledgeBaseItem(
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/knowledge_base/${knowledgeBaseId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting knowledge base item"
        );
    }

    return await response.json();
}


// ============================================================
// TICKET - KNOWLEDGE BASE
// ============================================================

async function getTicketKnowledgeBase(
    ticketId
) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/knowledge-base`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error while fetching ticket knowledge base"
        );
    }

    return await response.json();
}


async function addTicketKnowledgeBase(
    ticketId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error while adding knowledge base article"
        );
    }

    return await response.json();
}


async function removeTicketKnowledgeBase(
    ticketId,
    knowledgeBaseId
) {

    const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/knowledge-base/${knowledgeBaseId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error while removing knowledge base article"
        );
    }

    return await response.json();
}