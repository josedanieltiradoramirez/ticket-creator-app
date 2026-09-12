const params =
    new URLSearchParams(window.location.search);

const knowledgeBaseId =
    params.get("id");


let currentKnowledgeBase = null;

let relatedIssueTypes = [];
let relatedTools = [];
let relatedTroubleshootingTemplates = [];


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!knowledgeBaseId) {

            alert(
                "Knowledge Base ID not found."
            );

            window.location.href =
                "knowledge-base.html";

            return;

        }


        setupEventListeners();

        await loadKnowledgeBase();

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
                    "knowledge-base.html";

            }
        );


    document
        .getElementById("saveKnowledgeBaseButton")
        .addEventListener(
            "click",
            saveKnowledgeBase
        );


    document
        .getElementById("openArticleButton")
        .addEventListener(
            "click",
            openArticle
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
            "saveTroubleshootingTemplateButton"
        )
        .addEventListener(
            "click",
            addSelectedTroubleshootingTemplate
        );

}


// ============================================================
// LOAD
// ============================================================

async function loadKnowledgeBase() {

    try {

        currentKnowledgeBase =
            await getKnowledgeBaseItem(
                knowledgeBaseId
            );


        renderKnowledgeBase();


        await Promise.all([
            loadIssueTypes(),
            loadTools(),
            loadTroubleshootingTemplates()
        ]);


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
// RENDER BASIC INFORMATION
// ============================================================

function renderKnowledgeBase() {

    document.getElementById(
        "pageTitle"
    ).textContent =
        currentKnowledgeBase.title ||
        "Knowledge Base";


    document.getElementById(
        "articleNumber"
    ).value =
        currentKnowledgeBase.article_number || "";


    document.getElementById(
        "title"
    ).value =
        currentKnowledgeBase.title || "";


    document.getElementById(
        "url"
    ).value =
        currentKnowledgeBase.url || "";


    document.getElementById(
        "description"
    ).value =
        currentKnowledgeBase.description || "";

}


// ============================================================
// SAVE
// ============================================================

async function saveKnowledgeBase() {

    const data = {

        article_number:
            document
                .getElementById("articleNumber")
                .value
                .trim(),

        title:
            document
                .getElementById("title")
                .value
                .trim(),

        url:
            document
                .getElementById("url")
                .value
                .trim(),

        description:
            document
                .getElementById("description")
                .value
                .trim()

    };


    try {

        await updateKnowledgeBaseItem(
            knowledgeBaseId,
            data
        );


        currentKnowledgeBase.article_number =
            data.article_number;

        currentKnowledgeBase.title =
            data.title;

        currentKnowledgeBase.url =
            data.url;

        currentKnowledgeBase.description =
            data.description;


        document.getElementById(
            "pageTitle"
        ).textContent =
            data.title ||
            "Knowledge Base";


        alert(
            "Knowledge base article updated successfully."
        );


    } catch (error) {

        console.error(
            "Error updating Knowledge Base:",
            error
        );

        alert(
            "Error updating Knowledge Base."
        );

    }

}


// ============================================================
// OPEN ARTICLE
// ============================================================

function openArticle() {

    const url =
        document
            .getElementById("url")
            .value
            .trim();


    if (!url) {

        alert(
            "This Knowledge Base article does not have a URL."
        );

        return;

    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


// ============================================================
// GENERIC FETCH
// ============================================================

async function knowledgeBaseFetch(
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
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/issue-types`
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
                ${escapeHtml(
                    issueType.name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    issueType.description || ""
                )}
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

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/issue-types/${issueTypeId}`,
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


async function removeIssueType(
    issueTypeId
) {

    const confirmed =
        confirm(
            "Remove this Issue Type from the Knowledge Base article?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/issue-types/${issueTypeId}`,
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
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/tools`
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
                ${escapeHtml(
                    tool.name || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    tool.description || ""
                )}
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

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/tools/${toolId}`,
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
            "Remove this Tool from the Knowledge Base article?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/tools/${toolId}`,
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
// TROUBLESHOOTING TEMPLATES
// ============================================================

async function loadTroubleshootingTemplates() {

    try {

        relatedTroubleshootingTemplates =
            await knowledgeBaseFetch(
                `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates`
            );


        renderTroubleshootingTemplates();

    } catch (error) {

        console.error(
            "Error loading related Troubleshooting Templates:",
            error
        );

    }

}


function renderTroubleshootingTemplates() {

    const tableBody =
        document.getElementById(
            "troubleshootingTemplatesTableBody"
        );


    tableBody.innerHTML = "";


    if (
        relatedTroubleshootingTemplates.length === 0
    ) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="4">
                No related Troubleshooting Templates.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    relatedTroubleshootingTemplates.forEach(template => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    template.name || ""
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
                    }"
                >
                    ${
                        template.is_active
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
                        `troubleshooting-template-detail.html?id=${template.id}`;

                }
            );


        row
            .querySelector(".remove-button")
            .addEventListener(
                "click",
                () =>
                    removeTroubleshootingTemplate(
                        template.id
                    )
            );


        tableBody.appendChild(row);

    });

}


async function openTroubleshootingTemplateModal() {

    try {

        const allTemplates =
            await getTroubleshootingTemplates();


        const select =
            document.getElementById(
                "troubleshootingTemplateSelect"
            );


        select.innerHTML = "";


        const relatedIds =
            new Set(
                relatedTroubleshootingTemplates.map(
                    item => item.id
                )
            );


        const available =
            allTemplates.filter(
                template =>
                    !relatedIds.has(template.id)
            );


        if (available.length === 0) {

            alert(
                "There are no available Troubleshooting Templates to add."
            );

            return;

        }


        available.forEach(template => {

            const option =
                document.createElement("option");

            option.value =
                template.id;

            option.textContent =
                template.name ||
                `Template #${template.id}`;

            select.appendChild(option);

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


function closeTroubleshootingTemplateModal() {

    document
        .getElementById(
            "troubleshootingTemplateModal"
        )
        .classList.add("hidden");

}


async function addSelectedTroubleshootingTemplate() {

    const templateId =
        document.getElementById(
            "troubleshootingTemplateSelect"
        ).value;


    if (!templateId) {
        return;
    }


    try {

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates/${templateId}`,
            {
                method: "POST"
            }
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


async function removeTroubleshootingTemplate(
    templateId
) {

    const confirmed =
        confirm(
            "Remove this Troubleshooting Template from the Knowledge Base article?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await knowledgeBaseFetch(
            `/api/knowledge_base/${knowledgeBaseId}/troubleshooting-templates/${templateId}`,
            {
                method: "DELETE"
            }
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

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}