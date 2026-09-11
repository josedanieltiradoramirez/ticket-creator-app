let queues = [];

let editingQueueId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupQueueEventListeners();

    await loadQueues();


    // If we arrived from Queue Detail -> Edit

    const params =
        new URLSearchParams(
            window.location.search
        );

    const editId =
        Number(
            params.get("edit")
        );


    if (editId) {

        editQueue(editId);

    }

});


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupQueueEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


    document
        .getElementById("newQueueButton")
        .addEventListener(
            "click",
            openCreateQueueModal
        );


    document
        .getElementById("closeQueueModal")
        .addEventListener(
            "click",
            closeQueueModal
        );


    document
        .getElementById("cancelQueueButton")
        .addEventListener(
            "click",
            closeQueueModal
        );


    document
        .getElementById("queueForm")
        .addEventListener(
            "submit",
            saveQueue
        );


    document
        .getElementById("searchQueues")
        .addEventListener(
            "input",
            renderQueues
        );

}


// ============================================================
// LOAD QUEUES
// ============================================================

async function loadQueues() {

    try {

        queues =
            await getQueues();


        renderQueues();

    } catch (error) {

        console.error(
            "Error loading queues:",
            error
        );


        alert(
            error.message ||
            "Error loading queues."
        );

    }

}


// ============================================================
// RENDER QUEUES
// ============================================================

function renderQueues() {

    const tableBody =
        document.getElementById(
            "queuesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "emptyQueuesMessage"
        );


    const search =
        document.getElementById(
            "searchQueues"
        )
        .value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredQueues =
        queues.filter(queue => {

            const name =
                String(
                    queue.name ?? ""
                )
                .toLowerCase();


            const description =
                String(
                    queue.description ?? ""
                )
                .toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search)
            );

        });


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (filteredQueues.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        return;

    }


    emptyMessage.classList.add(
        "hidden"
    );


    // ========================================================
    // TABLE ROWS
    // ========================================================

    filteredQueues.forEach(queue => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(queue.name)}
            </td>

            <td>
                ${escapeHtml(queue.description)}
            </td>

            <td>

                <span class="status-badge ${
                    queue.is_active
                        ? "active"
                        : "inactive"
                }">

                    ${
                        queue.is_active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    type="button"
                    class="action-button edit-button"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="action-button delete-button"
                >
                    Delete
                </button>

            </td>

        `;


        // VIEW

        row
            .querySelector(".view-button")
            .addEventListener(
                "click",
                () => openQueueDetail(queue.id)
            );


        // EDIT

        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editQueue(queue.id)
            );


        // DELETE

        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteQueue(queue.id)
            );


        tableBody.appendChild(row);

    });

}


// ============================================================
// OPEN QUEUE DETAIL
// ============================================================

function openQueueDetail(queueId) {

    window.location.href =
        `queue-detail.html?id=${queueId}`;

}


// ============================================================
// CREATE QUEUE
// ============================================================

function openCreateQueueModal() {

    editingQueueId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Create Queue";


    document.getElementById(
        "queueName"
    ).value = "";


    document.getElementById(
        "queueDescription"
    ).value = "";


    document.getElementById(
        "queueActive"
    ).checked = true;


    document
        .getElementById("queueModal")
        .classList.remove("hidden");

}


// ============================================================
// EDIT QUEUE
// ============================================================

function editQueue(queueId) {

    const queue =
        queues.find(
            queue => queue.id === queueId
        );


    if (!queue) {

        alert(
            "Queue not found."
        );

        return;

    }


    editingQueueId = queueId;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Queue";


    document.getElementById(
        "queueName"
    ).value =
        queue.name ?? "";


    document.getElementById(
        "queueDescription"
    ).value =
        queue.description ?? "";


    document.getElementById(
        "queueActive"
    ).checked =
        queue.is_active ?? true;


    document
        .getElementById("queueModal")
        .classList.remove("hidden");

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeQueueModal() {

    document
        .getElementById("queueModal")
        .classList.add("hidden");


    editingQueueId = null;

}


// ============================================================
// SAVE QUEUE
// ============================================================

async function saveQueue(event) {

    event.preventDefault();


    const queueData = {

        name:
            document
                .getElementById("queueName")
                .value
                .trim(),

        description:
            document
                .getElementById("queueDescription")
                .value
                .trim(),

        is_active:
            document
                .getElementById("queueActive")
                .checked

    };


    if (
        !queueData.name ||
        !queueData.description
    ) {

        alert(
            "Please complete all required fields."
        );

        return;

    }


    try {

        // CREATE

        if (editingQueueId === null) {

            await createQueue(
                queueData
            );


            alert(
                "Queue created successfully."
            );

        }

        // UPDATE

        else {

            await updateQueue(
                editingQueueId,
                queueData
            );


            alert(
                "Queue updated successfully."
            );

        }


        closeQueueModal();

        await loadQueues();

    } catch (error) {

        console.error(
            "Error saving queue:",
            error
        );


        alert(
            error.message ||
            "Error saving queue."
        );

    }

}


// ============================================================
// DELETE QUEUE
// ============================================================

async function deleteQueue(queueId) {

    const queue =
        queues.find(
            queue => queue.id === queueId
        );


    if (!queue) {

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${queue.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteQueueApi(
            queueId
        );


        alert(
            "Queue deleted successfully."
        );


        await loadQueues();

    } catch (error) {

        console.error(
            "Error deleting queue:",
            error
        );


        alert(
            error.message ||
            "Error deleting queue."
        );

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}