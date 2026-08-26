// =========================
// LOGIN
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {

            const data = await login(username, password);

            // Save JWT
            localStorage.setItem("access_token", data.access_token);

            // Go to the main screen
            window.location.href = "index.html";

        } catch (error) {

            message.textContent = error.message;

        }
    });
}


// =========================
// TICKETS
// =========================
let currentPage = 1;
const limit = 20;

const previousPageButton = document.getElementById("previousPage");
const nextPageButton = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const ticketsContainer = document.getElementById("ticketsContainer");

const statusFilter = document.getElementById("statusFilter");
const issueTypeFilter = document.getElementById("issueTypeFilter");
const priorityFilter = document.getElementById("priorityFilter");
const queueFilter = document.getElementById("queueFilter");
const toolFilter = document.getElementById("toolFilter");
const locationFilter = document.getElementById("locationFilter");
const ticketNumberFilter = document.getElementById("ticketNumberFilter");
const userNameFilter = document.getElementById("userNameFilter");
const ticketDateFilter = document.getElementById("ticketDateFilter");
const applyFiltersButton = document.getElementById("applyFilters");
const clearFiltersButton = document.getElementById("clearFilters");

let filters = {};


async function loadTickets() {

    try {

        const data = await getTickets(currentPage, limit, filters);

        ticketsContainer.innerHTML = "";

        data.items.forEach(ticket => {

            const ticketElement = document.createElement("tr");
            ticketElement.classList.add("ticket-row");

            ticketElement.innerHTML = `
                <td>${ticket.ticket_number ?? ""}</td>
                <td>${ticket.title ?? "No title"}</td>
                <td>${ticket.issue_type?.name ?? ""}</td>
                <td>${ticket.tool?.name ?? ""}</td>
                <td>${ticket.status?.name ?? ""}</td>
                <td>${ticket.priority?.name ?? ""}</td>
                <td>${ticket.queue?.name ?? ""}</td>
                <td>${ticket.location?.name ?? ""}</td>
                <td>${new Date(ticket.created_at).toLocaleDateString()}</td>
            `;

            ticketElement.addEventListener("click", () => {
                window.location.href = `ticket-detail.html?id=${ticket.id}`;
            });

            ticketsContainer.appendChild(ticketElement);
        });

        pageInfo.textContent = `Página ${data.page} de ${data.pages}`;

        previousPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage >= data.pages;

    } catch (error) {

        console.error(error);

        ticketsContainer.textContent =
            "Could not load tickets. Please try again later.";
    }
}


// =========================
// PAGINATION
// =========================

previousPageButton.addEventListener("click", () => {

    if (currentPage > 1) {
        currentPage--;
        loadTickets();
    }

});


nextPageButton.addEventListener("click", () => {

    currentPage++;
    loadTickets();

});


// =========================
// FILTERS
// =========================

applyFiltersButton.addEventListener("click", () => {

    applyFilters();

});

clearFiltersButton.addEventListener("click", () => {
    clearFilters();
});

ticketNumberFilter.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        applyFilters();
    }

});

userNameFilter.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        applyFilters();
    }

});

function applyFilters() {

    currentPage = 1;

    filters = {
        status_id: statusFilter.value,
        issue_type_id: issueTypeFilter.value,
        priority_id: priorityFilter.value,
        queue_id: queueFilter.value,
        tool_id: toolFilter.value,
        location_id: locationFilter.value,
        ticket_number: ticketNumberFilter.value,
        user_name: userNameFilter.value,
        ticket_date: ticketDateFilter.value
    };

    loadTickets();
}

function clearFilters() {

    statusFilter.value = "";
    issueTypeFilter.value = "";
    priorityFilter.value = "";
    queueFilter.value = "";
    toolFilter.value = "";
    locationFilter.value = "";

    ticketNumberFilter.value = "";
    userNameFilter.value = "";
    ticketDateFilter.value = "";

    filters = {};

    currentPage = 1;

    loadTickets();
}

async function loadStatuses() {

    try {

        const statuses = await getTicketStatuses();

        statuses.forEach(status => {

            const option = document.createElement("option");

            option.value = status.id;
            option.textContent = status.name;

            statusFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}

async function loadIssueTypes() {

    try {

        const issueTypes = await getIssueTypes();

        issueTypes.forEach(issueType => {

            const option = document.createElement("option");

            option.value = issueType.id;
            option.textContent = issueType.name;

            issueTypeFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}

async function loadPriorities() {

    try {

        const priorities = await getPriorities();

        priorities.forEach(priority => {

            const option = document.createElement("option");

            option.value = priority.id;
            option.textContent = priority.name;

            priorityFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}

async function loadQueues() {

    try {

        const queues = await getQueues();

        queues.forEach(queue => {

            const option = document.createElement("option");

            option.value = queue.id;
            option.textContent = queue.name;

            queueFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}

async function loadTools() {

    try {

        const tools = await getTools();

        tools.forEach(tool => {

            const option = document.createElement("option");

            option.value = tool.id;
            option.textContent = tool.name;

            toolFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}

async function loadLocations() {

    try {

        const locations = await getLocations();

        locations.forEach(location => {

            const option = document.createElement("option");

            option.value = location.id;
            option.textContent = location.name;

            locationFilter.appendChild(option);
        });

    } catch (error) {

        console.error(error);

    }
}



// =========================
// INITIAL LOAD
// =========================

async function initialize() {

    await loadStatuses();

    await loadIssueTypes();

    await loadPriorities();

    await loadQueues();

    await loadTools();

    await loadLocations();

    await loadTickets();
}

initialize();