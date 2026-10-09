let queues = [];
let editingQueueId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    renderPageHeader();
    setupQueueEventListeners();
    await loadQueues();

    // If we arrived from Queue Detail -> Edit
    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));

    if (editId) {
        editQueue(editId);
    }
});

// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {
    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Queues",
        description: "Manage and configure ticket queues.",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href = "index.html";
        }
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupQueueEventListeners() {
    document
        .getElementById("addQueueButton")
        .addEventListener("click", openCreateQueueModal);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderQueues);
}

// ============================================================
// LOAD QUEUES
// ============================================================

async function loadQueues() {
    try {
        queues = await getQueues() || [];
        renderQueues();
    } catch (error) {
        console.error("Error loading queues:", error);
        showErrorMessage(error.message || "Error loading queues.");
    }
}

// ============================================================
// RENDER QUEUES
// ============================================================

function renderQueues() {
    const tableBody = document.getElementById("queuesTableBody");
    const emptyState = document.getElementById("queuesEmptyState");
    const search = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    tableBody.innerHTML = "";

    const filteredQueues = queues.filter((queue) => {
        const name = String(queue.name ?? "").toLowerCase();
        const description = String(queue.description ?? "").toLowerCase();

        return name.includes(search) || description.includes(search);
    });

    emptyState.classList.toggle("list-page-hidden", filteredQueues.length !== 0);

    if (filteredQueues.length === 0) {
        return;
    }

    filteredQueues.forEach((queue) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="list-page-primary-value">
                    ${escapeQueueHtml(queue.name)}
                </span>
            </td>

            <td>
                ${escapeQueueHtml(queue.description)}
            </td>

            <td>
                <span class="list-page-status ${
                    queue.is_active
                        ? "list-page-status-active"
                        : "list-page-status-inactive"
                }">
                    ${queue.is_active ? "Active" : "Inactive"}
                </span>
            </td>

            <td>
                <div class="list-page-row-actions">
                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="view"
                        data-id="${escapeQueueAttribute(queue.id)}"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button"
                        data-action="edit"
                        data-id="${escapeQueueAttribute(queue.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="list-page-action-button list-page-remove-button"
                        data-action="remove"
                        data-id="${escapeQueueAttribute(queue.id)}"
                    >
                        Remove
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const queueId = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "view") {
                openQueueDetail(queueId);
            } else if (action === "edit") {
                editQueue(queueId);
            } else if (action === "remove") {
                openRemoveQueueModal(queueId);
            }
        });
    });
}

// ============================================================
// OPEN QUEUE DETAIL
// ============================================================

function openQueueDetail(queueId) {
    window.location.href = `queue-detail.html?id=${queueId}`;
}

// ============================================================
// CREATE QUEUE
// ============================================================

function openCreateQueueModal() {
    editingQueueId = null;
    renderQueueFormModal();
}

// ============================================================
// EDIT QUEUE
// ============================================================

function editQueue(queueId) {
    const queue = queues.find(
        (item) => String(item.id) === String(queueId)
    );

    if (!queue) {
        showErrorMessage("Queue not found.");
        return;
    }

    editingQueueId = queue.id;
    renderQueueFormModal(queue);
}

// ============================================================
// QUEUE FORM MODAL
// ============================================================

function renderQueueFormModal(queue = null) {
    const isEditing = queue !== null;

    const content = `
        <form id="queueForm" class="list-page-form">
            <div class="list-page-form-group">
                <label for="queueName">Name</label>
                <input
                    type="text"
                    id="queueName"
                    name="name"
                    value="${escapeQueueAttribute(queue?.name ?? "")}"
                    required
                >
            </div>

            <div class="list-page-form-group">
                <label for="queueDescription">Description</label>
                <textarea
                    id="queueDescription"
                    name="description"
                    rows="4"
                    required
                >${escapeQueueHtml(queue?.description ?? "")}</textarea>
            </div>

            <div class="list-page-checkbox-group">
                <input
                    type="checkbox"
                    id="queueActive"
                    name="is_active"
                    ${queue?.is_active !== false ? "checked" : ""}
                >
                <label for="queueActive">Active</label>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelQueueButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    id="saveQueueButton"
                    class="primary-button"
                >
                    ${isEditing ? "Save Changes" : "Create Queue"}
                </button>
            </div>
        </form>
    `;

    document.getElementById("queueModal").classList.remove("hidden");

    renderModal({
        containerId: "queueModal",
        title: isEditing ? "Edit Queue" : "Create Queue",
        content,
        onClose: closeQueueModal
    });

    document
        .getElementById("queueForm")
        .addEventListener("submit", saveQueue);

    document
        .getElementById("cancelQueueButton")
        .addEventListener("click", closeQueueModal);
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeQueueModal() {
    const modal = document.getElementById("queueModal");

    modal.classList.add("hidden");
    modal.innerHTML = "";
    editingQueueId = null;
}

// ============================================================
// SAVE QUEUE
// ============================================================

async function saveQueue(event) {
    event.preventDefault();

    const queueData = {
        name: document.getElementById("queueName").value.trim(),
        description: document.getElementById("queueDescription").value.trim(),
        is_active: document.getElementById("queueActive").checked
    };

    if (!queueData.name || !queueData.description) {
        showWarningMessage("Please complete all required fields.");
        return;
    }

    const saveButton = document.getElementById("saveQueueButton");
    saveButton.disabled = true;

    try {
        if (editingQueueId === null) {
            await createQueue(queueData);
            closeQueueModal();
            showSuccessMessage("Queue created successfully.");
        } else {
            await updateQueue(editingQueueId, queueData);
            closeQueueModal();
            showSuccessMessage("Queue updated successfully.");
        }

        await loadQueues();
    } catch (error) {
        console.error("Error saving queue:", error);
        showErrorMessage(error.message || "Error saving queue.");

        if (saveButton.isConnected) {
            saveButton.disabled = false;
        }
    }
}

// ============================================================
// REMOVE QUEUE
// ============================================================

function openRemoveQueueModal(queueId) {
    const queue = queues.find(
        (item) => String(item.id) === String(queueId)
    );

    if (!queue) {
        showErrorMessage("Queue not found.");
        return;
    }

    const content = `
        <div class="list-page-confirmation">
            <p class="list-page-confirmation-message">
                Are you sure you want to remove "${escapeQueueHtml(queue.name)}"?
            </p>

            <p class="list-page-confirmation-description">
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="button"
                    id="cancelRemoveQueueButton"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="confirmRemoveQueueButton"
                    class="danger-button"
                >
                    Remove Queue
                </button>
            </div>
        </div>
    `;

    document.getElementById("queueModal").classList.remove("hidden");

    renderModal({
        containerId: "queueModal",
        title: "Remove Queue",
        content,
        onClose: closeQueueModal
    });

    document
        .getElementById("cancelRemoveQueueButton")
        .addEventListener("click", closeQueueModal);

    document
        .getElementById("confirmRemoveQueueButton")
        .addEventListener("click", () => removeQueue(queue.id));
}

async function removeQueue(queueId) {
    const confirmButton = document.getElementById("confirmRemoveQueueButton");

    if (confirmButton) {
        confirmButton.disabled = true;
    }

    try {
        await deleteQueueApi(queueId);

        closeQueueModal();
        showSuccessMessage("Queue removed successfully.");

        await loadQueues();
    } catch (error) {
        console.error("Error removing queue:", error);
        showErrorMessage(error.message || "Error removing queue.");

        if (confirmButton?.isConnected) {
            confirmButton.disabled = false;
        }
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeQueueHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeQueueAttribute(value) {
    return escapeQueueHtml(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}