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
        throw new Error("Error al obtener los issue types");
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
        throw new Error("Error al obtener las prioridades");
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
        throw new Error("Error al obtener las queues");
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
        throw new Error("Error al obtener las tools");
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
        throw new Error("Error al obtener las locations");
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