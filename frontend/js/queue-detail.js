let queueId = null;
let currentQueue = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const params = new URLSearchParams(
            window.location.search
        );

        queueId = Number(params.get("id"));

        if (!queueId) {
            showErrorMessage("Invalid queue ID.");
            window.location.href = "queues.html";
            return;
        }

        await loadQueue();
    }
);

// ============================================================
// LOAD QUEUE
// ============================================================

async function loadQueue() {
    try {
        currentQueue = await getQueue(queueId);

        document.title =
            `${currentQueue.name} - Queue`;

        renderQueueDetailHeader();
        renderBasicInformation();

        await loadRelationships();
    } catch (error) {
        console.error(
            "Error loading queue:",
            error
        );

        showErrorMessage(
            error.message ||
            "Error loading queue."
        );
    }
}

// ============================================================
// DETAIL HEADER
// ============================================================

function renderQueueDetailHeader() {
    renderDetailHeader({
        containerId: "detailHeader",
        type: "Queue",
        title: currentQueue.name,
        description: "",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href = "queues.html";
        },
        onEdit: () => {
            window.location.href = `queues.html?edit=${queueId}`;
        }
    });
}

// ============================================================
// BASIC INFORMATION
// ============================================================

function renderBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",
        data: currentQueue,
        fields: [
            {
                key: "id",
                label: "ID",
                type: "text",
                readonly: true
            },
            {
                key: "name",
                label: "Name",
                type: "text"
            },
            {
                key: "description",
                label: "Description",
                type: "text"
            },
            {
                key: "is_active",
                label: "Status",
                type: "boolean"
            }
        ],
        expanded: true,
        onSave: async (updatedData) => {
            try {
                const data = {
                    name: updatedData.name,
                    description:
                        updatedData.description,
                    is_active:
                        updatedData.is_active
                };

                const updatedQueue =
                    await updateQueue(
                        queueId,
                        data
                    );

                currentQueue = updatedQueue;

                document.title =
                    `${currentQueue.name} - Queue`;

                renderQueueDetailHeader();

                showSuccessMessage(
                    "Queue updated successfully."
                );
            } catch (error) {
                console.error(
                    "Error updating queue:",
                    error
                );

                showErrorMessage(
                    "Error updating Queue."
                );

                throw error;
            }
        }
    });
}

// ============================================================
// RELATIONSHIPS
// ============================================================

async function loadRelationships() {
    try {
        const [
            issueTypes,
            tools,
            tickets
        ] = await Promise.all([
            getQueueIssueTypes(queueId),
            getQueueTools(queueId),
            loadQueueTicketsSafely()
        ]);

        renderRelationships({
            containerId: "relationships",
            relationships: [
                // ==================================================
                // ISSUE TYPES
                // ==================================================

                {
                    title: "Issue Types",
                    expanded: true,
                    entityLabel: "Issue Type",
                    addLabel: "Add Issue Type",
                    items: issueTypes || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: (item) =>
                        item.name || "-",
                    onAdd: () => {
                        openIssueTypeModal();
                    },
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "issueType"
                        });
                    },
                    onView: (item) => {
                        window.location.href =
                            `issue-type-detail.html?id=${item.id}`;
                    },
                    onEdit: (item) => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "issueType",
                            item: item
                        });
                    },
                    onRemove: (item) => {
                        removeIssueType(item.id);
                    }
                },

                // ==================================================
                // TOOLS
                // ==================================================

                {
                    title: "Tools",
                    expanded: true,
                    entityLabel: "Tool",
                    addLabel: "Add Tool",
                    items: tools || [],
                    actions: {
                        view: true,
                        edit: true,
                        remove: true,
                        add: true,
                        create: true
                    },
                    getItemName: (item) =>
                        item.name || "-",
                    onAdd: () => {
                        openToolModal();
                    },
                    onCreate: () => {
                        openRelationshipItemModal({
                            mode: "create",
                            relationship: "tool"
                        });
                    },
                    onView: (item) => {
                        window.location.href =
                            `tool-detail.html?id=${item.id}`;
                    },
                    onEdit: (item) => {
                        openRelationshipItemModal({
                            mode: "edit",
                            relationship: "tool",
                            item: item
                        });
                    },
                    onRemove: (item) => {
                        removeTool(item.id);
                    }
                },

                // ==================================================
                // RELATED TICKETS
                // ==================================================

                {
                    title: "Related Tickets",
                    expanded: true,
                    entityLabel: "Ticket",
                    items: tickets || [],
                    actions: {
                        view: true,
                        edit: false,
                        remove: false,
                        add: false,
                        create: false
                    },
                    getItemName: (item) =>
                        item.ticket_number ||
                        item.title ||
                        `Ticket ${item.id}`,
                    onView: (item) => {
                        window.location.href =
                            `ticket-detail.html?id=${item.id}`;
                    }
                }
            ]
        });
    } catch (error) {
        console.error(
            "Error loading relationships:",
            error
        );

        showErrorMessage(
            "Error loading Queue relationships."
        );
    }
}

// ============================================================
// LOAD RELATED TICKETS
// ============================================================

async function loadQueueTicketsSafely() {
    if (typeof getQueueTickets !== "function") {
        return [];
    }

    try {
        return await getQueueTickets(queueId);
    } catch (error) {
        console.error(
            "Error loading tickets:",
            error
        );

        return [];
    }
}

// ============================================================
// ISSUE TYPE MODAL
// ============================================================

async function openIssueTypeModal() {
    try {
        const [
            issueTypes,
            assignedIssueTypes
        ] = await Promise.all([
            getIssueTypes(),
            getQueueIssueTypes(queueId)
        ]);

        const assignedIds =
            (assignedIssueTypes || []).map(
                (issueType) =>
                    Number(issueType.id)
            );

        const availableIssueTypes =
            (issueTypes || []).filter(
                (issueType) =>
                    !assignedIds.includes(
                        Number(issueType.id)
                    )
            );

        const options =
            availableIssueTypes.length > 0
                ? availableIssueTypes
                    .map(
                        (issueType) => `
                            <option value="${issueType.id}">
                                ${escapeQueueHtml(
                                    issueType.name || "-"
                                )}
                            </option>
                        `
                    )
                    .join("")
                : `
                    <option value="">
                        No Issue Types available
                    </option>
                `;

        renderModal({
            containerId: "issueTypeModal",
            title: "Add Issue Type",
            content: `
                <div class="form-group">
                    <label for="issueTypeSelect">
                        Issue Type
                    </label>

                    <select
                        id="issueTypeSelect"
                    >
                        <option value="">
                            Select an Issue Type
                        </option>
                        ${options}
                    </select>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        id="cancelIssueTypeButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveIssueTypeButton"
                    >
                        Save
                    </button>
                </div>
            `,
            onClose: closeIssueTypeModal
        });

        const container =
            document.getElementById(
                "issueTypeModal"
            );

        container.classList.remove("hidden");

        const saveButton =
            document.getElementById(
                "saveIssueTypeButton"
            );

        const cancelButton =
            document.getElementById(
                "cancelIssueTypeButton"
            );

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                addSelectedIssueType
            );
        }

        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                closeIssueTypeModal
            );
        }
    } catch (error) {
        console.error(
            "Error loading issue types:",
            error
        );

        showErrorMessage(
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
        select && select.value
            ? Number(select.value)
            : null;

    if (!issueTypeId) {
        showWarningMessage(
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

        showSuccessMessage(
            "Issue Type added successfully."
        );

        await loadRelationships();
    } catch (error) {
        console.error(
            "Error adding issue type:",
            error
        );

        showErrorMessage(
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
    openRemoveRelationshipModal({
        relationship: "Issue Type",
        itemId: issueTypeId,
        onConfirm: async () => {
            try {
        await removeQueueIssueType(
            queueId,
            issueTypeId
        );

        showSuccessMessage(
            "Issue Type removed successfully."
        );

        await loadRelationships();
            } catch (error) {
                console.error(
                    "Error removing issue type:",
                    error
                );

                showErrorMessage(
                    "Error removing Issue Type."
                );
            }
        }
    });
}

// ============================================================
// CLOSE ISSUE TYPE MODAL
// ============================================================

function closeIssueTypeModal() {
    const modal =
        document.getElementById(
            "issueTypeModal"
        );

    if (modal) {
        modal.classList.add("hidden");
    }
}

// ============================================================
// TOOL MODAL
// ============================================================

async function openToolModal() {
    try {
        const [
            tools,
            assignedTools
        ] = await Promise.all([
            getTools(),
            getQueueTools(queueId)
        ]);

        const assignedIds =
            (assignedTools || []).map(
                (tool) => Number(tool.id)
            );

        const availableTools =
            (tools || []).filter(
                (tool) =>
                    !assignedIds.includes(
                        Number(tool.id)
                    )
            );

        const options =
            availableTools.length > 0
                ? availableTools
                    .map(
                        (tool) => `
                            <option value="${tool.id}">
                                ${escapeQueueHtml(
                                    tool.name || "-"
                                )}
                            </option>
                        `
                    )
                    .join("")
                : `
                    <option value="">
                        No Tools available
                    </option>
                `;

        renderModal({
            containerId: "toolModal",
            title: "Add Tool",
            content: `
                <div class="form-group">
                    <label for="toolSelect">
                        Tool
                    </label>

                    <select
                        id="toolSelect"
                    >
                        <option value="">
                            Select a Tool
                        </option>
                        ${options}
                    </select>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        id="cancelToolButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveToolButton"
                    >
                        Save
                    </button>
                </div>
            `,
            onClose: closeToolModal
        });

        const container =
            document.getElementById(
                "toolModal"
            );

        container.classList.remove("hidden");

        const saveButton =
            document.getElementById(
                "saveToolButton"
            );

        const cancelButton =
            document.getElementById(
                "cancelToolButton"
            );

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                addSelectedTool
            );
        }

        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                closeToolModal
            );
        }
    } catch (error) {
        console.error(
            "Error loading tools:",
            error
        );

        showErrorMessage(
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
        select && select.value
            ? Number(select.value)
            : null;

    if (!toolId) {
        showWarningMessage(
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

        showSuccessMessage(
            "Tool added successfully."
        );

        await loadRelationships();
    } catch (error) {
        console.error(
            "Error adding tool:",
            error
        );

        showErrorMessage(
            "Error adding Tool."
        );
    }
}

// ============================================================
// REMOVE TOOL
// ============================================================

async function removeTool(toolId) {
    openRemoveRelationshipModal({
        relationship: "Tool",
        itemId: toolId,
        onConfirm: async () => {
            try {
                await removeQueueTool(
                    queueId,
                    toolId
                );

                showSuccessMessage(
                    "Tool removed successfully."
                );

                await loadRelationships();
            } catch (error) {
                console.error(
                    "Error removing tool:",
                    error
                );

                showErrorMessage(
                    "Error removing Tool."
                );
            }
        }
    });
}

// ============================================================
// CLOSE TOOL MODAL
// ============================================================

function closeToolModal() {
    const modal =
        document.getElementById(
            "toolModal"
        );

    if (modal) {
        modal.classList.add("hidden");
    }
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeQueueHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// RELATIONSHIP ITEM MODALS
// ============================================================

function ensureQueueModalContainer(containerId) {
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.className = "modal hidden";
        document.body.appendChild(container);
    }

    return container;
}

function openRelationshipItemModal({
    mode,
    relationship,
    item = null
}) {
    const containerId = "relationshipItemModal";
    ensureQueueModalContainer(containerId);

    const isTool = relationship === "tool";
    const label = isTool ? "Tool" : "Issue Type";
    const title = `${mode === "create" ? "Create" : "Edit"} ${label}`;

    const data = item || {};

    const issueTypeFields = !isTool ? `
        <div class="form-group">
            <label for="relationshipItem_category">Category</label>
            <input
                id="relationshipItem_category"
                type="text"
                value="${escapeQueueHtml(data.category || "")}"
            >
        </div>
        <div class="form-group">
            <label for="relationshipItem_display_name">Display Name</label>
            <input
                id="relationshipItem_display_name"
                type="text"
                value="${escapeQueueHtml(data.display_name || "")}"
            >
        </div>
        <div class="form-group">
            <label for="relationshipItem_search_keywords">Search Keywords</label>
            <input
                id="relationshipItem_search_keywords"
                type="text"
                value="${escapeQueueHtml(data.search_keywords || "")}"
            >
        </div>
    ` : "";

    const toolFields = isTool ? `
        <div class="form-group">
            <label for="relationshipItem_access_request">Access Request</label>
            <input
                id="relationshipItem_access_request"
                type="text"
                value="${escapeQueueHtml(data.access_request || "")}"
            >
        </div>
        <div class="form-group">
            <label for="relationshipItem_password_reset">Password Reset</label>
            <input
                id="relationshipItem_password_reset"
                type="text"
                value="${escapeQueueHtml(data.password_reset || "")}"
            >
        </div>
    ` : "";

    renderModal({
        containerId,
        title,
        content: `
            <div class="form-group">
                <label for="relationshipItem_name">Name</label>
                <input id="relationshipItem_name" type="text" value="${escapeQueueHtml(data.name || "")}">
            </div>
            <div class="form-group">
                <label for="relationshipItem_description">Description</label>
                <textarea
                    id="relationshipItem_description"
                    rows="4"
                >${escapeQueueHtml(data.description || "")}</textarea>
            </div>
            ${issueTypeFields}
            ${toolFields}
            <div class="form-group checkbox-group">
                <input
                    id="relationshipItem_is_active"
                    type="checkbox"
                    ${data.is_active !== false ? "checked" : ""}
                >
                <label for="relationshipItem_is_active">
                    Active
                </label>
            </div>
            <div class="modal-actions">
                <button type="button" id="relationshipItemCancelButton">Cancel</button>
                <button type="button" id="relationshipItemSaveButton">Save</button>
            </div>
        `,
        onClose: closeRelationshipItemModal
    });

    const container = document.getElementById(containerId);
    container.classList.remove("hidden");

    document.getElementById("relationshipItemCancelButton")
        ?.addEventListener("click", closeRelationshipItemModal);

    document.getElementById("relationshipItemSaveButton")
        ?.addEventListener("click", async () => {
            await saveRelationshipItem({
                mode,
                relationship,
                item
            });
        });
}

async function saveRelationshipItem({
    mode,
    relationship,
    item
}) {
    const name = document.getElementById("relationshipItem_name")?.value.trim();
    const description = document.getElementById("relationshipItem_description")?.value.trim();
    const isActive = document.getElementById("relationshipItem_is_active")?.checked ?? true;

    if (!name) {
        showWarningMessage(`${relationship === "tool" ? "Tool" : "Issue Type"} name is required.`);
        return;
    }

    try {
        let savedItem;

        if (relationship === "tool") {
            const data = {
                name,
                description,
                access_request: document.getElementById("relationshipItem_access_request")?.value.trim() || "",
                password_reset: document.getElementById("relationshipItem_password_reset")?.value.trim() || "",
                is_active: isActive
            };

            savedItem = mode === "create"
                ? await createTool(data)
                : await updateTool(item.id, data);

            if (mode === "create") {
                await addQueueTool(queueId, savedItem.id);
            }
        } else {
            const category =
                document.getElementById(
                    "relationshipItem_category"
                )?.value.trim() || "";

            const displayName =
                document.getElementById(
                    "relationshipItem_display_name"
                )?.value.trim() || "";

            const searchKeywords =
                document.getElementById(
                    "relationshipItem_search_keywords"
                )?.value.trim() || "";

            const data = {
                name,
                description,
                category,
                display_name: displayName,
                search_keywords: searchKeywords,
                is_active: isActive
            };

            savedItem = mode === "create"
                ? await createIssueType(data)
                : await updateIssueType(item.id, data);

            if (mode === "create") {
                await addQueueIssueType(queueId, savedItem.id);
            }
        }

        closeRelationshipItemModal();
        showSuccessMessage(
            `${relationship === "tool" ? "Tool" : "Issue Type"} ${mode === "create" ? "created and added" : "updated"} successfully.`
        );
        await loadRelationships();
    } catch (error) {
        console.error("Error saving relationship item:", error);
        showErrorMessage(
            error.message ||
            `Error ${mode === "create" ? "creating" : "updating"} ${relationship}.`
        );
    }
}

function closeRelationshipItemModal() {
    const modal = document.getElementById("relationshipItemModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// ============================================================
// REMOVE RELATIONSHIP MODAL
// ============================================================

function openRemoveRelationshipModal({
    relationship,
    itemId,
    onConfirm
}) {
    const containerId = "removeRelationshipModal";
    ensureQueueModalContainer(containerId);

    renderModal({
        containerId,
        title: `Remove ${relationship}`,
        content: `
            <p>Are you sure you want to remove this ${escapeQueueHtml(relationship)} from the queue?</p>
            <div class="modal-actions">
                <button type="button" id="removeRelationshipCancelButton">Cancel</button>
                <button type="button" id="removeRelationshipConfirmButton">Remove</button>
            </div>
        `,
        onClose: closeRemoveRelationshipModal
    });

    document.getElementById(containerId).classList.remove("hidden");

    document.getElementById("removeRelationshipCancelButton")
        ?.addEventListener("click", closeRemoveRelationshipModal);

    document.getElementById("removeRelationshipConfirmButton")
        ?.addEventListener("click", async () => {
            closeRemoveRelationshipModal();
            await onConfirm();
        });
}

function closeRemoveRelationshipModal() {
    const modal = document.getElementById("removeRelationshipModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

function escapeQueueHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
