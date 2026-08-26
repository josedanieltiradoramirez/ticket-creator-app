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
const applyFiltersButton = document.getElementById("applyFilters");

let filters = {};


async function loadTickets() {

    try {

        const data = await getTickets(currentPage, limit, filters);

        ticketsContainer.innerHTML = "";

        data.items.forEach(ticket => {

            const ticketElement = document.createElement("tr");

            ticketElement.innerHTML = `
                <td>${ticket.ticket_number ?? ""}</td>
                <td>${ticket.title ?? "Sin título"}</td>
                <td>${ticket.issue_type?.name ?? ""}</td>
                <td>${ticket.tool?.name ?? ""}</td>
                <td>${ticket.status?.name ?? ""}</td>
                <td>${ticket.priority?.name ?? ""}</td>
                <td>${ticket.queue?.name ?? ""}</td>
                <td>${ticket.location?.name ?? ""}</td>
            `;

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

    currentPage = 1;

    filters = {
        status_id: statusFilter.value
    };

    loadTickets();

});


// =========================
// INITIAL LOAD
// =========================

loadTickets();