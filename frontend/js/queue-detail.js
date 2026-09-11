let queueId = null;

let currentQueue = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    queueId =
        Number(
            params.get("id")
        );


    if (!queueId) {

        alert(
            "Invalid queue ID."
        );


        window.location.href =
            "queues.html";


        return;

    }


    setupEventListeners();

    await loadQueue();

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // BACK

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "queues.html";

            }
        );


    // EDIT

    document
        .getElementById("editButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    `queues.html?edit=${queueId}`;

            }
        );

}


// ============================================================
// LOAD QUEUE
// ============================================================

async function loadQueue() {

    try {

        currentQueue =
            await getQueue(
                queueId
            );


        renderQueue();

    } catch (error) {

        console.error(
            "Error loading queue:",
            error
        );


        alert(
            error.message ||
            "Error loading queue."
        );


        window.location.href =
            "queues.html";

    }

}


// ============================================================
// RENDER QUEUE
// ============================================================

function renderQueue() {

    document.title =
        `${currentQueue.name} - Queue`;


    // TITLE

    document.getElementById(
        "queueTitle"
    ).textContent =
        currentQueue.name;


    // NAME

    document.getElementById(
        "queueName"
    ).textContent =
        currentQueue.name ?? "N/A";


    // DESCRIPTION

    document.getElementById(
        "queueDescription"
    ).textContent =
        currentQueue.description ?? "N/A";


    // STATUS

    document.getElementById(
        "queueStatus"
    ).innerHTML = `

        <span class="status-badge ${
            currentQueue.is_active
                ? "active"
                : "inactive"
        }">

            ${
                currentQueue.is_active
                    ? "Active"
                    : "Inactive"
            }

        </span>

    `;


    // ID

    document.getElementById(
        "queueId"
    ).textContent =
        currentQueue.id;

}