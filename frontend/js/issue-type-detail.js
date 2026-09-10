let issueTypeId = null;

let currentIssueType = null;


// ============================================================
// DOM CONTENT LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        issueTypeId =
            Number(
                params.get("id")
            );


        if (!issueTypeId) {

            alert(
                "Invalid Issue Type ID."
            );

            window.location.href =
                "issue-types.html";

            return;

        }


        setupNavigation();

        setupEventListeners();


        await loadIssueTypeDetail();

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

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "issue-types.html";

            }
        );


    document
        .getElementById("addToolButton")
        .addEventListener(
            "click",
            openToolModal
        );


    document
        .getElementById("closeToolModalButton")
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
            "closeTroubleshootingTemplateModalButton"
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


    document
        .getElementById(
            "addKnowledgeBaseButton"
        )
        .addEventListener(
            "click",
            openKnowledgeBaseModal
        );


    document
        .getElementById(
            "closeKnowledgeBaseModalButton"
        )
        .addEventListener(
            "click",
            closeKnowledgeBaseModal
        );


    document
        .getElementById(
            "cancelKnowledgeBaseButton"
        )
        .addEventListener(
            "click",
            closeKnowledgeBaseModal
        );


    document
        .getElementById(
            "saveKnowledgeBaseButton"
        )
        .addEventListener(
            "click",
            addSelectedKnowledgeBase
        );


    document
        .getElementById(
            "changeFormButton"
        )
        .addEventListener(
            "click",
            openChangeFormModal
        );


    document
        .getElementById(
            "closeChangeFormModalButton"
        )
        .addEventListener(
            "click",
            closeChangeFormModal
        );


    document
        .getElementById(
            "cancelChangeFormButton"
        )
        .addEventListener(
            "click",
            closeChangeFormModal
        );


    document
        .getElementById(
            "saveChangeFormButton"
        )
        .addEventListener(
            "click",
            saveChangedForm
        );

}


// ============================================================
// LOAD ISSUE TYPE
// ============================================================

async function loadIssueTypeDetail() {

    try {

        currentIssueType =
            await getIssueType(
                issueTypeId
            );


        renderBasicInformation(
            currentIssueType
        );


        await Promise.all([
            loadForm(),
            loadTools(),
            loadTroubleshootingTemplates(),
            loadKnowledgeBase()
        ]);

    } catch (error) {

        console.error(
            "Error loading issue type detail:",
            error
        );

        alert(
            "Error loading issue type details."
        );

    }

}


// ============================================================
// BASIC INFORMATION
// ============================================================

function renderBasicInformation(
    issueType
) {

    document.getElementById(
        "issueTypeName"
    ).textContent =
        issueType.name;


    document.getElementById(
        "issueTypeDescription"
    ).textContent =
        issueType.description;


    document.getElementById(
        "issueTypeId"
    ).textContent =
        issueType.id;


    document.getElementById(
        "issueTypeNameValue"
    ).textContent =
        issueType.name;


    document.getElementById(
        "issueTypeDescriptionValue"
    ).textContent =
        issueType.description;


    document.getElementById(
        "issueTypeCategory"
    ).textContent =
        issueType.category;


    document.getElementById(
        "issueTypeDisplayName"
    ).textContent =
        issueType.display_name || "-";


    document.getElementById(
        "issueTypeSearchKeywords"
    ).textContent =
        issueType.search_keywords || "-";


    document.getElementById(
        "issueTypeStatus"
    ).innerHTML =
        createStatusBadge(
            issueType.is_active
        );

}


// ============================================================
// FORM
// ============================================================

async function loadForm() {
    try {
        const forms = await getIssueTypeForm(issueTypeId);

        console.log("FORMS:", forms);

        const formEmptyMessage = document.getElementById("formEmptyMessage");
        const formInfo = document.getElementById("formInfo");

        // No form assigned
        if (!forms || forms.length === 0) {
            formEmptyMessage.classList.remove("hidden");
            formInfo.classList.add("hidden");
            return;
        }

        // The endpoint returns an array, but an Issue Type has one form
        const form = forms[0];

        formEmptyMessage.classList.add("hidden");
        formInfo.classList.remove("hidden");

        document.getElementById("formName").textContent =
            form.name || "N/A";

        document.getElementById("formDescription").textContent =
            form.description || "N/A";

    } catch (error) {
        console.error("Error loading form:", error);

        document.getElementById("formEmptyMessage").classList.remove("hidden");
        document.getElementById("formInfo").classList.add("hidden");
    }
}


// ============================================================
// CHANGE FORM MODAL
// ============================================================

async function openChangeFormModal() {

    const select =
        document.getElementById(
            "changeFormSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a form
        </option>
    `;


    try {

        const forms =
            await getForms();


        forms.forEach(form => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                form.id;


            option.textContent =
                form.name;


            select.appendChild(
                option
            );

        });


        if (
            currentIssueType &&
            currentIssueType.form_template_id
        ) {

            select.value =
                currentIssueType.form_template_id;

        }


        document
            .getElementById(
                "changeFormModal"
            )
            .classList.remove(
                "hidden"
            );

    } catch (error) {

        console.error(
            "Error loading forms:",
            error
        );

        alert(
            "Error loading forms."
        );

    }

}


// ============================================================
// SAVE CHANGED FORM
// ============================================================

async function saveChangedForm() {

    const select =
        document.getElementById(
            "changeFormSelect"
        );


    const formId =
        select.value
            ? Number(select.value)
            : null;


    if (!formId) {

        alert(
            "Please select a form."
        );

        return;

    }


    try {

        const data = {

            name:
                currentIssueType.name,

            description:
                currentIssueType.description,

            category:
                currentIssueType.category,

            display_name:
                currentIssueType.display_name,

            search_keywords:
                currentIssueType.search_keywords,

            form_template_id:
                formId,

            is_active:
                currentIssueType.is_active

        };


        await updateIssueType(
            issueTypeId,
            data
        );


        alert(
            "Form updated successfully."
        );


        closeChangeFormModal();


        await loadIssueTypeDetail();

    } catch (error) {

        console.error(
            "Error changing form:",
            error
        );

        alert(
            "Error changing form."
        );

    }

}


// ============================================================
// CLOSE CHANGE FORM
// ============================================================

function closeChangeFormModal() {

    document
        .getElementById(
            "changeFormModal"
        )
        .classList.add(
            "hidden"
        );

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
            await getIssueTypeTools(
                issueTypeId
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


        tools.forEach(tool => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(tool.name)}
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


            tableBody.appendChild(row);

        });

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
            Select a tool
        </option>
    `;


    try {

        const [
            tools,
            assignedTools
        ] =
            await Promise.all([
                getTools(),
                getIssueTypeTools(
                    issueTypeId
                )
            ]);


        const assignedIds =
            assignedTools.map(
                tool => tool.id
            );


        tools.forEach(tool => {

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

        });


        document
            .getElementById(
                "toolModal"
            )
            .classList.remove(
                "hidden"
            );

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );

        alert(
            "Error loading tools."
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
            "Please select a tool."
        );

        return;

    }


    try {

        await addIssueTypeTool(
            issueTypeId,
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
            "Error adding tool."
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
            "Remove this tool from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeTool(
            issueTypeId,
            toolId
        );


        await loadTools();

    } catch (error) {

        console.error(
            "Error removing tool:",
            error
        );

        alert(
            "Error removing tool."
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


    try {

        const templates =
            await getIssueTypeTroubleshootingTemplates(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !templates ||
            templates.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        templates.forEach(template => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        template.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        template.generated_description || "-"
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        template.is_active
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeTroubleshootingTemplate(${template.id})"
                    >
                        Remove
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading troubleshooting templates:",
            error
        );

        emptyMessage.style.display =
            "block";

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
            Select a template
        </option>
    `;


    try {

        const [
            templates,
            assignedTemplates
        ] =
            await Promise.all([
                getTroubleshootingTemplates(),
                getIssueTypeTroubleshootingTemplates(
                    issueTypeId
                )
            ]);


        const assignedIds =
            assignedTemplates.map(
                template => template.id
            );


        templates.forEach(template => {

            if (
                assignedIds.includes(
                    template.id
                )
            ) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                template.id;


            option.textContent =
                template.name ||
                `Template ${template.id}`;


            select.appendChild(
                option
            );

        });


        document
            .getElementById(
                "troubleshootingTemplateModal"
            )
            .classList.remove(
                "hidden"
            );

    } catch (error) {

        console.error(
            "Error loading troubleshooting templates:",
            error
        );

        alert(
            "Error loading troubleshooting templates."
        );

    }

}


// ============================================================
// ADD TROUBLESHOOTING TEMPLATE
// ============================================================

async function addSelectedTroubleshootingTemplate() {

    const select =
        document.getElementById(
            "troubleshootingTemplateSelect"
        );


    const templateId =
        select.value
            ? Number(select.value)
            : null;


    if (!templateId) {

        alert(
            "Please select a troubleshooting template."
        );

        return;

    }


    try {

        await addIssueTypeTroubleshootingTemplate(
            issueTypeId,
            templateId
        );


        closeTroubleshootingTemplateModal();


        await loadTroubleshootingTemplates();

    } catch (error) {

        console.error(
            "Error adding troubleshooting template:",
            error
        );

        alert(
            "Error adding troubleshooting template."
        );

    }

}


// ============================================================
// REMOVE TROUBLESHOOTING TEMPLATE
// ============================================================

async function removeTroubleshootingTemplate(
    templateId
) {

    if (
        !confirm(
            "Remove this troubleshooting template from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeTroubleshootingTemplate(
            issueTypeId,
            templateId
        );


        await loadTroubleshootingTemplates();

    } catch (error) {

        console.error(
            "Error removing troubleshooting template:",
            error
        );

        alert(
            "Error removing troubleshooting template."
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
        .classList.add(
            "hidden"
        );

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


    try {

        const knowledgeBase =
            await getIssueTypeKnowledgeBase(
                issueTypeId
            );


        tableBody.innerHTML =
            "";


        if (
            !knowledgeBase ||
            knowledgeBase.length === 0
        ) {

            emptyMessage.style.display =
                "block";

            return;

        }


        emptyMessage.style.display =
            "none";


        knowledgeBase.forEach(kb => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        kb.article_number || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        kb.title || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        kb.description || "-"
                    )}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="removeKnowledgeBase(${kb.id})"
                    >
                        Remove
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading knowledge base:",
            error
        );

        emptyMessage.style.display =
            "block";

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
            Select an article
        </option>
    `;


    try {

        const [
            knowledgeBase,
            assignedKnowledgeBase
        ] =
            await Promise.all([
                getKnowledgeBaseItems(),
                getIssueTypeKnowledgeBase(
                    issueTypeId
                )
            ]);


        const assignedIds =
            assignedKnowledgeBase.map(
                kb => kb.id
            );


        knowledgeBase.forEach(kb => {

            if (
                assignedIds.includes(
                    kb.id
                )
            ) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                kb.id;


            option.textContent =
                `${kb.article_number} - ${kb.title}`;


            select.appendChild(
                option
            );

        });


        document
            .getElementById(
                "knowledgeBaseModal"
            )
            .classList.remove(
                "hidden"
            );

    } catch (error) {

        console.error(
            "Error loading knowledge base:",
            error
        );

        alert(
            "Error loading knowledge base."
        );

    }

}


// ============================================================
// ADD KNOWLEDGE BASE
// ============================================================

async function addSelectedKnowledgeBase() {

    const select =
        document.getElementById(
            "knowledgeBaseSelect"
        );


    const knowledgeBaseId =
        select.value
            ? Number(select.value)
            : null;


    if (!knowledgeBaseId) {

        alert(
            "Please select a Knowledge Base article."
        );

        return;

    }


    try {

        await addIssueTypeKnowledgeBase(
            issueTypeId,
            knowledgeBaseId
        );


        closeKnowledgeBaseModal();


        await loadKnowledgeBase();

    } catch (error) {

        console.error(
            "Error adding knowledge base:",
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

    if (
        !confirm(
            "Remove this Knowledge Base article from the issue type?"
        )
    ) {
        return;
    }


    try {

        await removeIssueTypeKnowledgeBase(
            issueTypeId,
            knowledgeBaseId
        );


        await loadKnowledgeBase();

    } catch (error) {

        console.error(
            "Error removing knowledge base:",
            error
        );

        alert(
            "Error removing Knowledge Base."
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
        .classList.add(
            "hidden"
        );

}


// ============================================================
// CLOSE TOOL MODAL
// ============================================================

function closeToolModal() {

    document
        .getElementById(
            "toolModal"
        )
        .classList.add(
            "hidden"
        );

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