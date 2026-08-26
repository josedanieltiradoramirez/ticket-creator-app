const ticketDetails = document.getElementById("ticketDetails");

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

async function loadTicket() {

    try {

        const ticket = await getTicket(ticketId);

        ticketDetails.innerHTML = `
            <h2>${ticket.ticket_number ?? ""}</h2>

            <p>
                <strong>Title:</strong>
                ${ticket.title ?? "Sin título"}
            </p>

            <p>
                <strong>User:</strong>
                ${ticket.user_name ?? ""}
            </p>

            <p>
                <strong>Issue Type:</strong>
                ${ticket.issue_type?.name ?? ""}
            </p>

            <p>
                <strong>Tool:</strong>
                ${ticket.tool?.name ?? ""}
            </p>

            <p>
                <strong>Status:</strong>
                ${ticket.status?.name ?? ""}
            </p>

            <p>
                <strong>Priority:</strong>
                ${ticket.priority?.name ?? ""}
            </p>

            <p>
                <strong>Queue:</strong>
                ${ticket.queue?.name ?? ""}
            </p>

            <p>
                <strong>Location:</strong>
                ${ticket.location?.name ?? ""}
            </p>

            <p>
                <strong>Description:</strong>
                ${ticket.issue_description ?? ""}
            </p>

            <p>
                <strong>Troubleshooting:</strong>
                ${ticket.troubleshooting_steps ?? ""}
            </p>
        `;

    } catch (error) {

        console.error(error);

        ticketDetails.textContent =
            "No se pudo cargar el ticket.";

    }
}

loadTicket();