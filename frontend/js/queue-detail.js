let queueId = null;

let currentQueue = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

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


        setupNavigation();

        setupEventListeners();


        await loadQueue();

    }
);


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    document
        .getElementById("ticketsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


    document
        .getElementById("toolsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "tools.html";

            }
        );


    document
        .getElementById("locationsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "locations.html";

            }
        );


    document
        .getElementById("queuesButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "queues.html";

            }
        );


    document
        .getElementById("wmsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "warehouse-management-systems.html";

            }
        );


    document
        .getElementById("formsButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "forms.html";

            }
        );


    document
        .getElementById(
            "troubleshootingTemplatesButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "troubleshooting-templates.html";

            }
        );


    document
        .getElementById(
            "knowledgeBaseButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "knowledge-base.html";

            }
        );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // ========================================================
    // BACK
    // ========================================================

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "queues.html";

            }
        );


    // ========================================================
    // EDIT
    // ========================================================

    document
        .getElementById("editButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    `queues.html?edit=${queueId}`;

            }
        );


    // ========================================================
    // ISSUE TYPES
    // ========================================================

    document
        .getElementById(
            "addIssueTypeButton"
        )
        .addEventListener(
            "click",
            openIssueTypeModal
        );


    document
        .getElementById(
            "closeIssueTypeModalButton"
        )
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById(
            "cancelIssueTypeButton"
        )
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById(
            "saveIssueTypeButton"
        )
        .addEventListener(
            "click",
            addSelectedIssueType
        );


    // ========================================================
    // TOOLS
    // ========================================================

    document
        .getElementById(
            "addToolButton"
        )
        .addEventListener(
            "click",
            openToolModal
        );


    document
        .getElementById(
            "closeToolModalButton"
        )
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById(
            "cancelToolButton"
        )
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById(
            "saveToolButton"
        )
        .addEventListener(
            "click",
            addSelectedTool
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


        await Promise.all([
            loadIssueTypes(),
            loadTools(),
            loadTickets()
        ]);

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


    // ========================================================
    // TITLE
    // ========================================================

    document.getElementById(
        "queueTitle"
    ).textContent =
        currentQueue.name;


    // ========================================================
    // HEADER DESCRIPTION
    // ========================================================

    document.getElementById(
        "queueDescriptionHeader"
    ).textContent =
        currentQueue.description || "";


    // ========================================================
    // NAME
    // ========================================================

    document.getElementById(
        "queueName"
    ).textContent =
        currentQueue.name ?? "N/A";


    // ========================================================
    // DESCRIPTION
    // ========================================================

    document.getElementById(
        "queueDescription"
    ).textContent =
        currentQueue.description ?? "N/A";


    // ========================================================
    // STATUS
    // ========================================================

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


    // ========================================================
    // ID
    // ========================================================

    document.getElementById(
        "queueId"
    ).textContent =
        currentQueue.id;

}


// ============================================================
// ISSUE TYPES
// ============================================================

async function loadIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "issueTypesEmptyMessage"
        );


    try {

        const issueTypes =
            await getQueueIssueTypes(
                queueId
            );


        tableBody.innerHTML =
            "";


        if (
            !issueTypes ||
            issueTypes.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        issueTypes.forEach(
            issueType => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <a
                            href="issue-type-detail.html?id=${issueType.id}"
                        >
                            ${escapeHtml(
                                issueType.name || "-"
                            )}
                        </a>

                    </td>


                    <td>
                        ${escapeHtml(
                            issueType.description || "-"
                        )}
                    </td>


                    <td>
                        ${createStatusBadge(
                            issueType.is_active
                        )}
                    </td>


                    <td>

                        <button
                            class="action-button"
                            onclick="removeIssueType(${issueType.id})"
                        >
                            Remove
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );


        emptyMessage.style.display =
            "block";

    }

}


// ============================================================
// OPEN ISSUE TYPE MODAL
// ============================================================

async function openIssueTypeModal() {

    const select =
        document.getElementById(
            "issueTypeSelect"
        );


    select.innerHTML = `
        <option value="">
            Select an Issue Type
        </option>
    `;


    try {

        const [
            issueTypes,
            assignedIssueTypes
        ] =
            await Promise.all([
                getIssueTypes(),
                getQueueIssueTypes(
                    queueId
                )
            ]);


        const assignedIds =
            assignedIssueTypes.map(
                issueType =>
                    issueType.id
            );


        issueTypes.forEach(
            issueType => {

                if (
                    assignedIds.includes(
                        issueType.id
                    )
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    issueType.id;


                option.textContent =
                    issueType.name;


                select.appendChild(
                    option
                );

            }
        );


        document
            .getElementById(
                "issueTypeModal"
            )
            .classList
            .remove("hidden");

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );


        alert(
            "Error loading Issue Types."
        );

    }

}


// ============================================================
// ADD ISSUE TYPE
// ============================================================

async function addSelectedIssueType() {

    const select =
        document.getElementById(
            "issueTypeSelect"
        );


    const issueTypeId =
        select.value
            ? Number(select.value)
            : null;


    if (!issueTypeId) {

        alert(
            "Please select an Issue Type."
        );

        return;

    }


    try {

        await addQueueIssueType(
            queueId,
            issueTypeId
        );


        closeIssueTypeModal();


        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error adding issue type:",
            error
        );


        alert(
            "Error adding Issue Type."
        );

    }

}


// ============================================================
// REMOVE ISSUE TYPE
// ============================================================

async function removeIssueType(
    issueTypeId
) {

    if (
        !confirm(
            "Remove this Issue Type from the queue?"
        )
    ) {
        return;
    }


    try {

        await removeQueueIssueType(
            queueId,
            issueTypeId
        );


        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error removing issue type:",
            error
        );


        alert(
            "Error removing Issue Type."
        );

    }

}


// ============================================================
// CLOSE ISSUE TYPE MODAL
// ============================================================

function closeIssueTypeModal() {

    document
        .getElementById(
            "issueTypeModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// TOOLS
// ============================================================

async function loadTools() {

    const tableBody =
        document.getElementById(
            "toolsTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "toolsEmptyMessage"
        );


    try {

        const tools =
            await getQueueTools(
                queueId
            );


        tableBody.innerHTML =
            "";


        if (
            !tools ||
            tools.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        tools.forEach(
            tool => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <a
                            href="tool-detail.html?id=${tool.id}"
                        >
                            ${escapeHtml(
                                tool.name || "-"
                            )}
                        </a>

                    </td>


                    <td>
                        ${escapeHtml(
                            tool.description || "-"
                        )}
                    </td>


                    <td>
                        ${createStatusBadge(
                            tool.is_active
                        )}
                    </td>


                    <td>

                        <button
                            class="action-button"
                            onclick="removeTool(${tool.id})"
                        >
                            Remove
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );


        emptyMessage.style.display =
            "block";

    }

}


// ============================================================
// OPEN TOOL MODAL
// ============================================================

async function openToolModal() {

    const select =
        document.getElementById(
            "toolSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a Tool
        </option>
    `;


    try {

        const [
            tools,
            assignedTools
        ] =
            await Promise.all([
                getTools(),
                getQueueTools(
                    queueId
                )
            ]);


        const assignedIds =
            assignedTools.map(
                tool =>
                    tool.id
            );


        tools.forEach(
            tool => {

                if (
                    assignedIds.includes(
                        tool.id
                    )
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    tool.id;


                option.textContent =
                    tool.name;


                select.appendChild(
                    option
                );

            }
        );


        document
            .getElementById(
                "toolModal"
            )
            .classList
            .remove("hidden");

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );


        alert(
            "Error loading Tools."
        );

    }

}


// ============================================================
// ADD TOOL
// ============================================================

async function addSelectedTool() {

    const select =
        document.getElementById(
            "toolSelect"
        );


    const toolId =
        select.value
            ? Number(select.value)
            : null;


    if (!toolId) {

        alert(
            "Please select a Tool."
        );

        return;

    }


    try {

        await addQueueTool(
            queueId,
            toolId
        );


        closeToolModal();


        await loadTools();

    } catch (error) {

        console.error(
            "Error adding tool:",
            error
        );


        alert(
            "Error adding Tool."
        );

    }

}


// ============================================================
// REMOVE TOOL
// ============================================================

async function removeTool(
    toolId
) {

    if (
        !confirm(
            "Remove this Tool from the queue?"
        )
    ) {
        return;
    }


    try {

        await removeQueueTool(
            queueId,
            toolId
        );


        await loadTools();

    } catch (error) {

        console.error(
            "Error removing tool:",
            error
        );


        alert(
            "Error removing Tool."
        );

    }

}


// ============================================================
// CLOSE TOOL MODAL
// ============================================================

function closeToolModal() {

    document
        .getElementById(
            "toolModal"
        )
        .classList
        .add("hidden");

}


// ============================================================
// RELATED TICKETS
// ============================================================

async function loadTickets() {

    const tableBody =
        document.getElementById(
            "ticketsTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "ticketsEmptyMessage"
        );


    /*
     * We only load tickets if the API
     * exposes a queue-based ticket endpoint.
     */

    if (
        typeof getQueueTickets !==
        "function"
    ) {

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Queue ticket listing is not available yet.";

        emptyMessage.style.display =
            "block";

        return;

    }


    try {

        const tickets =
            await getQueueTickets(
                queueId
            );


        tableBody.innerHTML =
            "";


        if (
            !tickets ||
            tickets.length === 0
        ) {

            emptyMessage.textContent =
                "No tickets assigned to this queue.";

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        tickets.forEach(
            ticket => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            ticket.ticket_number || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            ticket.title || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            ticket.user_name || "-"
                        )}
                    </td>


                    <td>

                        <a
                            href="ticket-detail.html?id=${ticket.id}"
                        >
                            View
                        </a>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            "Error loading tickets:",
            error
        );


        emptyMessage.textContent =
            "Error loading tickets.";


        emptyMessage.style.display =
            "block";

    }

}


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(
    isActive
) {

    return `

        <span
            class="status-badge ${
                isActive
                    ? "active"
                    : "inactive"
            }"
        >

            ${
                isActive
                    ? "Active"
                    : "Inactive"
            }

        </span>

    `;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}