let queues = [];

let editingQueueId = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadQueues();

        setupQueueEventListeners();

    }
);


function setupQueueEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {
                window.location.href = "index.html";
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


async function loadQueues() {

    try {

        queues = await getQueues();

        renderQueues();

    } catch (error) {

        console.error(
            "Error loading queues:",
            error
        );

        alert(
            "Error loading queues."
        );

    }

}


function renderQueues() {

    const tableBody =
        document.getElementById(
            "queuesTableBody"
        );


    const search =
        document.getElementById(
            "searchQueues"
        ).value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredQueues =
        queues.filter(queue => {

            return (
                queue.name
                    .toLowerCase()
                    .includes(search)

                ||

                queue.description
                    .toLowerCase()
                    .includes(search)
            );

        });


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
                    class="action-button edit-button"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                >
                    Delete
                </button>

            </td>

        `;


        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editQueue(queue.id)
            );


        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteQueue(queue.id)
            );


        tableBody.appendChild(row);

    });

}


function openCreateQueueModal() {

    editingQueueId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "Create Queue";


    document.getElementById(
        "queueName"
    ).value = "";


    document.getElementById(
        "queueDescription"
    ).value = "";


    document.getElementById(
        "queueActive"
    ).checked = true;


    document.getElementById(
        "queueModal"
    ).classList.remove("hidden");

}


function editQueue(queueId) {

    const queue =
        queues.find(
            queue => queue.id === queueId
        );


    if (!queue) {
        return;
    }


    editingQueueId = queueId;


    document.getElementById(
        "modalTitle"
    ).textContent = "Edit Queue";


    document.getElementById(
        "queueName"
    ).value = queue.name;


    document.getElementById(
        "queueDescription"
    ).value = queue.description;


    document.getElementById(
        "queueActive"
    ).checked = queue.is_active;


    document.getElementById(
        "queueModal"
    ).classList.remove("hidden");

}


function closeQueueModal() {

    document.getElementById(
        "queueModal"
    ).classList.add("hidden");

}


async function saveQueue(event) {

    event.preventDefault();


    const queueData = {

        name:
            document.getElementById(
                "queueName"
            ).value.trim(),

        description:
            document.getElementById(
                "queueDescription"
            ).value.trim(),

        is_active:
            document.getElementById(
                "queueActive"
            ).checked

    };


    try {

        if (editingQueueId === null) {

            await createQueue(
                queueData
            );

            alert(
                "Queue created successfully."
            );

        } else {

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
            "Error saving queue."
        );

    }

}


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
            "Error deleting queue."
        );

    }

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}