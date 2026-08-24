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

const loadTicketsButton = document.getElementById("loadTickets");
const ticketsContainer = document.getElementById("ticketsContainer");

if (loadTicketsButton) {

    loadTicketsButton.addEventListener("click", async () => {

        try {

            const data = await getTickets();

            console.log(data);

            ticketsContainer.innerHTML = "";

            data.items.forEach(ticket => {

                const ticketElement = document.createElement("div");

                ticketElement.innerHTML = `
                    <h3>${ticket.ticket_number}</h3>
                    <p>${ticket.title ?? "Sin título"}</p>
                `;

                ticketsContainer.appendChild(ticketElement);
            });

        } catch (error) {

            console.error(error);

            ticketsContainer.textContent =
                "No se pudieron cargar los tickets.";
        }
    });
}