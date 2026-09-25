// ============================================================
// TOOL DETAIL
// ============================================================

const params = new URLSearchParams(window.location.search);
const toolId = Number(params.get("id"));


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeToolDetail
);


async function initializeToolDetail() {

    if (!toolId) {

        window.location.href = "tools.html";

        return;
    }

    setupNavigation();
    setupEventListeners();

    await loadToolDetail();
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const backButton =
        document.getElementById("backButton");

    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "tools.html";
        });
    }


    const ticketsButton =
        document.getElementById("ticketsButton");

    if (ticketsButton) {
        ticketsButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }


    const toolsButton =
        document.getElementById("toolsButton");

    if (toolsButton) {
        toolsButton.addEventListener("click", () => {
            window.location.href = "tools.html";
        });
    }


    const locationsButton =
        document.getElementById("locationsButton");

    if (locationsButton) {
        locationsButton.addEventListener("click", () => {
            window.location.href = "locations.html";
        });
    }


    const queuesButton =
        document.getElementById("queuesButton");

    if (queuesButton) {
        queuesButton.addEventListener("click", () => {
            window.location.href = "queues.html";
        });
    }


    const wmsButton =
        document.getElementById("wmsButton");

    if (wmsButton) {
        wmsButton.addEventListener("click", () => {
            window.location.href =
                "warehouse-management-systems.html";
        });
    }


    const formsButton =
        document.getElementById("formsButton");

    if (formsButton) {
        formsButton.addEventListener("click", () => {
            window.location.href = "forms.html";
        });
    }


    const troubleshootingTemplatesButton =
        document.getElementById(
            "troubleshootingTemplatesButton"
        );

    if (troubleshootingTemplatesButton) {
        troubleshootingTemplatesButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "troubleshooting-templates.html";
            }
        );
    }


    const knowledgeBaseButton =
        document.getElementById("knowledgeBaseButton");

    if (knowledgeBaseButton) {
        knowledgeBaseButton.addEventListener("click", () => {
            window.location.href =
                "knowledge-base.html";
        });
    }

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // --------------------------------------------------------
    // TOOL EDIT
    // --------------------------------------------------------

    const toolEditForm =
        document.getElementById("toolEditForm");

    if (toolEditForm) {
        toolEditForm.addEventListener(
            "submit",
            saveTool
        );
    }


    // --------------------------------------------------------
    // ISSUE TYPES
    // --------------------------------------------------------

    document
        .getElementById("addIssueTypeButton")
        .addEventListener(
            "click",
            openIssueTypeModal
        );


    document
        .getElementById("closeIssueTypeModal")
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById("cancelIssueTypeButton")
        .addEventListener(
            "click",
            closeIssueTypeModal
        );


    document
        .getElementById("issueTypeForm")
        .addEventListener(
            "submit",
            addIssueType
        );


    // --------------------------------------------------------
    // KNOWLEDGE BASE
    // --------------------------------------------------------

    document
        .getElementById("addKnowledgeBaseButton")
        .addEventListener(
            "click",
            openKnowledgeBaseModal
        );


    document
        .getElementById("closeKnowledgeBaseModal")
        .addEventListener(
            "click",
            closeKnowledgeBaseModal
        );


    document
        .getElementById("cancelKnowledgeBaseButton")
        .addEventListener(
            "click",
            closeKnowledgeBaseModal
        );


    document
        .getElementById("knowledgeBaseForm")
        .addEventListener(
            "submit",
            addKnowledgeBase
        );


    // --------------------------------------------------------
    // TROUBLESHOOTING TEMPLATES
    // --------------------------------------------------------

    document
        .getElementById(
            "addTroubleshootingTemplateButton"
        )
        .addEventListener(
            "click",
            openTroubleshootingTemplateModal
        );


    document
        .getElementById(
            "closeTroubleshootingTemplateModal"
        )
        .addEventListener(
            "click",
            closeTroubleshootingTemplateModal
        );


    document
        .getElementById(
            "cancelTroubleshootingTemplateButton"
        )
        .addEventListener(
            "click",
            closeTroubleshootingTemplateModal
        );


    document
        .getElementById(
            "troubleshootingTemplateForm"
        )
        .addEventListener(
            "submit",
            addTroubleshootingTemplate
        );


    // --------------------------------------------------------
    // QUEUES
    // --------------------------------------------------------

    document
        .getElementById("addQueueButton")
        .addEventListener(
            "click",
            openQueueModal
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
            addQueue
        );


    // --------------------------------------------------------
    // KNOWLEDGE BASE NOTES
    // --------------------------------------------------------

    document
        .getElementById("addKnowledgeBaseNoteButton")
        .addEventListener(
            "click",
            openKnowledgeBaseNoteModal
        );


    document
        .getElementById("closeKnowledgeBaseNoteModal")
        .addEventListener(
            "click",
            closeKnowledgeBaseNoteModal
        );


    document
        .getElementById("cancelKnowledgeBaseNoteButton")
        .addEventListener(
            "click",
            closeKnowledgeBaseNoteModal
        );


    document
        .getElementById("knowledgeBaseNoteForm")
        .addEventListener(
            "submit",
            addKnowledgeBaseNote
        );
}


// ============================================================
// LOAD TOOL
// ============================================================

async function loadToolDetail() {

    try {

        const tool = await getTool(toolId);

        renderToolInformation(tool);

        await Promise.all([
            loadIssueTypes(),
            loadKnowledgeBase(),
            loadTroubleshootingTemplates(),
            loadQueues(),
            loadKnowledgeBaseNotes()
        ]);

    } catch (error) {

        console.error(
            "Error loading tool detail:",
            error
        );

        alert("Error loading tool.");

        window.location.href = "tools.html";
    }
}


// ============================================================
// TOOL INFORMATION
// ============================================================

function renderToolInformation(tool) {

    document.getElementById("toolName").textContent =
        tool.name || "Tool";


    document.getElementById("toolDescription").textContent =
        tool.description || "";


    document.getElementById("toolId").textContent =
        tool.id;


    document.getElementById("toolNameInput").value =
        tool.name || "";


    document.getElementById("toolDescriptionInput").value =
        tool.description || "";


    document.getElementById("accessRequestInput").value =
        tool.access_request || "";


    document.getElementById("passwordResetInput").value =
        tool.password_reset || "";


    document.getElementById("toolActiveInput").checked =
        Boolean(tool.is_active);


    const status =
        document.getElementById("toolStatus");


    status.textContent =
        tool.is_active
            ? "Active"
            : "Inactive";


    status.classList.remove(
        "active",
        "inactive"
    );


    status.classList.add(
        tool.is_active
            ? "active"
            : "inactive"
    );
}


// ============================================================
// SAVE TOOL
// ============================================================

async function saveTool(event) {

    event.preventDefault();

    const toolData = {

        name:
            document.getElementById(
                "toolNameInput"
            ).value.trim(),

        description:
            document.getElementById(
                "toolDescriptionInput"
            ).value.trim(),

        access_request:
            document.getElementById(
                "accessRequestInput"
            ).value.trim(),

        password_reset:
            document.getElementById(
                "passwordResetInput"
            ).value.trim(),

        is_active:
            document.getElementById(
                "toolActiveInput"
            ).checked

    };


    if (!toolData.name) {

        alert("Tool name is required.");

        return;
    }


    if (!toolData.description) {

        alert("Tool description is required.");

        return;
    }


    try {

        const updatedTool =
            await updateTool(
                toolId,
                toolData
            );


        renderToolInformation(
            updatedTool
        );


        alert(
            "Tool updated successfully."
        );

    } catch (error) {

        console.error(
            "Error updating tool:",
            error
        );

        alert(
            "Error updating Tool."
        );
    }
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

    const table =
        document.getElementById(
            "issueTypesTable"
        );


    try {

        const issueTypes =
            await getToolIssueTypes(toolId);


        tableBody.innerHTML = "";


        if (
            !issueTypes ||
            issueTypes.length === 0
        ) {

            emptyMessage.classList.remove("hidden");
            table.classList.add("hidden");

            return;
        }


        emptyMessage.classList.add("hidden");
        table.classList.remove("hidden");


        issueTypes.forEach(issueType => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(issueType.name)}
                </td>

                <td>
                    ${escapeHtml(issueType.category)}
                </td>

                <td>
                    ${escapeHtml(
                        issueType.display_name || ""
                    )}
                </td>

                <td>

                    <span
                        class="status-badge ${
                            issueType.is_active
                                ? "active"
                                : "inactive"
                        }">

                        ${
                            issueType.is_active
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </td>

                <td>

                    <button
                        class="action-button view-button">
                        View
                    </button>

                    <button
                        class="action-button delete-button">
                        Remove
                    </button>

                </td>
            `;


            row
                .querySelector(".view-button")
                .addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            `issue-type-detail.html?id=${issueType.id}`;
                    }
                );


            row
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () =>
                        removeIssueType(
                            issueType.id
                        )
                );


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading tool issue types:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Error loading Issue Types.";

        emptyMessage.classList.remove("hidden");

        table.classList.add("hidden");
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
            allIssueTypes,
            relatedIssueTypes
        ] = await Promise.all([
            getIssueTypes(),
            getToolIssueTypes(toolId)
        ]);


        const relatedIds =
            new Set(
                relatedIssueTypes.map(
                    item => Number(item.id)
                )
            );


        allIssueTypes.forEach(issueType => {

            if (
                !relatedIds.has(
                    Number(issueType.id)
                )
            ) {

                const option =
                    document.createElement("option");

                option.value =
                    issueType.id;

                option.textContent =
                    issueType.name;

                select.appendChild(option);
            }

        });


        document
            .getElementById("issueTypeModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "Error loading Issue Types:",
            error
        );

        alert(
            "Error loading Issue Types."
        );
    }
}


// ============================================================
// CLOSE ISSUE TYPE MODAL
// ============================================================

function closeIssueTypeModal() {

    document
        .getElementById("issueTypeModal")
        .classList.add("hidden");

}


// ============================================================
// ADD ISSUE TYPE
// ============================================================

async function addIssueType(event) {

    event.preventDefault();


    const issueTypeId =
        Number(
            document.getElementById(
                "issueTypeSelect"
            ).value
        );


    if (!issueTypeId) {

        return;
    }


    try {

        await addToolIssueType(
            toolId,
            issueTypeId
        );


        closeIssueTypeModal();

        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error adding Issue Type:",
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

async function removeIssueType(issueTypeId) {

    const confirmed =
        confirm(
            "Remove this Issue Type from the Tool?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await removeToolIssueType(
            toolId,
            issueTypeId
        );


        await loadIssueTypes();

    } catch (error) {

        console.error(
            "Error removing Issue Type:",
            error
        );

        alert(
            "Error removing Issue Type."
        );
    }
}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

async function loadKnowledgeBase() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "knowledgeBaseEmptyMessage"
        );

    const table =
        document.getElementById(
            "knowledgeBaseTable"
        );


    try {

        const knowledgeBase =
            await getToolKnowledgeBase(toolId);


        tableBody.innerHTML = "";


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            emptyMessage.classList.remove("hidden");
            table.classList.add("hidden");

            return;
        }


        emptyMessage.classList.add("hidden");
        table.classList.remove("hidden");


        knowledgeBase.forEach(kb => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        kb.article_number
                    )}
                </td>

                <td>
                    ${escapeHtml(kb.title)}
                </td>

                <td>
                    ${escapeHtml(
                        kb.description
                    )}
                </td>

                <td>

                    <button
                        class="action-button view-button">

                        View

                    </button>

                    <button
                        class="action-button delete-button">

                        Remove

                    </button>

                </td>
            `;


            row
                .querySelector(".view-button")
                .addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            `knowledge-base-detail.html?id=${kb.id}`;
                    }
                );

            row
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () =>
                        removeKnowledgeBase(
                            kb.id
                        )
                );


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading Knowledge Base:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Error loading Knowledge Base.";

        emptyMessage.classList.remove("hidden");

        table.classList.add("hidden");
    }
}


// ============================================================
// OPEN KNOWLEDGE BASE MODAL
// ============================================================

async function openKnowledgeBaseModal() {

    const select =
        document.getElementById(
            "knowledgeBaseSelect"
        );


    select.innerHTML = `
        <option value="">
            Select an Article
        </option>
    `;


    try {

        const [
            allKnowledgeBase,
            relatedKnowledgeBase
        ] = await Promise.all([
            getKnowledgeBaseItems(),
            getToolKnowledgeBase(toolId)
        ]);


        const relatedIds =
            new Set(
                relatedKnowledgeBase.map(
                    item => Number(item.id)
                )
            );


        allKnowledgeBase.forEach(kb => {

            if (
                !relatedIds.has(
                    Number(kb.id)
                )
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    kb.id;

                option.textContent =
                    `${kb.article_number} - ${kb.title}`;

                select.appendChild(option);
            }

        });


        document
            .getElementById("knowledgeBaseModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "Error loading Knowledge Base:",
            error
        );

        alert(
            "Error loading Knowledge Base."
        );
    }
}


// ============================================================
// CLOSE KNOWLEDGE BASE MODAL
// ============================================================

function closeKnowledgeBaseModal() {

    document
        .getElementById(
            "knowledgeBaseModal"
        )
        .classList.add("hidden");

}


// ============================================================
// ADD KNOWLEDGE BASE
// ============================================================

async function addKnowledgeBase(event) {

    event.preventDefault();


    const knowledgeBaseId =
        Number(
            document.getElementById(
                "knowledgeBaseSelect"
            ).value
        );


    if (!knowledgeBaseId) {

        return;
    }


    try {

        await addToolKnowledgeBase(
            toolId,
            knowledgeBaseId
        );


        closeKnowledgeBaseModal();

        await loadKnowledgeBase();

    } catch (error) {

        console.error(
            "Error adding Knowledge Base:",
            error
        );

        alert(
            "Error adding Knowledge Base."
        );
    }
}


// ============================================================
// REMOVE KNOWLEDGE BASE
// ============================================================

async function removeKnowledgeBase(
    knowledgeBaseId
) {

    const confirmed =
        confirm(
            "Remove this Knowledge Base article from the Tool?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await removeToolKnowledgeBase(
            toolId,
            knowledgeBaseId
        );


        await loadKnowledgeBase();

    } catch (error) {

        console.error(
            "Error removing Knowledge Base:",
            error
        );

        alert(
            "Error removing Knowledge Base."
        );
    }
}


// ============================================================
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function loadTroubleshootingTemplates() {

    const tableBody =
        document.getElementById(
            "troubleshootingTemplatesTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "troubleshootingTemplatesEmptyMessage"
        );

    const table =
        document.getElementById(
            "troubleshootingTemplatesTable"
        );


    try {

        const templates =
            await getToolTroubleshootingTemplates(
                toolId
            );


        tableBody.innerHTML = "";


        if (
            !templates ||
            templates.length === 0
        ) {

            emptyMessage.classList.remove("hidden");
            table.classList.add("hidden");

            return;
        }


        emptyMessage.classList.add("hidden");
        table.classList.remove("hidden");


        templates.forEach(template => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        template.name || "N/A"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        template.generated_description || ""
                    )}
                </td>

                <td>

                    <span
                        class="status-badge ${
                            template.is_active
                                ? "active"
                                : "inactive"
                        }">

                        ${
                            template.is_active
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </td>

                <td>

                    <button
                        class="action-button view-button">

                        View

                    </button>

                    <button
                        class="action-button delete-button">

                        Remove

                    </button>

                </td>
            `;


            row
                .querySelector(".view-button")
                .addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            `troubleshooting-template-detail.html?id=${template.id}`;
                    }
                );

            row
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () =>
                        removeTroubleshootingTemplate(
                            template.id
                        )
                );


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading Troubleshooting Templates:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Error loading Troubleshooting Templates.";

        emptyMessage.classList.remove("hidden");

        table.classList.add("hidden");
    }
}


// ============================================================
// OPEN TROUBLESHOOTING TEMPLATE MODAL
// ============================================================

async function openTroubleshootingTemplateModal() {

    const select =
        document.getElementById(
            "troubleshootingTemplateSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a Template
        </option>
    `;


    try {

        const [
            allTemplates,
            relatedTemplates
        ] = await Promise.all([
            getTroubleshootingTemplates(),
            getToolTroubleshootingTemplates(toolId)
        ]);


        const relatedIds =
            new Set(
                relatedTemplates.map(
                    item => Number(item.id)
                )
            );


        allTemplates.forEach(template => {

            if (
                !relatedIds.has(
                    Number(template.id)
                )
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    template.id;

                option.textContent =
                    template.name ||
                    `Template ${template.id}`;

                select.appendChild(option);
            }

        });


        document
            .getElementById(
                "troubleshootingTemplateModal"
            )
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "Error loading Troubleshooting Templates:",
            error
        );

        alert(
            "Error loading Troubleshooting Templates."
        );
    }
}


// ============================================================
// CLOSE TROUBLESHOOTING TEMPLATE MODAL
// ============================================================

function closeTroubleshootingTemplateModal() {

    document
        .getElementById(
            "troubleshootingTemplateModal"
        )
        .classList.add("hidden");

}


// ============================================================
// ADD TROUBLESHOOTING TEMPLATE
// ============================================================

async function addTroubleshootingTemplate(event) {

    event.preventDefault();


    const templateId =
        Number(
            document.getElementById(
                "troubleshootingTemplateSelect"
            ).value
        );


    if (!templateId) {

        return;
    }


    try {

        await addToolTroubleshootingTemplate(
            toolId,
            templateId
        );


        closeTroubleshootingTemplateModal();

        await loadTroubleshootingTemplates();

    } catch (error) {

        console.error(
            "Error adding Troubleshooting Template:",
            error
        );

        alert(
            "Error adding Troubleshooting Template."
        );
    }
}


// ============================================================
// REMOVE TROUBLESHOOTING TEMPLATE
// ============================================================

async function removeTroubleshootingTemplate(
    templateId
) {

    const confirmed =
        confirm(
            "Remove this Troubleshooting Template from the Tool?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await removeToolTroubleshootingTemplate(
            toolId,
            templateId
        );


        await loadTroubleshootingTemplates();

    } catch (error) {

        console.error(
            "Error removing Troubleshooting Template:",
            error
        );

        alert(
            "Error removing Troubleshooting Template."
        );
    }
}


// ============================================================
// QUEUES
// ============================================================

async function loadQueues() {

    const tableBody =
        document.getElementById(
            "queuesTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "queuesEmptyMessage"
        );

    const table =
        document.getElementById(
            "queuesTable"
        );


    try {

        const queues =
            await getToolQueues(toolId);


        tableBody.innerHTML = "";


        if (
            !queues ||
            queues.length === 0
        ) {

            emptyMessage.classList.remove("hidden");
            table.classList.add("hidden");

            return;
        }


        emptyMessage.classList.add("hidden");
        table.classList.remove("hidden");


        queues.forEach(queue => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        queue.name || "N/A"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        queue.description || ""
                    )}
                </td>

                <td>

                    <span
                        class="status-badge ${
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
                        class="action-button view-button">
                        View
                    </button>

                    <button
                        class="action-button delete-button">
                        Remove
                    </button>

                </td>
            `;


            row
                .querySelector(".view-button")
                .addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            `queue-detail.html?id=${queue.id}`;
                    }
                );


            row
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () =>
                        removeQueue(
                            queue.id
                        )
                );


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading Tool Queues:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Error loading Support Queues.";

        emptyMessage.classList.remove("hidden");

        table.classList.add("hidden");
    }
}


// ============================================================
// OPEN QUEUE MODAL
// ============================================================

async function openQueueModal() {

    const select =
        document.getElementById(
            "queueSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a Queue
        </option>
    `;


    try {

        const [
            allQueues,
            relatedQueues
        ] = await Promise.all([
            getQueues(),
            getToolQueues(toolId)
        ]);


        const relatedIds =
            new Set(
                relatedQueues.map(
                    item => Number(item.id)
                )
            );


        allQueues.forEach(queue => {

            if (
                !relatedIds.has(
                    Number(queue.id)
                )
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    queue.id;

                option.textContent =
                    queue.name;

                select.appendChild(option);
            }

        });


        document
            .getElementById("queueModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "Error loading Queues:",
            error
        );

        alert(
            "Error loading Support Queues."
        );
    }
}


// ============================================================
// CLOSE QUEUE MODAL
// ============================================================

function closeQueueModal() {

    document
        .getElementById("queueModal")
        .classList.add("hidden");

}


// ============================================================
// ADD QUEUE
// ============================================================

async function addQueue(event) {

    event.preventDefault();


    const queueId =
        Number(
            document.getElementById(
                "queueSelect"
            ).value
        );


    if (!queueId) {

        return;
    }


    try {

        await addToolQueue(
            toolId,
            queueId
        );


        closeQueueModal();

        await loadQueues();

    } catch (error) {

        console.error(
            "Error adding Queue:",
            error
        );

        alert(
            "Error adding Support Queue."
        );
    }
}


// ============================================================
// REMOVE QUEUE
// ============================================================

async function removeQueue(queueId) {

    const confirmed =
        confirm(
            "Remove this Support Queue from the Tool?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await removeToolQueue(
            toolId,
            queueId
        );


        await loadQueues();

    } catch (error) {

        console.error(
            "Error removing Queue:",
            error
        );

        alert(
            "Error removing Support Queue."
        );
    }
}


// ============================================================
// KNOWLEDGE BASE NOTES
// ============================================================

async function loadKnowledgeBaseNotes() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseNotesTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "knowledgeBaseNotesEmptyMessage"
        );

    const table =
        document.getElementById(
            "knowledgeBaseNotesTable"
        );


    try {

        const notes =
            await getToolKnowledgeBaseNotes(
                toolId
            );


        tableBody.innerHTML = "";


        if (
            !notes ||
            notes.length === 0
        ) {

            emptyMessage.classList.remove("hidden");
            table.classList.add("hidden");

            return;
        }


        emptyMessage.classList.add("hidden");
        table.classList.remove("hidden");


        notes.forEach(note => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        note.title || "N/A"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        note.category || ""
                    )}
                </td>

                <td>
                    ${
                        note.is_pinned
                            ? "Pinned"
                            : ""
                    }
                </td>

                <td>

                    <span
                        class="status-badge ${
                            note.is_active
                                ? "active"
                                : "inactive"
                        }">

                        ${
                            note.is_active
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </td>

                <td>

                    <button
                        class="action-button view-button">
                        View
                    </button>

                    <button
                        class="action-button delete-button">
                        Remove
                    </button>

                </td>
            `;


            row
                .querySelector(".view-button")
                .addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            `knowledge-base-note-detail.html?id=${note.id}`;
                    }
                );


            row
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () =>
                        removeKnowledgeBaseNote(
                            note.id
                        )
                );


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading Knowledge Base Notes:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.textContent =
            "Error loading Knowledge Base Notes.";

        emptyMessage.classList.remove("hidden");

        table.classList.add("hidden");
    }
}


// ============================================================
// OPEN KNOWLEDGE BASE NOTE MODAL
// ============================================================

async function openKnowledgeBaseNoteModal() {

    const select =
        document.getElementById(
            "knowledgeBaseNoteSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a Knowledge Note
        </option>
    `;


    try {

        const [
            allNotes,
            relatedNotes
        ] = await Promise.all([
            getKnowledgeBaseNotes(),
            getToolKnowledgeBaseNotes(toolId)
        ]);


        const relatedIds =
            new Set(
                relatedNotes.map(
                    item => Number(item.id)
                )
            );


        allNotes.forEach(note => {

            if (
                !relatedIds.has(
                    Number(note.id)
                )
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    note.id;

                option.textContent =
                    note.title ||
                    `Note ${note.id}`;

                select.appendChild(option);
            }

        });


        document
            .getElementById(
                "knowledgeBaseNoteModal"
            )
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "Error loading Knowledge Base Notes:",
            error
        );

        alert(
            "Error loading Knowledge Base Notes."
        );
    }
}


// ============================================================
// CLOSE KNOWLEDGE BASE NOTE MODAL
// ============================================================

function closeKnowledgeBaseNoteModal() {

    document
        .getElementById(
            "knowledgeBaseNoteModal"
        )
        .classList.add("hidden");

}


// ============================================================
// ADD KNOWLEDGE BASE NOTE
// ============================================================

async function addKnowledgeBaseNote(event) {

    event.preventDefault();


    const noteId =
        Number(
            document.getElementById(
                "knowledgeBaseNoteSelect"
            ).value
        );


    if (!noteId) {

        return;
    }


    try {

        await addToolKnowledgeBaseNote(
            toolId,
            noteId
        );


        closeKnowledgeBaseNoteModal();

        await loadKnowledgeBaseNotes();

    } catch (error) {

        console.error(
            "Error adding Knowledge Base Note:",
            error
        );

        alert(
            "Error adding Knowledge Base Note."
        );
    }
}


// ============================================================
// REMOVE KNOWLEDGE BASE NOTE
// ============================================================

async function removeKnowledgeBaseNote(
    noteId
) {

    const confirmed =
        confirm(
            "Remove this Knowledge Note from the Tool?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await removeToolKnowledgeBaseNote(
            toolId,
            noteId
        );


        await loadKnowledgeBaseNotes();

    } catch (error) {

        console.error(
            "Error removing Knowledge Base Note:",
            error
        );

        alert(
            "Error removing Knowledge Base Note."
        );
    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
