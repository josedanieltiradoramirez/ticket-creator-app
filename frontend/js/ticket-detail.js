const ticketDetails = document.getElementById("ticketDetails");

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

async function loadTicket() {

    try {

        const ticket = await getTicket(ticketId);

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

        document.getElementById("issueType").textContent =
            ticket.issue_type?.name ?? "";

        document.getElementById("tool").textContent =
            ticket.tool?.name ?? "";

        document.getElementById("location").textContent =
            ticket.location?.name ?? "";

        document.getElementById("priority").textContent =
            ticket.priority?.name ?? "";

        document.getElementById("issueDescription").value =
            ticket.issue_description ?? "";


        // Troubleshooting

        document.getElementById("troubleshootingTemplate").textContent =
            ticket.troubleshooting_template?.name ?? "";

        document.getElementById("troubleshootingSteps").value =
            ticket.troubleshooting_steps ?? "";


        // Configuration

        document.getElementById("status").textContent =
            ticket.status?.name ?? "";

        document.getElementById("queue").textContent =
            ticket.queue?.name ?? "";

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


document.getElementById("backButton").addEventListener("click", () => {

    window.location.href = "index.html";

});


loadTicket();