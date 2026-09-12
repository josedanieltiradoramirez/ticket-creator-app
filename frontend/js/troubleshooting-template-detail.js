const params =
    new URLSearchParams(window.location.search);

const templateId =
    params.get("id");


let currentTemplate = null;

let relatedIssueTypes = [];
let relatedTools = [];
let relatedKnowledgeBase = [];


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!templateId) {

            alert(
                "Troubleshooting Template ID not found."
            );

            window.location.href =
                "troubleshooting-templates.html";

            return;

        }


        setupEventListeners();

        await loadTemplate();

    }
);


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "troubleshooting-templates.html";

            }
        );


    document
        .getElementById("saveTemplateButton")
        .addEventListener(
            "click",
            saveTemplate
        );


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
        .getElementById("saveIssueTypeButton")
        .addEventListener(
            "click",
            addSelectedIssueType
        );


    // Tools

    document
        .getElementById("addToolButton")
        .addEventListener(
            "click",
            openToolModal
        );


    document
        .getElementById("closeToolModal")
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById("cancelToolButton")
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById("saveToolButton")
        .addEventListener(
            "click",
            addSelectedTool
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
        .getElementById("saveKnowledgeBaseButton")
        .addEventListener(
            "click",
            addSelectedKnowledgeBase
        );

}


// ============================================================
// LOAD TEMPLATE
// ============================================================

async function loadTemplate() {

    try {

        currentTemplate =
            await getTroubleshootingTemplate(
                templateId
            );


        renderTemplate();


        await Promise.all([
            loadIssueTypes(),
            loadTools(),
            loadKnowledgeBase()
        ]);


    } catch (error) {

        console.error(
            "Error loading troubleshooting template:",
            error
        );

        alert(
            "Error loading troubleshooting template."
        );

    }

}


// ============================================================
// RENDER BASIC INFORMATION
// ============================================================

function renderTemplate() {

    document.getElementById(
        "pageTitle"
    ).textContent =
        currentTemplate.name ||
        "Troubleshooting Template";


    document.getElementById(
        "templateName"
    ).value =
        currentTemplate.name || "";


    document.getElementById(
        "generatedDescription"
    ).value =
        currentTemplate.generated_description || "";


    document.getElementById(
        "templateSteps"
    ).value =
        currentTemplate.steps || "";


    document.getElementById(
        "templateActive"
    ).checked =
        currentTemplate.is_active;

}


// ============================================================
// SAVE TEMPLATE
// ============================================================

async function saveTemplate() {

    const data = {

        name:
            document
                .getElementById("templateName")
                .value
                .trim() || null,

        generated_description:
            document
                .getElementById("generatedDescription")
                .value,

        steps:
            document
                .getElementById("templateSteps")
                .value,

        is_active:
            document
                .getElementById("templateActive")
                .checked

    };


    try {

        await updateTroubleshootingTemplate(
            templateId,
            data
        );


        currentTemplate.name =
            data.name;

        currentTemplate.generated_description =
            data.generated_description;

        currentTemplate.steps =
            data.steps;

        currentTemplate.is_active =
            data.is_active;


        document.getElementById(
            "pageTitle"
        ).textContent =
            data.name ||
            "Troubleshooting Template";


        alert(
            "Troubleshooting template updated successfully."
        );


    } catch (error) {

        console.error(
            "Error updating troubleshooting template:",
            error
        );

        alert(
            "Error updating troubleshooting template."
        );

    }

}


// ============================================================
// GENERIC AUTH FETCH
// ============================================================

async function templateFetch(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                }
            }
        );


    if (!response.ok) {

        let errorMessage =
            "Request failed.";

        try {

            const errorData =
                await response.json();

            errorMessage =
                errorData.detail ||
                errorMessage;

        } catch (error) {
            // Ignore JSON parsing error
        }


        throw new Error(
            errorMessage
        );

    }


    return response.json();

}


// ============================================================
// ISSUE TYPES
// ============================================================

async function loadIssueTypes() {

    try {

        relatedIssueTypes =
            await templateFetch(
                `/api/troubleshooting_templates/${templateId}/issue-types`
            );


        renderIssueTypes();

    } catch (error) {

        console.error(
            "Error loading related Issue Types:",
            error
        );

    }

}


function renderIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );


    tableBody.innerHTML = "";


    if (relatedIssueTypes.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="4">
                No related Issue Types.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    relatedIssueTypes.forEach(issueType => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(issueType.name || "")}
            </td>

            <td>
                ${escapeHtml(issueType.description || "")}
            </td>

            <td>

                <span
                    class="status-badge ${
                        issueType.is_active
                            ? "active"
                            : "inactive"
                    }"
                >
                    ${
                        issueType.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>

            </td>

            <td>

                <button
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    class="action-button remove-button"
                >
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
            .querySelector(".remove-button")
            .addEventListener(
                "click",
                () => removeIssueType(issueType.id)
            );


        tableBody.appendChild(row);

    });

}


async function openIssueTypeModal() {

    try {

        const allIssueTypes =
            await getIssueTypes();


        const select =
            document.getElementById(
                "issueTypeSelect"
            );


        select.innerHTML = "";


        const relatedIds =
            new Set(
                relatedIssueTypes.map(
                    item => item.id
                )
            );


        const available =
            allIssueTypes.filter(
                issueType =>
                    !relatedIds.has(issueType.id)
            );


        if (available.length === 0) {

            alert(
                "There are no available Issue Types to add."
            );

            return;

        }


        available.forEach(issueType => {

            const option =
                document.createElement("option");

            option.value =
                issueType.id;

            option.textContent =
                issueType.name;

            select.appendChild(option);

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


function closeIssueTypeModal() {

    document
        .getElementById("issueTypeModal")
        .classList.add("hidden");

}


async function addSelectedIssueType() {

    const issueTypeId =
        document.getElementById(
            "issueTypeSelect"
        ).value;


    if (!issueTypeId) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/issue-types/${issueTypeId}`,
            {
                method: "POST"
            }
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


async function removeIssueType(issueTypeId) {

    const confirmed =
        confirm(
            "Remove this Issue Type from the troubleshooting template?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/issue-types/${issueTypeId}`,
            {
                method: "DELETE"
            }
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
// TOOLS
// ============================================================

async function loadTools() {

    try {

        relatedTools =
            await templateFetch(
                `/api/troubleshooting_templates/${templateId}/tools`
            );


        renderTools();

    } catch (error) {

        console.error(
            "Error loading related Tools:",
            error
        );

    }

}


function renderTools() {

    const tableBody =
        document.getElementById(
            "toolsTableBody"
        );


    tableBody.innerHTML = "";


    if (relatedTools.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="4">
                No related Tools.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    relatedTools.forEach(tool => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(tool.name || "")}
            </td>

            <td>
                ${escapeHtml(tool.description || "")}
            </td>

            <td>

                <span
                    class="status-badge ${
                        tool.is_active
                            ? "active"
                            : "inactive"
                    }"
                >
                    ${
                        tool.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>

            </td>

            <td>

                <button
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    class="action-button remove-button"
                >
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
                        `tool-detail.html?id=${tool.id}`;

                }
            );


        row
            .querySelector(".remove-button")
            .addEventListener(
                "click",
                () => removeTool(tool.id)
            );


        tableBody.appendChild(row);

    });

}


async function openToolModal() {

    try {

        const allTools =
            await getTools();


        const select =
            document.getElementById(
                "toolSelect"
            );


        select.innerHTML = "";


        const relatedIds =
            new Set(
                relatedTools.map(
                    item => item.id
                )
            );


        const available =
            allTools.filter(
                tool =>
                    !relatedIds.has(tool.id)
            );


        if (available.length === 0) {

            alert(
                "There are no available Tools to add."
            );

            return;

        }


        available.forEach(tool => {

            const option =
                document.createElement("option");

            option.value =
                tool.id;

            option.textContent =
                tool.name;

            select.appendChild(option);

        });


        document
            .getElementById("toolModal")
            .classList.remove("hidden");


    } catch (error) {

        console.error(
            "Error loading Tools:",
            error
        );

        alert(
            "Error loading Tools."
        );

    }

}


function closeToolModal() {

    document
        .getElementById("toolModal")
        .classList.add("hidden");

}


async function addSelectedTool() {

    const toolId =
        document.getElementById(
            "toolSelect"
        ).value;


    if (!toolId) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/tools/${toolId}`,
            {
                method: "POST"
            }
        );


        closeToolModal();

        await loadTools();


    } catch (error) {

        console.error(
            "Error adding Tool:",
            error
        );

        alert(
            "Error adding Tool."
        );

    }

}


async function removeTool(toolId) {

    const confirmed =
        confirm(
            "Remove this Tool from the troubleshooting template?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/tools/${toolId}`,
            {
                method: "DELETE"
            }
        );


        await loadTools();


    } catch (error) {

        console.error(
            "Error removing Tool:",
            error
        );

        alert(
            "Error removing Tool."
        );

    }

}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

async function loadKnowledgeBase() {

    try {

        relatedKnowledgeBase =
            await templateFetch(
                `/api/troubleshooting_templates/${templateId}/knowledge-base`
            );


        renderKnowledgeBase();

    } catch (error) {

        console.error(
            "Error loading related Knowledge Base:",
            error
        );

    }

}


function renderKnowledgeBase() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseTableBody"
        );


    tableBody.innerHTML = "";


    if (relatedKnowledgeBase.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="4">
                No related Knowledge Base items.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    relatedKnowledgeBase.forEach(kb => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    kb.title ||
                    kb.name ||
                    ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    kb.description ||
                    kb.content ||
                    ""
                )}
            </td>

            <td>

                <span
                    class="status-badge ${
                        kb.is_active
                            ? "active"
                            : "inactive"
                    }"
                >
                    ${
                        kb.is_active
                            ? "Active"
                            : "Inactive"
                    }
                </span>

            </td>

            <td>

                <button
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    class="action-button remove-button"
                >
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
            .querySelector(".remove-button")
            .addEventListener(
                "click",
                () => removeKnowledgeBase(kb.id)
            );


        tableBody.appendChild(row);

    });

}


async function openKnowledgeBaseModal() {

    try {

        const allKnowledgeBase =
            await getKnowledgeBaseItems();


        const select =
            document.getElementById(
                "knowledgeBaseSelect"
            );


        select.innerHTML = "";


        const relatedIds =
            new Set(
                relatedKnowledgeBase.map(
                    item => item.id
                )
            );


        const available =
            allKnowledgeBase.filter(
                kb =>
                    !relatedIds.has(kb.id)
            );


        if (available.length === 0) {

            alert(
                "There are no available Knowledge Base items to add."
            );

            return;

        }


        available.forEach(kb => {

            const option =
                document.createElement("option");

            option.value =
                kb.id;

            option.textContent =
                kb.title ||
                kb.name ||
                `KB #${kb.id}`;

            select.appendChild(option);

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


function closeKnowledgeBaseModal() {

    document
        .getElementById("knowledgeBaseModal")
        .classList.add("hidden");

}


async function addSelectedKnowledgeBase() {

    const knowledgeBaseId =
        document.getElementById(
            "knowledgeBaseSelect"
        ).value;


    if (!knowledgeBaseId) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/knowledge-base/${knowledgeBaseId}`,
            {
                method: "POST"
            }
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


async function removeKnowledgeBase(
    knowledgeBaseId
) {

    const confirmed =
        confirm(
            "Remove this Knowledge Base item from the troubleshooting template?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await templateFetch(
            `/api/troubleshooting_templates/${templateId}/knowledge-base/${knowledgeBaseId}`,
            {
                method: "DELETE"
            }
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
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}