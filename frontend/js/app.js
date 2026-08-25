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

            // Guardamos el JWT
            localStorage.setItem("access_token", data.access_token);

            // Vamos a la página principal
            window.location.href = "index.html";

        } catch (error) {

            message.textContent = error.message;

        }
    });
}


// =========================
// TICKETS
// =========================

const ticketsContainer = document.getElementById("ticketsContainer");
if (ticketsContainer) {
        

    async function loadTickets() {
        try {
            const data = await getTickets();

            console.log(data);

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

        } catch (error) {
            console.error(error);
            ticketsContainer.textContent = "No se pudieron cargar los tickets.";
        }
    }


    loadTickets();

}