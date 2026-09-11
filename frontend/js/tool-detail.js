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

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "tools.html";

        });


    document
        .getElementById("ticketsButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("toolsButton")
        .addEventListener("click", () => {

            window.location.href = "tools.html";

        });


    document
        .getElementById("locationsButton")
        .addEventListener("click", () => {

            window.location.href = "locations.html";

        });


    document
        .getElementById("queuesButton")
        .addEventListener("click", () => {

            window.location.href = "queues.html";

        });


    document
        .getElementById("wmsButton")
        .addEventListener("click", () => {

            window.location.href =
                "warehouse-management-systems.html";

        });


    document
        .getElementById("formsButton")
        .addEventListener("click", () => {

            window.location.href = "forms.html";

        });


    document
        .getElementById("troubleshootingTemplatesButton")
        .addEventListener("click", () => {

            window.location.href =
                "troubleshooting-templates.html";

        });


    document
        .getElementById("knowledgeBaseButton")
        .addEventListener("click", () => {

            window.location.href =
                "knowledge-base.html";

        });

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // Issue Types

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


    // Knowledge Base

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


    // Troubleshooting Templates

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
            loadTroubleshootingTemplates()
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


    document.getElementById("toolNameValue").textContent =
        tool.name || "N/A";


    document.getElementById("toolDescriptionValue").textContent =
        tool.description || "N/A";


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
                        class="action-button delete-button">
                        Remove
                    </button>

                </td>
            `;


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
                        class="action-button delete-button">

                        Remove

                    </button>

                </td>
            `;


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
                        class="action-button delete-button">

                        Remove

                    </button>

                </td>
            `;


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