const API_URL = "http://127.0.0.1:8000";

async function getTickets(page = 1, limit = 20) {

    const response = await fetch(
        `${API_URL}/api/tickets/?page=${page}&limit=${limit}`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        }
    );

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