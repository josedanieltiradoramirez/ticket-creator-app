const API_URL = "http://127.0.0.1:8000";

async function getTickets() {

    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/api/tickets/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Error al obtener los tickets");
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
        throw new Error("Usuario o contraseña incorrectos");
    }

    return await response.json();
}