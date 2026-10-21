// ============================================================

// GLOBAL VARIABLES

// ============================================================



const params = new URLSearchParams(window.location.search);



let ticketId = params.get("id");

let isNewTicket = params.get("new") === "true";

let autosaveTimer = null
let autosaveDirty = false;
let autosaveInProgress = false;

// ID of a Troubleshooting Template created directly from Ticket Detail.
let newlyCreatedTroubleshootingTemplateId = null;


let troubleshootingTemplates = [];

let forms = [];

let usedKnowledgeBase = [];





// ============================================================

// DOM READY

// ============================================================



document.addEventListener(

    "DOMContentLoaded",

    () => {



        initializeTicketPage();



    }

);





// ============================================================

// INITIALIZE PAGE

// ============================================================



async function initializeTicketPage() {



    setupEventListeners();



    if (isNewTicket) {

        await initializeNewTicket();

    } else {

        await loadTicket();

    }

}



async function initializeNewTicket() {



    await loadPriorities(null);

    const prioritySelect =

        document.getElementById("priority");



    const mediumOption =

        Array.from(prioritySelect.options)

            .find(

                option =>

                    option.textContent.trim().toLowerCase() ===

                    "medium"

            );



    if (mediumOption) {

        prioritySelect.value =

            mediumOption.value;

    }

    await loadStatuses(null);

    await loadQueues(null, null);

    await loadLocations(null);

    await loadUserTypes(null);

    await loadTools(null);



    // Load all Issue Types

    await loadIssueTypes(null);

    await loadRelatedKnowledgeBaseNotes(null, null);



    // Load all Forms and Troubleshooting Templates

    await loadForms();

    await loadTroubleshootingTemplates();





    updateTitleSuggestion();

}





// ============================================================

// TICKET DETAIL NOTIFICATIONS

// ============================================================

function showDetailNotification(message, type = "info", duration = 3000) {

    let container = document.getElementById("notificationContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "notificationContainer";
        document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${escapeNotificationHtml(message)}</span>
        <button type="button" class="notification-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add("notification-visible"));

    const closeButton = notification.querySelector(".notification-close");
    if (closeButton) {
        closeButton.addEventListener("click", () => removeDetailNotification(notification));
    }

    if (duration > 0) {
        setTimeout(() => removeDetailNotification(notification), duration);
    }
}

function showSuccessMessage(message) { showDetailNotification(message, "success", 3000); }
function showErrorMessage(message) { showDetailNotification(message, "error", 4000); }
function showWarningMessage(message) { showDetailNotification(message, "warning", 3500); }
function showInfoMessage(message) { showDetailNotification(message, "info", 3000); }

function removeDetailNotification(notification) {
    if (!notification) return;
    notification.classList.remove("notification-visible");
    setTimeout(() => notification.remove(), 180);
}

function getNotificationIcon(type) {
    switch (type) {
        case "success": return "✓";
        case "error": return "!";
        case "warning": return "⚠";
        default: return "i";
    }
}

function escapeNotificationHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// LOAD TICKET

// ============================================================



async function loadTicket() {



    try {



        const ticket =

            await getTicket(ticketId);





        // ====================================================

        // LOAD USED KNOWLEDGE BASE

        // ====================================================



        await loadUsedKnowledgeBase();





        // ====================================================

        // BASIC SELECTS

        // ====================================================



        await loadPriorities(

            ticket.priority_id

        );



        await loadStatuses(

            ticket.status_id

        );



        await loadLocations(

            ticket.location_id

        );

        await loadUserTypes(
            ticket.user_type_id ??
            ticket.user_type?.id
        );





        // ====================================================

        // TOOL

        // ====================================================



        await loadTools(

            ticket.tool_id

        );



        await loadToolKnowledgeBase(

            ticket.tool_id

        );





        // ====================================================

        // ISSUE TYPE

        // ====================================================



        await loadIssueTypes(

            ticket.issue_type_id

        );



        await loadQueues(

            ticket.queue_id,

            ticket.issue_type_id

        );



        await loadIssueTypeKnowledgeBase(

            ticket.issue_type_id

        );



        await loadRelatedKnowledgeBaseNotes(

            ticket.issue_type_id,

            ticket.tool_id

        );





        // ====================================================

        // TROUBLESHOOTING TEMPLATES

        // ====================================================



        await loadTroubleshootingTemplates(

            ticket.issue_type_id,

            ticket.troubleshooting_template_id

        );





        // ====================================================

        // FORMS

        // ====================================================



        await loadForms(

            ticket.issue_type_id,

            ticket.form_template_id

        );





        // ====================================================

        // TICKET INFORMATION

        // ====================================================



        document.getElementById(

            "ticketNumber"

        ).value =

            ticket.ticket_number ?? "";





        document.getElementById(

            "ticketTitle"

        ).value =

            ticket.title ?? "";





        // ====================================================

        // USER

        // ====================================================



        document.getElementById(

            "userName"

        ).value =

            ticket.user_name ?? "";





        document.getElementById(

            "userEmail"

        ).value =

            ticket.user_email ?? "";





        document.getElementById(

            "userPhone"

        ).value =

            ticket.user_best_contact_number ?? "";





        const userTypeSelect =
            document.getElementById("userType");

        if (userTypeSelect) {
            userTypeSelect.value =
                String(
                    ticket.user_type_id ??
                    ticket.user_type?.id ??
                    ""
                );

            userTypeSelect.dispatchEvent(
                new Event(
                    "change",
                    { bubbles: true }
                )
            );
        }





        // ====================================================

        // ISSUE

        // ====================================================



        document.getElementById(

            "issueDescription"

        ).value =

            ticket.issue_description ?? "";



        document.getElementById(

            "shortIssue"

        ).value =

            ticket.short_issue ?? "";



        // ====================================================

        // FORM

        // ====================================================



        document.getElementById(

            "formContent"

        ).value =

            ticket.form_content ?? "";



        // ====================================================

        // TROUBLESHOOTING

        // ====================================================



        document.getElementById(

            "troubleshootingSteps"

        ).value =

            ticket.troubleshooting_steps ?? "";





        // ====================================================

        // ADDITIONAL NOTES

        // ====================================================



        document.getElementById(

            "additionalNotes"

        ).value =

            ticket.additional_notes ?? "";



        // ====================================================

        // GENERATED TICKET

        // ====================================================



        document.getElementById(

            "isRouted"

        ).checked =

            ticket.is_routed ?? false;



        // ====================================================

        // GENERATED TICKET

        // ====================================================



        const generatedTicket =

            ticket.generated_ticket;



        document.getElementById("ticketPreview").textContent =

            generatedTicket &&

            generatedTicket !== "string"

                ? generatedTicket

                : "-";





        // ====================================================

        // GENERATED TIME ENTRY

        // ====================================================



        const generatedTimeEntry =

            ticket.generated_time_entry;



        document.getElementById("timeEntryPreview").textContent =

            generatedTimeEntry &&

            generatedTimeEntry !== "string"

                ? generatedTimeEntry

                : "-";



        updateTitleSuggestion();





        // ====================================================

        // DATES

        // ====================================================



        document.getElementById(

            "createdAt"

        ).textContent =

            ticket.created_at

                ? new Date(

                    ticket.created_at

                ).toLocaleString()

                : "";





        document.getElementById(

            "updatedAt"

        ).textContent =

            ticket.updated_at

                ? new Date(

                    ticket.updated_at

                ).toLocaleString()

                : "";





        document.getElementById(

            "closedAt"

        ).textContent =

            ticket.closed_at

                ? new Date(

                    ticket.closed_at

                ).toLocaleString()

                : "Not closed";





        await loadQuickNotes();

    } catch (error) {



        console.error(

            "Error loading ticket:",

            error

        );



        showErrorMessage("Error loading ticket.");

    }

}





// ============================================================

// PRIORITIES

// ============================================================



async function loadPriorities(

    currentPriorityId

) {



    const priorities =

        await getPriorities();





    const prioritySelect =

        document.getElementById(

            "priority"

        );





    prioritySelect.innerHTML = "";





    priorities.forEach(

        priority => {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                priority.id;



            option.textContent =

                priority.name;





            if (

                priority.id ===

                currentPriorityId

            ) {



                option.selected = true;

            }





            prioritySelect.appendChild(

                option

            );

        }

    );

}





// ============================================================

// STATUSES

// ============================================================



async function loadStatuses(

    currentStatusId

) {



    const statuses =

        await getTicketStatuses();





    const statusSelect =

        document.getElementById(

            "status"

        );





    statusSelect.innerHTML = "";





    statuses.forEach(

        status => {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                status.id;



            option.textContent =

                status.name;





            if (

                status.id ===

                currentStatusId

            ) {



                option.selected = true;

            }





            statusSelect.appendChild(

                option

            );

        }

    );

}





// ============================================================

// QUEUES

// ============================================================



async function loadQueues(
    currentQueueId,
    issueTypeId = null
) {
    let queues = [];

    try {
        if (issueTypeId) {
            queues = await getIssueTypeQueues(issueTypeId);
        }

        if (!queues || queues.length === 0) {
            const allQueues = await getQueues();
            const serviceDeskQueue = allQueues.find(
                queue =>
                    String(queue.name ?? "").trim().toLowerCase() ===
                    "service desk"
            );
            queues = serviceDeskQueue ? [serviceDeskQueue] : [];
        }
    } catch (error) {
        console.error("Error loading queues:", error);
        try {
            const allQueues = await getQueues();
            const serviceDeskQueue = allQueues.find(
                queue =>
                    String(queue.name ?? "").trim().toLowerCase() ===
                    "service desk"
            );
            queues = serviceDeskQueue ? [serviceDeskQueue] : [];
        } catch (fallbackError) {
            console.error("Error loading Service Desk queue:", fallbackError);
            queues = [];
        }
    }

    const queueSelect = document.getElementById("queue");
    if (!queueSelect) return;

    queueSelect.innerHTML = "";

    if (queues.length === 0) {
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "Select a Queue";
        queueSelect.appendChild(emptyOption);
        return;
    }

    queues.forEach(queue => {
        const option = document.createElement("option");
        option.value = queue.id;
        option.textContent = queue.name;
        if (currentQueueId !== null && currentQueueId !== undefined && String(queue.id) === String(currentQueueId)) {
            option.selected = true;
        }
        queueSelect.appendChild(option);
    });

    if (!queueSelect.value) {
        queueSelect.value = String(queues[0].id);
    }
}

// ============================================================

// TOOLS

// ============================================================



async function loadTools(

    currentToolId

) {

    const tools =

        await getTools();



    const toolSelect =

        document.getElementById(

            "tool"

        );



    toolSelect.innerHTML = "";



    const emptyOption =

        document.createElement("option");



    emptyOption.value = "";

    emptyOption.textContent =

        "Select a Tool";



    toolSelect.appendChild(

        emptyOption

    );



    tools.forEach(

        tool => {

            const option =

                document.createElement(

                    "option"

                );



            option.value =

                tool.id;



            option.textContent =

                tool.name;



            if (

                String(tool.id) ===

                String(currentToolId ?? "")

            ) {

                option.selected = true;

            }



            toolSelect.appendChild(

                option

            );

        }

    );



    setupToolSearchDropdown(

        toolSelect,

        tools

    );
}



// ============================================================
// TOOL SEARCH / QUICK CREATE
// ============================================================

function setupToolSearchDropdown(

    toolSelect,

    tools

) {

    if (!toolSelect) {
        return;
    }



    const existingWrapper =

        toolSelect.closest(

            ".tool-search-dropdown"

        );



    if (existingWrapper) {

        existingWrapper.parentNode.insertBefore(

            toolSelect,

            existingWrapper

        );

        existingWrapper.remove();

    }



    const wrapper =

        document.createElement("div");

    wrapper.className =

        "tool-search-dropdown";



    const input =

        document.createElement("input");

    input.type = "text";

    input.className =

        "tool-search-input";

    input.autocomplete = "off";

    input.placeholder =

        "Search or select a tool...";

    input.setAttribute(

        "role",

        "combobox"

    );

    input.setAttribute(

        "aria-expanded",

        "false"

    );



    const dropdown =

        document.createElement("div");

    dropdown.className =

        "tool-search-options";

    dropdown.setAttribute(

        "role",

        "listbox"

    );



    toolSelect.parentNode.insertBefore(

        wrapper,

        toolSelect

    );

    wrapper.appendChild(input);

    wrapper.appendChild(dropdown);

    wrapper.appendChild(toolSelect);



    toolSelect.style.display = "none";



    let highlightedIndex = -1;
    let visibleOptions = [];



    function getSelectedToolName() {

        const selectedOption =

            toolSelect.options[

                toolSelect.selectedIndex

            ];



        return selectedOption &&

            selectedOption.value

            ? selectedOption.textContent.trim()

            : "";

    }



    function syncInputWithSelect() {

        input.value =

            getSelectedToolName();

    }



    function closeDropdown() {

        dropdown.classList.remove(

            "tool-search-options-visible"

        );

        input.setAttribute(

            "aria-expanded",

            "false"

        );

        highlightedIndex = -1;

    }



    function openDropdown() {

        renderOptions(

            input.value

        );



        dropdown.classList.add(

            "tool-search-options-visible"

        );

        input.setAttribute(

            "aria-expanded",

            "true"

        );

    }



    function selectTool(toolId) {

        toolSelect.value =

            String(toolId);



        toolSelect.dispatchEvent(

            new Event(

                "change",

                { bubbles: true }

            )

        );



        syncInputWithSelect();

        closeDropdown();

    }



    function renderOptions(searchValue = "") {

        const query =

            searchValue.trim().toLowerCase();



        dropdown.innerHTML = "";

        visibleOptions = [];

        highlightedIndex = -1;



        const matchingTools = tools.filter(

            tool =>

                !query ||

                String(tool.name)

                    .toLowerCase()

                    .includes(query)

        );



        matchingTools.forEach(

            tool => {

                const option =

                    document.createElement("button");

                option.type = "button";

                option.className =

                    "tool-search-option";

                option.setAttribute(

                    "role",

                    "option"

                );

                option.textContent =

                    tool.name;



                option.addEventListener(

                    "mousedown",

                    event => {

                        event.preventDefault();

                    }

                );



                option.addEventListener(

                    "click",

                    () => {

                        selectTool(tool.id);

                    }

                );



                dropdown.appendChild(

                    option

                );

                visibleOptions.push(option);

            }

        );



        const exactMatch =

            tools.some(

                tool =>

                    String(tool.name)

                        .trim()

                        .toLowerCase() === query

            );



        if (query && !exactMatch) {

            const addOption =

                document.createElement("button");

            addOption.type = "button";

            addOption.className =

                "tool-search-option tool-search-add";

            addOption.setAttribute(

                "role",

                "option"

            );

            addOption.innerHTML =

                `<span class="tool-search-add-icon">+</span>` +

                `<span>Add "${escapeNotificationHtml(searchValue.trim())}"</span>`;



            addOption.addEventListener(

                "mousedown",

                event => {

                    event.preventDefault();

                }

            );



            addOption.addEventListener(

                "click",

                async () => {

                    await createToolFromSearch(

                        searchValue.trim(),

                        tools,

                        toolSelect,

                        input,

                        dropdown

                    );

                }

            );



            dropdown.appendChild(

                addOption

            );

            visibleOptions.push(addOption);

        }



        if (

            visibleOptions.length === 0

        ) {

            const emptyMessage =

                document.createElement("div");

            emptyMessage.className =

                "tool-search-empty";

            emptyMessage.textContent =

                "No tools found.";

            dropdown.appendChild(

                emptyMessage

            );

        }

    }



    async function handleKeyboard(event) {

        if (event.key === "ArrowDown") {

            event.preventDefault();

            if (!dropdown.classList.contains("tool-search-options-visible")) {

                openDropdown();

            }

            if (visibleOptions.length > 0) {

                highlightedIndex =

                    Math.min(

                        highlightedIndex + 1,

                        visibleOptions.length - 1

                    );

                visibleOptions.forEach(

                    (option, index) => {

                        option.classList.toggle(

                            "tool-search-option-highlighted",

                            index === highlightedIndex

                        );

                    }

                );

            }

            return;

        }



        if (event.key === "ArrowUp") {

            event.preventDefault();



            if (visibleOptions.length > 0) {

                highlightedIndex =

                    highlightedIndex <= 0

                        ? visibleOptions.length - 1

                        : highlightedIndex - 1;



                visibleOptions.forEach(

                    (option, index) => {

                        option.classList.toggle(

                            "tool-search-option-highlighted",

                            index === highlightedIndex

                        );

                    }

                );

            }

            return;

        }



        if (event.key === "Enter") {

            event.preventDefault();



            if (

                highlightedIndex >= 0 &&

                visibleOptions[highlightedIndex]

            ) {

                visibleOptions[

                    highlightedIndex

                ].click();

                return;

            }



            const typedName =

                input.value.trim();



            if (!typedName) {

                selectTool("");

                return;

            }



            const exactTool =

                tools.find(

                    tool =>

                        String(tool.name)

                            .trim()

                            .toLowerCase() ===

                        typedName.toLowerCase()

                );



            if (exactTool) {

                selectTool(exactTool.id);

                return;

            }



            await createToolFromSearch(

                typedName,

                tools,

                toolSelect,

                input,

                dropdown

            );

        }



        if (event.key === "Escape") {

            syncInputWithSelect();

            closeDropdown();

        }

    }



    input.addEventListener(

        "focus",

        openDropdown

    );



    input.addEventListener(

        "input",

        () => {

            openDropdown();

        }

    );



    input.addEventListener(

        "keydown",

        handleKeyboard

    );



    input.addEventListener(

        "blur",

        () => {

            setTimeout(

                () => {

                    closeDropdown();

                    if (!toolSelect.value) {

                        input.value = "";

                    } else {

                        syncInputWithSelect();

                    }

                },

                150

            );

        }

    );



    document.addEventListener(

        "click",

        event => {

            if (!wrapper.contains(event.target)) {

                closeDropdown();

            }

        }

    );



    toolSelect.addEventListener(

        "change",

        syncInputWithSelect

    );



    syncInputWithSelect();
}



async function createToolFromSearch(

    toolName,

    tools,

    toolSelect,

    input,

    dropdown

) {

    const cleanName =

        String(toolName ?? "").trim();



    if (!cleanName) {

        return;

    }



    const existingTool =

        tools.find(

            tool =>

                String(tool.name)

                    .trim()

                    .toLowerCase() ===

                cleanName.toLowerCase()

        );



    if (existingTool) {

        toolSelect.value =

            String(existingTool.id);



        toolSelect.dispatchEvent(

            new Event(

                "change",

                { bubbles: true }

            )

        );

        input.value = existingTool.name;

        dropdown.classList.remove(

            "tool-search-options-visible"

        );

        return;

    }



    input.disabled = true;



    try {

        const createdTool =

            await createTool({

                name: cleanName,

                description:

                    "Created from Ticket Creator",

                is_active: true

            });



        tools.push(createdTool);



        const option =

            document.createElement("option");

        option.value =

            createdTool.id;

        option.textContent =

            createdTool.name;

        toolSelect.appendChild(option);

        toolSelect.value =

            String(createdTool.id);



        toolSelect.dispatchEvent(

            new Event(

                "change",

                { bubbles: true }

            )

        );



        input.value =

            createdTool.name;



        dropdown.classList.remove(

            "tool-search-options-visible"

        );



        showSuccessMessage(

            `Tool "${createdTool.name}" created successfully.`

        );

    } catch (error) {

        console.error(

            "Error creating tool:",

            error

        );



        showErrorMessage(

            "Could not create the tool."

        );

    } finally {

        input.disabled = false;

        input.focus();

    }
}



// ============================================================

// TOOL KNOWLEDGE BASE

// ============================================================



async function loadToolKnowledgeBase(
    toolId
) {
    const container =
        document.getElementById("toolKnowledgeBase");

    if (!container) return;

    container.innerHTML = "";

    if (!toolId) {
        container.innerHTML =
            "<p>Select a Tool to see related Knowledge Base articles.</p>";
        return;
    }

    try {
        const knowledgeBase =
            await getToolKnowledgeBase(toolId);

        renderRelatedKnowledgeBase(
            container,
            knowledgeBase
        );

    } catch (error) {
        console.error("Error loading Tool KB:", error);
        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================
// USER TYPES
// ============================================================

async function loadUserTypes(
    currentUserTypeId
) {

    const userTypes =
        await getUserTypes();

    const userTypeSelect =
        document.getElementById(
            "userType"
        );

    if (!userTypeSelect) {
        return;
    }

    userTypeSelect.innerHTML = "";

    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";
    emptyOption.textContent =
        "Select a User Type";

    userTypeSelect.appendChild(
        emptyOption
    );

    userTypes.forEach(
        userType => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = userType.id;
            option.textContent = userType.name;

            if (
                String(userType.id) ===
                String(currentUserTypeId ?? "")
            ) {
                option.selected = true;
            }

            userTypeSelect.appendChild(
                option
            );
        }
    );

    setupUserTypeSearchDropdown(
        userTypeSelect,
        userTypes
    );
}


function setupUserTypeSearchDropdown(
    userTypeSelect,
    userTypes
) {

    if (!userTypeSelect) {
        return;
    }

    const existingWrapper =
        userTypeSelect.closest(
            ".user-type-search-dropdown"
        );

    if (existingWrapper) {
        existingWrapper.parentNode.insertBefore(
            userTypeSelect,
            existingWrapper
        );
        existingWrapper.remove();
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "tool-search-dropdown user-type-search-dropdown";

    const input =
        document.createElement("input");

    input.type = "text";
    input.className = "tool-search-input";
    input.autocomplete = "off";
    input.placeholder =
        "Search or select a user type...";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");

    const dropdown =
        document.createElement("div");

    dropdown.className =
        "tool-search-options";
    dropdown.setAttribute("role", "listbox");

    userTypeSelect.parentNode.insertBefore(
        wrapper,
        userTypeSelect
    );

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(userTypeSelect);

    userTypeSelect.style.display = "none";

    let highlightedIndex = -1;
    let visibleOptions = [];

    function selectedName() {
        const option =
            userTypeSelect.options[
                userTypeSelect.selectedIndex
            ];

        return option && option.value
            ? option.textContent.trim()
            : "";
    }

    function syncInput() {
        input.value = selectedName();
    }

    function closeDropdown() {
        dropdown.classList.remove(
            "tool-search-options-visible"
        );
        input.setAttribute(
            "aria-expanded",
            "false"
        );
        highlightedIndex = -1;
    }

    function openDropdown() {
        renderOptions(input.value);
        dropdown.classList.add(
            "tool-search-options-visible"
        );
        input.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    function selectUserType(id) {
        userTypeSelect.value = String(id);
        userTypeSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );
        syncInput();
        closeDropdown();
    }

    function renderOptions(searchValue = "") {
        const query =
            searchValue.trim().toLowerCase();

        dropdown.innerHTML = "";
        visibleOptions = [];
        highlightedIndex = -1;

        const matches = userTypes.filter(
            userType =>
                !query ||
                String(userType.name)
                    .toLowerCase()
                    .includes(query)
        );

        matches.forEach(userType => {
            const option =
                document.createElement("button");

            option.type = "button";
            option.className =
                "tool-search-option";
            option.setAttribute("role", "option");
            option.textContent = userType.name;

            option.addEventListener(
                "mousedown",
                event => event.preventDefault()
            );

            option.addEventListener(
                "click",
                () => selectUserType(userType.id)
            );

            dropdown.appendChild(option);
            visibleOptions.push(option);
        });

        const exactMatch = userTypes.some(
            userType =>
                String(userType.name)
                    .trim()
                    .toLowerCase() === query
        );

        if (query && !exactMatch) {
            const addOption =
                document.createElement("button");

            addOption.type = "button";
            addOption.className =
                "tool-search-option tool-search-add";
            addOption.setAttribute("role", "option");
            addOption.innerHTML =
                `<span class="tool-search-add-icon">+</span>` +
                `<span>Add "${escapeNotificationHtml(searchValue.trim())}"</span>`;

            addOption.addEventListener(
                "mousedown",
                event => event.preventDefault()
            );

            addOption.addEventListener(
                "click",
                async () => {
                    await createUserTypeFromSearch(
                        searchValue.trim(),
                        userTypes,
                        userTypeSelect,
                        input,
                        dropdown
                    );
                }
            );

            dropdown.appendChild(addOption);
            visibleOptions.push(addOption);
        }

        if (!visibleOptions.length) {
            const empty =
                document.createElement("div");
            empty.className = "tool-search-empty";
            empty.textContent =
                "No user types found.";
            dropdown.appendChild(empty);
        }
    }

    async function handleKeyboard(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!dropdown.classList.contains(
                "tool-search-options-visible"
            )) {
                openDropdown();
            }
            if (visibleOptions.length) {
                highlightedIndex = Math.min(
                    highlightedIndex + 1,
                    visibleOptions.length - 1
                );
                visibleOptions.forEach(
                    (option, index) =>
                        option.classList.toggle(
                            "tool-search-option-highlighted",
                            index === highlightedIndex
                        )
                );
            }
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (visibleOptions.length) {
                highlightedIndex =
                    highlightedIndex <= 0
                        ? visibleOptions.length - 1
                        : highlightedIndex - 1;
                visibleOptions.forEach(
                    (option, index) =>
                        option.classList.toggle(
                            "tool-search-option-highlighted",
                            index === highlightedIndex
                        )
                );
            }
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (
                highlightedIndex >= 0 &&
                visibleOptions[highlightedIndex]
            ) {
                visibleOptions[highlightedIndex].click();
                return;
            }

            const typedName = input.value.trim();
            if (!typedName) {
                userTypeSelect.value = "";
                userTypeSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
                return;
            }

            const exactUserType = userTypes.find(
                userType =>
                    String(userType.name)
                        .trim()
                        .toLowerCase() ===
                    typedName.toLowerCase()
            );

            if (exactUserType) {
                selectUserType(exactUserType.id);
                return;
            }

            await createUserTypeFromSearch(
                typedName,
                userTypes,
                userTypeSelect,
                input,
                dropdown
            );
            return;
        }

        if (event.key === "Escape") {
            syncInput();
            closeDropdown();
        }
    }

    input.addEventListener("focus", openDropdown);
    input.addEventListener("input", openDropdown);
    input.addEventListener("keydown", handleKeyboard);

    input.addEventListener("blur", () => {
        setTimeout(() => {
            closeDropdown();
            syncInput();
        }, 150);
    });

    document.addEventListener("click", event => {
        if (!wrapper.contains(event.target)) {
            closeDropdown();
        }
    });

    userTypeSelect.addEventListener(
        "change",
        syncInput
    );

    syncInput();
}


async function createUserTypeFromSearch(
    userTypeName,
    userTypes,
    userTypeSelect,
    input,
    dropdown
) {
    const cleanName =
        String(userTypeName ?? "").trim();

    if (!cleanName) {
        return;
    }

    const existingUserType = userTypes.find(
        userType =>
            String(userType.name)
                .trim()
                .toLowerCase() ===
            cleanName.toLowerCase()
    );

    if (existingUserType) {
        selectExistingUserType(
            existingUserType
        );
        return;
    }

    input.disabled = true;

    try {
        const createdUserType =
            await createUserType({
                name: cleanName,
                is_active: true
            });

        userTypes.push(createdUserType);

        const option =
            document.createElement("option");
        option.value = createdUserType.id;
        option.textContent = createdUserType.name;
        userTypeSelect.appendChild(option);
        userTypeSelect.value =
            String(createdUserType.id);

        userTypeSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );

        input.value = createdUserType.name;
        dropdown.classList.remove(
            "tool-search-options-visible"
        );
    } catch (error) {
        console.error(
            "Error creating user type:",
            error
        );
        showErrorMessage(
            error.message ||
                "Could not create the user type."
        );
    } finally {
        input.disabled = false;
        input.focus();
    }

    function selectExistingUserType(userType) {
        userTypeSelect.value = String(userType.id);
        userTypeSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );
        input.value = userType.name;
        dropdown.classList.remove(
            "tool-search-options-visible"
        );
    }
}


// ============================================================

// LOCATIONS

// ============================================================



async function loadLocations(
    currentLocationId
) {

    const locations =
        await getLocations();

    const locationSelect =
        document.getElementById("location");

    locationSelect.innerHTML = "";

    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";
    emptyOption.textContent = "Select a Location";

    locationSelect.appendChild(emptyOption);

    locations.forEach(
        location => {

            const option =
                document.createElement("option");

            option.value = location.id;
            option.textContent = location.name;

            option.dataset.code =
                location.code ?? "";

            if (
                String(location.id) ===
                String(currentLocationId ?? "")
            ) {
                option.selected = true;
            }

            locationSelect.appendChild(option);
        }
    );

    setupLocationSearchDropdown(
        locationSelect,
        locations
    );
}


// ============================================================
// LOCATION SEARCH / QUICK CREATE
// ============================================================

function setupLocationSearchDropdown(
    locationSelect,
    locations
) {

    if (!locationSelect) {
        return;
    }

    const existingWrapper =
        locationSelect.closest(
            ".location-search-dropdown"
        );

    if (existingWrapper) {

        existingWrapper.parentNode.insertBefore(
            locationSelect,
            existingWrapper
        );

        existingWrapper.remove();
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "tool-search-dropdown location-search-dropdown";

    const input =
        document.createElement("input");

    input.type = "text";
    input.className =
        "tool-search-input location-search-input";

    input.autocomplete = "off";
    input.placeholder =
        "Search or select a location...";

    input.setAttribute(
        "role",
        "combobox"
    );

    input.setAttribute(
        "aria-expanded",
        "false"
    );

    const dropdown =
        document.createElement("div");

    dropdown.className =
        "tool-search-options location-search-options";

    dropdown.setAttribute(
        "role",
        "listbox"
    );

    locationSelect.parentNode.insertBefore(
        wrapper,
        locationSelect
    );

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(locationSelect);

    locationSelect.style.display = "none";

    let highlightedIndex = -1;
    let visibleOptions = [];

    function getSelectedLocationName() {

        const selectedOption =
            locationSelect.options[
                locationSelect.selectedIndex
            ];

        return selectedOption &&
            selectedOption.value
            ? selectedOption.textContent.trim()
            : "";
    }

    function syncInputWithSelect() {

        input.value =
            getSelectedLocationName();
    }

    function closeDropdown() {

        dropdown.classList.remove(
            "tool-search-options-visible"
        );

        input.setAttribute(
            "aria-expanded",
            "false"
        );

        highlightedIndex = -1;
    }

    function openDropdown() {

        renderOptions(input.value);

        dropdown.classList.add(
            "tool-search-options-visible"
        );

        input.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    function selectLocation(locationId) {

        locationSelect.value =
            String(locationId);

        locationSelect.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        syncInputWithSelect();
        closeDropdown();
    }

    function renderOptions(
        searchValue = ""
    ) {

        const query =
            searchValue.trim().toLowerCase();

        dropdown.innerHTML = "";
        visibleOptions = [];
        highlightedIndex = -1;

        const matchingLocations =
            locations.filter(
                location => {

                    const name =
                        String(
                            location.name ?? ""
                        ).toLowerCase();

                    const code =
                        String(
                            location.code ?? ""
                        ).toLowerCase();

                    return (
                        !query ||
                        name.includes(query) ||
                        code.includes(query)
                    );
                }
            );

        matchingLocations.forEach(
            location => {

                const option =
                    document.createElement(
                        "button"
                    );

                option.type = "button";

                option.className =
                    "tool-search-option";

                option.setAttribute(
                    "role",
                    "option"
                );

                option.textContent =
                    location.code
                        ? `${location.name} (${location.code})`
                        : location.name;

                option.addEventListener(
                    "mousedown",
                    event => {
                        event.preventDefault();
                    }
                );

                option.addEventListener(
                    "click",
                    () => {
                        selectLocation(
                            location.id
                        );
                    }
                );

                dropdown.appendChild(option);
                visibleOptions.push(option);
            }
        );

        const exactMatch =
            locations.some(
                location => {

                    const name =
                        String(
                            location.name ?? ""
                        )
                            .trim()
                            .toLowerCase();

                    const code =
                        String(
                            location.code ?? ""
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        name === query ||
                        code === query
                    );
                }
            );

        if (
            query &&
            !exactMatch
        ) {

            const addOption =
                document.createElement(
                    "button"
                );

            addOption.type = "button";

            addOption.className =
                "tool-search-option tool-search-add";

            addOption.setAttribute(
                "role",
                "option"
            );

            addOption.innerHTML =
                `<span class="tool-search-add-icon">+</span>` +
                `<span>Add "${escapeNotificationHtml(searchValue.trim())}"</span>`;

            addOption.addEventListener(
                "mousedown",
                event => {
                    event.preventDefault();
                }
            );

            addOption.addEventListener(
                "click",
                async () => {

                    await createLocationFromSearch(
                        searchValue.trim(),
                        locations,
                        locationSelect,
                        input,
                        dropdown
                    );
                }
            );

            dropdown.appendChild(addOption);
            visibleOptions.push(addOption);
        }

        if (!visibleOptions.length) {

            const emptyMessage =
                document.createElement(
                    "div"
                );

            emptyMessage.className =
                "tool-search-empty";

            emptyMessage.textContent =
                "No locations found.";

            dropdown.appendChild(emptyMessage);
        }
    }

    async function handleKeyboard(event) {

        if (event.key === "ArrowDown") {

            event.preventDefault();

            if (
                !dropdown.classList.contains(
                    "tool-search-options-visible"
                )
            ) {
                openDropdown();
            }

            if (visibleOptions.length > 0) {

                highlightedIndex =
                    Math.min(
                        highlightedIndex + 1,
                        visibleOptions.length - 1
                    );

                visibleOptions.forEach(
                    (option, index) => {

                        option.classList.toggle(
                            "tool-search-option-highlighted",
                            index === highlightedIndex
                        );
                    }
                );
            }

            return;
        }

        if (event.key === "ArrowUp") {

            event.preventDefault();

            if (visibleOptions.length > 0) {

                highlightedIndex =
                    highlightedIndex <= 0
                        ? visibleOptions.length - 1
                        : highlightedIndex - 1;

                visibleOptions.forEach(
                    (option, index) => {

                        option.classList.toggle(
                            "tool-search-option-highlighted",
                            index === highlightedIndex
                        );
                    }
                );
            }

            return;
        }

        if (event.key === "Enter") {

            event.preventDefault();

            if (
                highlightedIndex >= 0 &&
                visibleOptions[
                    highlightedIndex
                ]
            ) {

                visibleOptions[
                    highlightedIndex
                ].click();

                return;
            }

            const typedName =
                input.value.trim();

            if (!typedName) {

                selectLocation("");
                return;
            }

            const exactLocation =
                locations.find(
                    location => {

                        const name =
                            String(
                                location.name ?? ""
                            )
                                .trim()
                                .toLowerCase();

                        const code =
                            String(
                                location.code ?? ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            name ===
                            typedName.toLowerCase() ||
                            code ===
                            typedName.toLowerCase()
                        );
                    }
                );

            if (exactLocation) {

                selectLocation(
                    exactLocation.id
                );

                return;
            }

            await createLocationFromSearch(
                typedName,
                locations,
                locationSelect,
                input,
                dropdown
            );

            return;
        }

        if (event.key === "Escape") {

            syncInputWithSelect();
            closeDropdown();
        }
    }

    input.addEventListener(
        "focus",
        openDropdown
    );

    input.addEventListener(
        "input",
        () => {
            openDropdown();
        }
    );

    input.addEventListener(
        "keydown",
        handleKeyboard
    );

    input.addEventListener(
        "blur",
        () => {

            setTimeout(
                () => {

                    closeDropdown();

                    if (!locationSelect.value) {
                        input.value = "";
                    } else {
                        syncInputWithSelect();
                    }
                },
                150
            );
        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                !wrapper.contains(
                    event.target
                )
            ) {
                closeDropdown();
            }
        }
    );

    locationSelect.addEventListener(
        "change",
        syncInputWithSelect
    );

    syncInputWithSelect();
}


async function createLocationFromSearch(
    locationName,
    locations,
    locationSelect,
    input,
    dropdown
) {

    const cleanName =
        String(
            locationName ?? ""
        ).trim();

    if (!cleanName) {
        return;
    }

    const existingLocation =
        locations.find(
            location =>
                String(
                    location.name ?? ""
                )
                    .trim()
                    .toLowerCase() ===
                cleanName.toLowerCase()
        );

    if (existingLocation) {

        selectExistingLocation(
            existingLocation
        );

        return;
    }

    input.disabled = true;

    try {

        const createdLocation =
            await createLocation(
                {
                    name: cleanName,
                    is_active: true
                }
            );

        locations.push(
            createdLocation
        );

        const option =
            document.createElement(
                "option"
            );

        option.value =
            createdLocation.id;

        option.textContent =
            createdLocation.name;

        option.dataset.code =
            createdLocation.code ?? "";

        locationSelect.appendChild(option);

        locationSelect.value =
            String(
                createdLocation.id
            );

        locationSelect.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        input.value =
            createdLocation.name;

        dropdown.classList.remove(
            "tool-search-options-visible"
        );

    } catch (error) {

        console.error(
            "Error creating location:",
            error
        );

        showErrorMessage(
            error.message ||
            "Could not create the location."
        );

    } finally {

        input.disabled = false;
        input.focus();
    }


    function selectExistingLocation(
        location
    ) {

        locationSelect.value =
            String(
                location.id
            );

        locationSelect.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        input.value =
            location.name;

        dropdown.classList.remove(
            "tool-search-options-visible"
        );
    }
}


// ============================================================

// ISSUE TYPES

// ============================================================



async function loadIssueTypes(

    currentIssueTypeId

) {



    const issueTypes =

        await getIssueTypes();





    const issueTypeSelect =

        document.getElementById(

            "issueType"

        );





    issueTypeSelect.innerHTML = "";

    const emptyOption =

        document.createElement("option");



    emptyOption.value = "";

    emptyOption.textContent =

        "Select an Issue Type";



    issueTypeSelect.appendChild(

        emptyOption

    );    



    issueTypes.forEach(

        issueType => {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                issueType.id;



            option.textContent =

                issueType.name;





            if (

                issueType.id ===

                currentIssueTypeId

            ) {



                option.selected = true;

            }





            issueTypeSelect.appendChild(

                option

            );

        }

    );

}



// ============================================================

// ISSUE TYPES BY TOOL — RECOMMENDATIONS

// ============================================================



async function loadIssueTypesByTool(toolId) {



    const issueTypeSelect =

        document.getElementById("issueType");



    if (!toolId) {

        return;

    }



    try {



        const recommendedIssueTypes =

            await getToolIssueTypes(toolId);



        const currentIssueTypeId =

            issueTypeSelect.value;



        // Get all existing options

        const allOptions =

            Array.from(issueTypeSelect.options);



        // Separate the options

        const recommendedIds =

            new Set(

                recommendedIssueTypes.map(

                    issueType => String(issueType.id)

                )

            );



        const recommendedOptions = [];

        const otherOptions = [];



        allOptions.forEach(option => {



            // Keep the default option at the top

            if (!option.value) {

                return;

            }



            if (recommendedIds.has(option.value)) {

                recommendedOptions.push(option);

            } else {

                otherOptions.push(option);

            }

        });



        // Rebuild the dropdown

        issueTypeSelect.innerHTML = "";



        // Default option

        const defaultOption =

            document.createElement("option");



        defaultOption.value = "";

        defaultOption.textContent =

            "Select Issue Type";



        issueTypeSelect.appendChild(

            defaultOption

        );



        // Recommended group

        if (recommendedOptions.length > 0) {



            const recommendedGroup =

                document.createElement("optgroup");



            recommendedGroup.label =

                "Recommended for selected Tool";



            recommendedOptions.forEach(option => {

                recommendedGroup.appendChild(option);

            });



            issueTypeSelect.appendChild(

                recommendedGroup

            );

        }



        // Other Issue Types

        if (otherOptions.length > 0) {



            const otherGroup =

                document.createElement("optgroup");



            otherGroup.label =

                "Other Issue Types";



            otherOptions.forEach(option => {

                otherGroup.appendChild(option);

            });



            issueTypeSelect.appendChild(

                otherGroup

            );

        }



        // Restore the Issue Type that was already selected

        if (

            currentIssueTypeId &&

            issueTypeSelect.querySelector(

                `option[value="${currentIssueTypeId}"]`

            )

        ) {

            issueTypeSelect.value =

                currentIssueTypeId;

        }



    } catch (error) {



        console.error(

            "Error loading Issue Type recommendations:",

            error

        );

    }

}

// ============================================================

// ============================================================
// KNOWLEDGE BASE NOTES — ISSUE TYPE + TOOL
// ============================================================

function getSpecialKnowledgeBaseNoteCategory(note) {
    return String(note?.category ?? "").trim().toLowerCase();
}

function isActiveKnowledgeBaseNote(note) {
    return note?.is_active !== false;
}

function renderRelatedKnowledgeBaseNote(note, sourceLabels = []) {
    const category = getSpecialKnowledgeBaseNoteCategory(note);
    const isAlert = category === "alert";
    const isPinned = note?.is_pinned === true;

    const item = document.createElement("div");
    item.className = `kb-special-note${isAlert ? " kb-alert-note" : " kb-note-item"}`;
    if (isPinned && !isAlert) item.classList.add("kb-note-item-pinned");

    const main = document.createElement("div");
    main.className = isAlert ? "kb-special-note-main" : "kb-note-item-content";

    const title = document.createElement("div");
    title.className = isAlert ? "kb-special-note-title" : "kb-note-item-title";
    title.textContent = `${isAlert ? "⚠ " : isPinned ? "📌 " : ""}${note.title || "Untitled note"}`;

    const content = document.createElement("div");
    content.className = isAlert ? "kb-special-note-content" : "kb-note-item-body";
    content.textContent = note.content || "";

    main.appendChild(title);
    main.appendChild(content);

    if (sourceLabels.length) {
        const source = document.createElement("div");
        source.className = "quick-note-related";
        source.style.marginTop = "5px";
        source.textContent = sourceLabels.join(" · ");
        main.appendChild(source);
    }

    const actions = document.createElement("div");
    actions.className = "kb-special-note-actions";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "kb-special-note-view";
    viewButton.textContent = "View";
    viewButton.title = "View note";
    viewButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openRelatedKnowledgeBaseNoteView(note, sourceLabels);
    });

    actions.appendChild(viewButton);
    item.appendChild(main);
    item.appendChild(actions);
    return item;
}

function openRelatedKnowledgeBaseNoteView(note, sourceLabels = []) {
    if (!note) return;

    const overlay = createQuickNoteOverlay();
    const modal = document.createElement("div");
    modal.className = "catalog-create-modal related-kb-note-view-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", note.title || "Knowledge Base Note");

    const category = getSpecialKnowledgeBaseNoteCategory(note);
    const isAlert = category === "alert";
    const isPinned = note?.is_pinned === true;
    const categoryLabel = isAlert ? "Alert" : isPinned ? "Pinned Note" : "Knowledge Base Note";

    const sourceMarkup = sourceLabels.length
        ? sourceLabels.map(source => `<span class="related-kb-note-source">${escapeNotificationHtml(source)}</span>`).join("")
        : "";

    modal.innerHTML = `
        <div class="catalog-create-header related-kb-note-view-header">
            <div>
                <div class="catalog-create-eyebrow">${escapeNotificationHtml(categoryLabel)}</div>
                <h3>${escapeNotificationHtml(note.title || "Untitled note")}</h3>
            </div>
            <button type="button" class="catalog-create-close" aria-label="Close">×</button>
        </div>
        <div class="related-kb-note-view-body">
            <div class="related-kb-note-view-meta">
                ${isAlert ? `<span class="related-kb-note-type related-kb-note-type-alert">⚠ Alert</span>` : ""}
                ${isPinned ? `<span class="related-kb-note-type related-kb-note-type-pinned">📌 Pinned</span>` : ""}
                ${sourceMarkup}
            </div>
            <div class="related-kb-note-view-label">Note</div>
            <div class="related-kb-note-view-content">${escapeNotificationHtml(note.content || "")}</div>
        </div>
        <div class="catalog-create-actions related-kb-note-view-actions">
            <button type="button" class="button button-secondary related-kb-note-close">Close</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
        closeQuickNoteModal(overlay);
        document.removeEventListener("keydown", handleEscape);
    };

    const handleEscape = event => {
        if (event.key === "Escape") close();
    };

    modal.querySelector(".catalog-create-close").addEventListener("click", close);
    modal.querySelector(".related-kb-note-close").addEventListener("click", close);
    overlay.addEventListener("mousedown", event => {
        if (event.target === overlay) close();
    });
    document.addEventListener("keydown", handleEscape);

    modal.querySelector(".catalog-create-close").focus();
}

async function loadRelatedKnowledgeBaseNotes(issueTypeId = null, toolId = null) {
    const container = document.getElementById("relatedKnowledgeBaseNotes");
    if (!container) return;

    container.innerHTML = "";

    if (!issueTypeId && !toolId) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    container.style.display = "";

    try {
        const [issueTypeNotes, toolNotes] = await Promise.all([
            issueTypeId ? getIssueTypeKnowledgeBaseNotes(issueTypeId) : [],
            toolId ? getToolKnowledgeBaseNotes(toolId) : []
        ]);

        const notesById = new Map();

        (issueTypeNotes || []).filter(isActiveKnowledgeBaseNote).forEach(note => {
            const id = String(note.id);
            if (!notesById.has(id)) notesById.set(id, { note, sources: [] });
            notesById.get(id).sources.push("Issue Type");
        });

        (toolNotes || []).filter(isActiveKnowledgeBaseNote).forEach(note => {
            const id = String(note.id);
            if (!notesById.has(id)) notesById.set(id, { note, sources: [] });
            notesById.get(id).sources.push("Tool");
        });

        const specialNotes = Array.from(notesById.values())
            .filter(({ note }) => {
                const category = getSpecialKnowledgeBaseNoteCategory(note);
                return category === "alert" || note?.is_pinned === true;
            })
            .sort((a, b) => {
                const aAlert = getSpecialKnowledgeBaseNoteCategory(a.note) === "alert";
                const bAlert = getSpecialKnowledgeBaseNoteCategory(b.note) === "alert";
                if (aAlert !== bAlert) return aAlert ? -1 : 1;
                if (a.note?.is_pinned !== b.note?.is_pinned) return a.note?.is_pinned ? -1 : 1;
                return String(a.note?.title ?? "").localeCompare(String(b.note?.title ?? ""));
            });

        if (!specialNotes.length) {
            container.innerHTML = "";
            container.style.display = "none";
            return;
        }

        container.style.display = "";

        const wrapper = document.createElement("div");
        wrapper.className = "kb-special-list";
        specialNotes.forEach(({ note, sources }) => {
            wrapper.appendChild(renderRelatedKnowledgeBaseNote(note, sources));
        });
        container.appendChild(wrapper);
    } catch (error) {
        console.error("Error loading related Knowledge Base Notes:", error);
        const message = document.createElement("p");
        message.textContent = "Error loading Knowledge Base Notes.";
        container.appendChild(message);
    }
}

// ISSUE TYPE KNOWLEDGE BASE

// ============================================================



async function loadIssueTypeKnowledgeBase(
    issueTypeId
) {
    const container =
        document.getElementById("issueTypeKnowledgeBase");

    if (!container) return;

    container.innerHTML = "";

    if (!issueTypeId) {
        container.innerHTML =
            "<p>Select an Issue Type to see related Knowledge Base articles.</p>";
        return;
    }

    try {
        const knowledgeBase =
            await getIssueTypeKnowledgeBase(issueTypeId);

        renderRelatedKnowledgeBase(
            container,
            knowledgeBase
        );

    } catch (error) {
        console.error("Error loading Issue Type KB:", error);
        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================

// TROUBLESHOOTING TEMPLATES

// ============================================================



async function loadTroubleshootingTemplates(

    issueTypeId = null,

    currentTemplateId = null

) {



    const allTemplates =

        await getTroubleshootingTemplates();



    let relatedTemplates = [];



    // Only load related templates if an Issue Type was selected

    if (issueTypeId) {

        relatedTemplates =

            await getIssueTypeTroubleshootingTemplates(

                issueTypeId

            );

    }



    const templateSelect =

        document.getElementById(

            "troubleshootingTemplate"

        );



    templateSelect.innerHTML = "";



    troubleshootingTemplates = allTemplates;





    // Empty option



    const emptyOption =

        document.createElement("option");



    emptyOption.value = "";

    emptyOption.textContent =

        "Select a Troubleshooting Template";



    templateSelect.appendChild(

        emptyOption

    );





    // Related template IDs



    const relatedIds =

        new Set(

            relatedTemplates.map(

                template => template.id

            )

        );





    // Related templates



    if (relatedTemplates.length > 0) {



        const relatedGroup =

            document.createElement("optgroup");



        relatedGroup.label = "Related";





        relatedTemplates.forEach(

            template => {



                const option =

                    document.createElement(

                        "option"

                    );



                option.value =

                    template.id;



                option.textContent =

                    template.name ??

                    template.generated_description;



                relatedGroup.appendChild(

                    option

                );

            }

        );



        templateSelect.appendChild(

            relatedGroup

        );

    }





    // Other templates



    const otherTemplates =

        allTemplates.filter(

            template =>

                !relatedIds.has(

                    template.id

                )

        );





    if (otherTemplates.length > 0) {



        const allGroup =

            document.createElement(

                "optgroup"

            );



        allGroup.label =

            issueTypeId

                ? "All"

                : "All Templates";





        otherTemplates.forEach(

            template => {



                const option =

                    document.createElement(

                        "option"

                    );



                option.value =

                    template.id;



                option.textContent =

                    template.name ??

                    template.generated_description;



                allGroup.appendChild(

                    option

                );

            }

        );



        templateSelect.appendChild(

            allGroup

        );

    }





    // Select template



    if (

        currentTemplateId !== null &&

        currentTemplateId !== undefined

    ) {



        templateSelect.value =

            String(currentTemplateId);



    } else if (

        relatedTemplates.length > 0

    ) {



        templateSelect.value =

            String(

                relatedTemplates[0].id

            );



    } else {



        templateSelect.value = "";

    }





    // Update preview

    // The template is selected programmatically when an Issue Type is
    // chosen, so no native "change" event fires. Render the steps now.
    renderTroubleshootingTemplateSteps();


    // Keep the visible search field synchronized with the selected template.
    const templateSearchInput =
        templateSelect
            .closest(".catalog-search-dropdown")
            ?.querySelector(".catalog-search-input");

    if (templateSearchInput) {
        const selectedOption =
            templateSelect.options[
                templateSelect.selectedIndex
            ];

        templateSearchInput.value =
            selectedOption?.value
                ? selectedOption.textContent.trim()
                : "";
    }


    // Update template KB

    await loadTemplateKnowledgeBase(
        templateSelect.value
    );


}









// ============================================================

// SELECTED TEMPLATE

// ============================================================



async function loadSelectedTemplate() {



    const templateSelect =

        document.getElementById(

            "troubleshootingTemplate"

        );





    const templateId =

        templateSelect.value

            ? Number(

                templateSelect.value

            )

            : null;





    loadTemplatePreview();





    await loadTemplateKnowledgeBase(

        templateId

    );

}





// ============================================================

// TEMPLATE PREVIEW

// ============================================================



// ============================================================

// TEMPLATE KNOWLEDGE BASE

// ============================================================



async function loadTemplateKnowledgeBase(
    templateId
) {
    const container =
        document.getElementById("templateKnowledgeBase");

    if (!container) return;

    container.innerHTML = "";

    if (!templateId) {
        container.innerHTML =
            "<p>Select a Troubleshooting Template to see related Knowledge Base articles.</p>";
        return;
    }

    try {
        const knowledgeBase =
            await getTroubleshootingTemplateKnowledgeBase(
                templateId
            );

        renderRelatedKnowledgeBase(
            container,
            knowledgeBase
        );

    } catch (error) {
        console.error("Error loading Template KB:", error);
        container.innerHTML =
            "<p>Error loading Knowledge Base articles.</p>";
    }
}


// ============================================================

// FORMS

// ============================================================



async function loadForms(

    issueTypeId = null,

    currentFormId = null

) {



    const allForms =

        await getForms();



    let relatedForms = [];



    // Only load related forms if an Issue Type was selected

    if (issueTypeId) {

        relatedForms =

            await getIssueTypeForm(

                issueTypeId

            );

    }



    forms = allForms;



    const formSelect =

        document.getElementById("form");



    formSelect.innerHTML = "";





    // Empty option



    const emptyOption =

        document.createElement("option");



    emptyOption.value = "";

    emptyOption.textContent =

        "Select a Form";



    formSelect.appendChild(

        emptyOption

    );





    // Related form IDs



    const relatedIds =

        new Set(

            relatedForms.map(

                form => form.id

            )

        );





    // Related forms



    if (relatedForms.length > 0) {



        const relatedGroup =

            document.createElement(

                "optgroup"

            );



        relatedGroup.label =

            "Related";





        relatedForms.forEach(

            form => {



                const option =

                    document.createElement(

                        "option"

                    );



                option.value =

                    form.id;



                option.textContent =

                    form.name;



                relatedGroup.appendChild(

                    option

                );

            }

        );



        formSelect.appendChild(

            relatedGroup

        );

    }





    // Other forms



    const otherForms =

        allForms.filter(

            form =>

                !relatedIds.has(

                    form.id

                )

        );





    if (otherForms.length > 0) {



        const allGroup =

            document.createElement(

                "optgroup"

            );



        allGroup.label =

            issueTypeId

                ? "All"

                : "All Forms";





        otherForms.forEach(

            form => {



                const option =

                    document.createElement(

                        "option"

                    );



                option.value =

                    form.id;



                option.textContent =

                    form.name;



                allGroup.appendChild(

                    option

                );

            }

        );



        formSelect.appendChild(

            allGroup

        );

    }





    // Select form



    if (

        currentFormId !== null &&

        currentFormId !== undefined

    ) {



        formSelect.value =

            String(currentFormId);



    } else if (

        relatedForms.length > 0

    ) {



        formSelect.value =

            String(

                relatedForms[0].id

            );



    } else {



        formSelect.value = "";

    }





    // Update preview



    await loadSelectedForm(

        formSelect.value

    );

}





// ============================================================

// SELECTED FORM

// ============================================================



async function loadSelectedForm(

    formId

) {



    await loadFormPreview(

        formId

    );

}





// ============================================================

// FORM PREVIEW

// ============================================================



async function loadFormPreview(
    formId
) {

    if (!formId) {
        renderFormTemplateFields([]);
        return;
    }

    const form =
        forms.find(
            form =>
                form.id ===
                Number(formId)
        );

    if (!form) {
        renderFormTemplateFields([]);
        return;
    }

    try {
        const fields =
            await getFormFields(
                formId
            );

        const formLines = [];

        // Prefer the real Form fields when they exist. If the Form was
        // created directly from Ticket Detail, its description is the
        // template body and can be used as the source instead.
        if (fields && fields.length > 0) {
            fields.forEach(field => {
                const label =
                    normalizeFormFieldText(
                        field?.label
                    );

                if (label) {
                    formLines.push(label);
                }
            });
        }

        if (formLines.length === 0) {
            formLines.push(
                ...getFormDescriptionLines(
                    form.description
                )
            );
        }

        renderFormTemplateFields(
            formLines
        );

    } catch (error) {

        console.error(
            "Error loading Form Preview:",
            error
        );

        const formLines =
            getFormDescriptionLines(
                form.description
            );

        renderFormTemplateFields(
            formLines
        );
    }
}

function getFormDescriptionLines(value) {
    return String(value ?? "")
        .split(/\r?\n/)
        .map(line => normalizeFormFieldText(line))
        .filter(Boolean);
}

function ensureFormTemplateFieldsContainer() {

    const copyButton =
        document.getElementById(
            "copyFormButton"
        );

    if (!copyButton) {
        return null;
    }

    let container =
        document.getElementById(
            "formTemplateFields"
        );

    if (container) {
        return container;
    }

    container =
        document.createElement("div");

    container.id =
        "formTemplateFields";

    container.className =
        "troubleshooting-template-steps";

    copyButton.parentNode.insertBefore(
        container,
        copyButton
    );

    return container;
}

function normalizeFormFieldText(value) {
    return String(
        value ?? ""
    )
        .replace(
            /^\s*-\s*/,
            ""
        )
        .trim();
}

function normalizeFormTemplateContent(value) {
    return String(value ?? "")
        .split(/\r?\n/)
        .map(line => normalizeFormFieldText(line))
        .filter(Boolean)
        .join("\n");
}

function getFormTemplateLineValue(value) {
    const normalized =
        normalizeFormFieldText(value);

    if (!normalized) {
        return "";
    }

    // A Form field normally ends in ':'. Keep it exactly once.
    return normalized.endsWith(":")
        ? normalized
        : `${normalized}:`;
}

function getFormContentLines() {
    const textarea =
        document.getElementById(
            "formContent"
        );

    if (!textarea) {
        return [];
    }

    return textarea.value
        .split(/\r?\n/)
        .map(line => normalizeFormFieldText(line))
        .filter(Boolean);
}

function formContentContainsField(
    contentLine,
    fieldLine
) {
    const content =
        normalizeFormFieldText(contentLine);

    const field =
        getFormTemplateLineValue(fieldLine);

    if (!content || !field) {
        return false;
    }

    return (
        content === field ||
        content.startsWith(`${field} `)
    );
}

function appendFormField(field) {
    const textarea =
        document.getElementById(
            "formContent"
        );

    if (!textarea || !field) {
        return;
    }

    const value =
        typeof field === "string"
            ? field
            : field.label;

    const label =
        getFormTemplateLineValue(value);

    if (!label) {
        return;
    }

    const formField =
        `- ${label}`;

    const current =
        textarea.value.trim();

    textarea.value =
        current
            ? `${current}\n${formField}`
            : formField;

    textarea.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );

    markAutosaveDirty();
    syncFormTemplateFieldCards();
    textarea.focus();
}

function setFormTemplateCardUsed(
    card,
    used
) {
    if (!card) {
        return;
    }

    const marker =
        card.querySelector(
            ".troubleshooting-template-check"
        );

    const useButton =
        card.querySelector(
            ".troubleshooting-template-use"
        );

    card.classList.toggle(
        "is-used",
        used
    );

    if (marker) {
        marker.textContent =
            used ? "✓" : "";
    }

    if (useButton) {
        useButton.textContent =
            used ? "Used" : "Use";
        useButton.disabled = used;
    }
}

function syncFormTemplateFieldCards() {
    const container =
        document.getElementById(
            "formTemplateFields"
        );

    if (!container) {
        return;
    }

    const contentLines =
        getFormContentLines();

    container
        .querySelectorAll(
            ".troubleshooting-template-step"
        )
        .forEach(card => {
            const line =
                card.dataset.formLine || "";

            const matchIndex =
                contentLines.findIndex(
                    contentLine =>
                        formContentContainsField(
                            contentLine,
                            line
                        )
                );

            if (matchIndex >= 0) {
                contentLines.splice(
                    matchIndex,
                    1
                );
            }

            setFormTemplateCardUsed(
                card,
                matchIndex >= 0
            );
        });
}

function renderFormTemplateFields(
    fields = []
) {

    const container =
        ensureFormTemplateFieldsContainer();

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!fields || fields.length === 0) {
        const empty =
            document.createElement("div");

        empty.className =
            "troubleshooting-template-empty";

        empty.textContent =
            "Select a form template to see its fields.";

        container.appendChild(empty);
        return;
    }

    const lines = fields
        .map(field =>
            typeof field === "string"
                ? normalizeFormFieldText(field)
                : normalizeFormFieldText(field?.label)
        )
        .filter(Boolean);

    if (lines.length === 0) {
        return;
    }

    lines.forEach(line => {
        const formLine =
            getFormTemplateLineValue(line);

        if (!formLine) {
            return;
        }

        const card =
            document.createElement("div");

        card.className =
            "troubleshooting-template-step";

        card.dataset.formLine =
            formLine;

        const marker =
            document.createElement("span");

        marker.className =
            "troubleshooting-template-check";

        const text =
            document.createElement("div");

        text.className =
            "troubleshooting-template-step-text";

        text.textContent =
            formLine.replace(/\s*:\s*$/, ":");

        const useButton =
            document.createElement("button");

        useButton.type = "button";
        useButton.className =
            "troubleshooting-template-use";
        useButton.textContent = "Use";

        useButton.addEventListener(
            "click",
            () => {
                appendFormField(line);
            }
        );

        card.appendChild(marker);
        card.appendChild(text);
        card.appendChild(useButton);

        container.appendChild(card);
    });

    syncFormTemplateFieldCards();
}

function refreshFormTemplateFields() {

    const formSelect =
        document.getElementById(
            "form"
        );


    if (!formSelect) {
        return;
    }


    loadFormPreview(
        formSelect.value
    );
}


function setupFormTemplateFieldsSync() {
    const formContent =
        document.getElementById(
            "formContent"
        );

    if (!formContent) {
        return;
    }

    formContent.addEventListener(
        "input",
        syncFormTemplateFieldCards
    );

    syncFormTemplateFieldCards();
}

// ============================================================

// COPY FORM PREVIEW

// ============================================================



async function copyFormPreview() {

    const formSelect =
        document.getElementById("form");

    if (!formSelect || !formSelect.value) {
        return;
    }

    const form =
        forms.find(
            item => item.id === Number(formSelect.value)
        );

    if (!form) {
        return;
    }

    let lines = [];

    try {
        const fields = await getFormFields(formSelect.value);

        if (fields && fields.length > 0) {
            lines = fields
                .map(field => normalizeFormFieldText(field?.label))
                .filter(Boolean);
        }
    } catch (error) {
        console.error("Error loading Form fields for copy:", error);
    }

    if (lines.length === 0) {
        lines = getFormDescriptionLines(form.description);
    }

    if (lines.length === 0) {
        return;
    }

    const content = lines
        .map(line => `- ${getFormTemplateLineValue(line)}`)
        .join("\n");

    try {
        await navigator.clipboard.writeText(content);
        showSuccessMessage("Form copied to clipboard.");
    } catch (error) {
        console.error("Error copying form:", error);
    }
}


// ============================================================

// COPY TICKET PREVIEW

// ============================================================



async function copyTicketPreview() {



    const preview =

        document.getElementById(

            "ticketPreview"

        );



    const text =

        preview.textContent.trim();



    if (!text || text === "-") {

        return;

    }



    try {



        await navigator.clipboard.writeText(

            text

        );



        showSuccessMessage("Ticket copied to clipboard.");



    } catch (error) {



        console.error(

            "Error copying ticket:",

            error

        );

    }

}





// ============================================================

// COPY TIME ENTRY PREVIEW

// ============================================================



async function copyTimeEntryPreview() {



    const preview =

        document.getElementById(

            "timeEntryPreview"

        );



    const text =

        preview.textContent.trim();



    if (!text || text === "-") {

        return;

    }



    try {



        await navigator.clipboard.writeText(

            text

        );



        showSuccessMessage("Time Entry copied to clipboard.");



    } catch (error) {



        console.error(

            "Error copying time entry:",

            error

        );

    }

}





// ============================================================

// COPY TEMPLATE

// ============================================================



async function copyTemplatePreview() {
    const lines =
        getSelectedTroubleshootingTemplateLines();

    if (lines.length === 0) {
        return;
    }

    try {
        const text =
            lines
                .map(
                    line =>
                        `- ${normalizeTroubleshootingStep(line)}`
                )
                .join("\n");

        await navigator.clipboard.writeText(
            text
        );

        showSuccessMessage(
            "Template copied to clipboard."
        );

    } catch (error) {
        console.error(
            "Error copying template:",
            error
        );
    }
}

// ============================================================

// LOAD USED KNOWLEDGE BASE

// ============================================================



async function loadUsedKnowledgeBase() {



    try {



        const knowledgeBaseItems =

            await getTicketKnowledgeBase(

                ticketId

            );





        usedKnowledgeBase =

            knowledgeBaseItems ?? [];





        renderUsedKnowledgeBase();





    } catch (error) {



        console.error(

            "Error loading Used Knowledge Base:",

            error

        );





        usedKnowledgeBase = [];



        renderUsedKnowledgeBase();

    }

}





// ============================================================

// USED KNOWLEDGE BASE

// ============================================================



async function useCurrentTemplate() {



    const templateSelect =

        document.getElementById(

            "troubleshootingTemplate"

        );





    const templateId =

        templateSelect.value

            ? Number(

                templateSelect.value

            )

            : null;





    if (!templateId) {



        showWarningMessage("Please select a troubleshooting template first.");



        return;

    }





    try {



        const knowledgeBase =

            await getTroubleshootingTemplateKnowledgeBase(

                templateId

            );





        if (

            !knowledgeBase ||

            knowledgeBase.length === 0

        ) {



            showInfoMessage("This template has no associated Knowledge Base articles.");



            return;

        }





        for (

            const kb of knowledgeBase

        ) {



            const alreadyExists =

                usedKnowledgeBase.some(

                    existingKb =>

                        existingKb.id ===

                        kb.id

                );





            if (

                !alreadyExists

            ) {



                await addTicketKnowledgeBase(

                    ticketId,

                    kb.id

                );



                usedKnowledgeBase.push(

                    kb

                );

            }

        }





        renderUsedKnowledgeBase();

        // Refresh recommended KBs so articles added by the template
        // are immediately marked as Used in their individual sections.
        await refreshKnowledgeBaseSuggestions();} catch (error) {



        console.error(

            "Error adding template KBs:",

            error

        );





        showErrorMessage("Error adding Knowledge Base articles.");

    }

}





// ============================================================


// ============================================================
// DYNAMIC KNOWLEDGE BASE
// ============================================================

function renderRelatedKnowledgeBase(
    container,
    knowledgeBase
) {
    if (
        !knowledgeBase ||
        knowledgeBase.length === 0
    ) {
        container.innerHTML =
            "<p>No Knowledge Base articles associated.</p>";
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "kb-related-list";

    knowledgeBase.forEach(kb => {
        const item =
            document.createElement("div");

        item.className =
            "kb-related-item";

        const info =
            document.createElement("div");

        info.className =
            "kb-related-info";

        const title =
            document.createElement("div");

        title.className =
            "kb-related-title";

        title.textContent =
            `${kb.article_number} - ${kb.title}`;

        info.appendChild(title);

        const used =
            usedKnowledgeBase.some(
                existingKb =>
                    existingKb.id === kb.id
            );

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "troubleshooting-template-use";

        if (used) {
            button.textContent = "Used";
            button.disabled = true;
        } else {
            button.textContent = "Use";
            button.addEventListener(
                "click",
                () => useKnowledgeBaseArticle(kb)
            );
        }

        item.appendChild(info);
        item.appendChild(button);
        wrapper.appendChild(item);
    });

    container.appendChild(wrapper);
}

async function useKnowledgeBaseArticle(kb) {
    if (!kb || !kb.id) {
        return;
    }

    const alreadyUsed =
        usedKnowledgeBase.some(
            existingKb =>
                existingKb.id === kb.id
        );

    if (alreadyUsed) {
        return;
    }

    try {
        await addTicketKnowledgeBase(
            ticketId,
            kb.id
        );

        usedKnowledgeBase.push(kb);

        renderUsedKnowledgeBase();

        await refreshKnowledgeBaseSuggestions();

        showDetailNotification(
            `Knowledge Base "${kb.title}" added.`,
            "success"
        );

    } catch (error) {
        console.error(
            "Error adding Knowledge Base:",
            error
        );

        showErrorMessage(
            "Error adding Knowledge Base article."
        );
    }
}

async function refreshKnowledgeBaseSuggestions() {
    const toolSelect =
        document.getElementById("tool");

    const issueTypeSelect =
        document.getElementById("issueType");

    const templateSelect =
        document.getElementById(
            "troubleshootingTemplate"
        );

    await Promise.all([
        loadToolKnowledgeBase(
            toolSelect?.value
                ? Number(toolSelect.value)
                : null
        ),
        loadIssueTypeKnowledgeBase(
            issueTypeSelect?.value
                ? Number(issueTypeSelect.value)
                : null
        ),
        loadTemplateKnowledgeBase(
            templateSelect?.value
                ? Number(templateSelect.value)
                : null
        )
    ]);
}

// RENDER USED KNOWLEDGE BASE

// ============================================================



function renderUsedKnowledgeBase() {



    const container =

        document.getElementById(

            "usedKnowledgeBase"

        );





    container.innerHTML = "";





    if (

        usedKnowledgeBase.length === 0

    ) {



        container.innerHTML =

            "\<p>No Knowledge Base articles selected.\</p>";



        return;

    }





    usedKnowledgeBase.forEach(

        kb => {



            const item =

                document.createElement(

                    "div"

                );





            item.innerHTML = `

                \<span>

                    ${kb.article_number} - ${kb.title}

                \</span>



                \<button

                    type="button"

                    onclick="removeUsedKnowledgeBase(${kb.id})"

                >

                    Remove

                \</button>

            `;





            container.appendChild(

                item

            );

        }

    );

}





// ============================================================

// REMOVE USED KNOWLEDGE BASE

// ============================================================



async function removeUsedKnowledgeBase(

    knowledgeBaseId

) {



    try {



        await removeTicketKnowledgeBase(

            ticketId,

            knowledgeBaseId

        );





        usedKnowledgeBase =

            usedKnowledgeBase.filter(

                kb =>

                    kb.id !==

                    knowledgeBaseId

            );





        renderUsedKnowledgeBase();


        // Refresh all recommended KB sections so the removed article
        // immediately becomes available again in Tool, Issue Type,
        // and Troubleshooting Template.
        await refreshKnowledgeBaseSuggestions();





    } catch (error) {



        console.error(

            "Error removing Knowledge Base:",

            error

        );





        showErrorMessage("Error removing Knowledge Base article.");

    }

}





// ============================================================

// TEMPLATE NOT USED

// ============================================================



function doNotUseTemplate() {



    // Intentionally does nothing.



    // Selecting a template is only for visualization.

    // KBs are added only when the user explicitly clicks Yes.

}



// ============================================================

// TITLE SUGGESTION

// ============================================================



// ============================================================

// TITLE SUGGESTION

// ============================================================



function updateTitleSuggestion() {



    const locationSelect =

        document.getElementById("location");



    const toolSelect =

        document.getElementById("tool");



    const shortIssueInput =

        document.getElementById("shortIssue");



    const suggestion =

        document.getElementById("titleSuggestion");





    // LOCATION CODE

    const selectedLocation =

        locationSelect.options[

            locationSelect.selectedIndex

        ];



    const locationCode =

        selectedLocation?.dataset.code ?? "";





    // TOOL NAME

    const selectedTool =

        toolSelect.options[

            toolSelect.selectedIndex

        ];

    const toolName =
        selectedTool?.value
            ? selectedTool.textContent.trim()
            : "";





    // SHORT ISSUE

    const shortIssue =

        shortIssueInput.value.trim();





    const parts = [

        locationCode.trim(),

        toolName.trim(),

        shortIssue

    ].filter(

        part => part !== ""

    );





    suggestion.textContent =

        parts.length > 0

            ? parts.join(" - ")

            : "-";

}

// ============================================================

// SETUP EVENT LISTENERS

// ============================================================




function setupGenericSearchDropdowns() {

    const configs = [

        {
            id: "location",
            label: "Location",
            create: async (name, description, extraData = {}) =>
                createLocation({
                    name,
                    city: extraData.city || "",
                    state: extraData.state || "",
                    code: extraData.code || name,
                    is_active: true,
                    warehouse_management_system_id: null
                })
        },

        {
            id: "queue",
            label: "Queue",
            create: async (name, description) =>
                createQueue({
                    name,
                    description: description || "Created from Ticket Creator",
                    is_active: true
                })
        },

        {
            id: "issueType",
            label: "Issue Type",
            create: async (name, description) =>
                createIssueType({
                    name,
                    description: description || "Created from Ticket Creator",
                    category: "General",
                    is_active: true
                })
        },

        {
            id: "troubleshootingTemplate",
            label: "Troubleshooting Template",
            create: async (name, description) =>
                createTroubleshootingTemplate({
                    name,
                    steps: "",
                    generated_description: description || "Created from Ticket Creator",
                    is_active: true
                })
        },

        {
            id: "form",
            label: "Form",
            create: async (name, description) =>
                createForm({
                    name,
                    description: description || "Created from Ticket Creator",
                    is_active: true
                })
        }
    ];

    configs.forEach(config => {

        const select = document.getElementById(config.id);

        if (!select || select.dataset.genericSearchReady === "true") {
            return;
        }

        select.dataset.genericSearchReady = "true";

        setupGenericSearchDropdown(select, config);
    });
}

function setupGenericSearchDropdown(select, config) {

    const existingWrapper = select.closest(".catalog-search-dropdown");

    if (existingWrapper) {
        existingWrapper.parentNode.insertBefore(select, existingWrapper);
        existingWrapper.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "catalog-search-dropdown";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "catalog-search-input";
    input.autocomplete = "off";
    input.placeholder = `Search or select ${config.label.toLowerCase()}...`;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");

    const dropdown = document.createElement("div");
    dropdown.className = "catalog-search-options";
    dropdown.setAttribute("role", "listbox");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(select);
    select.style.display = "none";

    let highlightedIndex = -1;
    let visibleOptions = [];

    function selectedName() {
        const option = select.options[select.selectedIndex];
        return option && option.value ? option.textContent.trim() : "";
    }

    function syncInput() {
        input.value = selectedName();
    }

    function closeDropdown() {
        dropdown.classList.remove("catalog-search-options-visible");
        input.setAttribute("aria-expanded", "false");
        highlightedIndex = -1;
    }

    function getOptions() {
        return Array.from(select.options)
            .filter(option => option.value && option.textContent.trim());
    }

    function selectValue(value) {
        select.value = String(value);
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncInput();
        closeDropdown();
        markAutosaveDirty();
    }

    function renderOptions(searchValue = "") {

        const query = searchValue.trim().toLowerCase();

        dropdown.innerHTML = "";
        visibleOptions = [];
        highlightedIndex = -1;

        // Search ALL options. Related/All is presentation only.
        const allOptions = getOptions();

        const options = allOptions.filter(option =>
            !query || option.textContent.trim().toLowerCase().includes(query)
        );

        let currentGroup = null;

        options.forEach(option => {
            const parent = option.parentElement;
            const groupLabel =
                parent && parent.tagName === "OPTGROUP"
                    ? parent.label
                    : "";

            if (groupLabel !== currentGroup) {
                currentGroup = groupLabel;

                if (groupLabel) {
                    const groupHeader = document.createElement("div");
                    groupHeader.className = "catalog-search-group-label";
                    groupHeader.textContent = groupLabel;
                    dropdown.appendChild(groupHeader);
                }
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "catalog-search-option";
            button.setAttribute("role", "option");
            button.textContent = option.textContent.trim();
            button.dataset.value = option.value;

            button.addEventListener("mousedown", event => event.preventDefault());
            button.addEventListener("click", () => selectValue(option.value));

            dropdown.appendChild(button);
            visibleOptions.push(button);
        });

        const exactMatch = allOptions.some(option =>
            option.textContent.trim().toLowerCase() === query
        );

        if (query && !exactMatch) {
            const addOption = document.createElement("button");
            addOption.type = "button";
            addOption.className = "catalog-search-option catalog-search-add";
            addOption.innerHTML =
                `<span class="catalog-search-add-icon">+</span>` +
                `<span>Add "${escapeNotificationHtml(searchValue.trim())}"</span>`;

            addOption.addEventListener("mousedown", event => event.preventDefault());
            addOption.addEventListener("click", async () => {
                await openCatalogCreateModal(
                    config,
                    searchValue.trim(),
                    async result => {
                        await refreshGenericDropdown(
                            select,
                            input,
                            dropdown,
                            result
                        );
                    }
                );
            });

            dropdown.appendChild(addOption);
            visibleOptions.push(addOption);
        }

        if (visibleOptions.length === 0) {
            const empty = document.createElement("div");
            empty.className = "catalog-search-empty";
            empty.textContent = `No ${config.label.toLowerCase()}s found.`;
            dropdown.appendChild(empty);
        }
    }

    function openDropdown() {
        renderOptions(input.value);
        dropdown.classList.add("catalog-search-options-visible");
        input.setAttribute("aria-expanded", "true");
    }

    async function handleKeyboard(event) {

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!dropdown.classList.contains("catalog-search-options-visible")) {
                openDropdown();
            }

            if (!visibleOptions.length) return;

            highlightedIndex = event.key === "ArrowDown"
                ? Math.min(highlightedIndex + 1, visibleOptions.length - 1)
                : highlightedIndex <= 0
                    ? visibleOptions.length - 1
                    : highlightedIndex - 1;

            visibleOptions.forEach((option, index) => {
                option.classList.toggle(
                    "catalog-search-option-highlighted",
                    index === highlightedIndex
                );
            });

            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (highlightedIndex >= 0 && visibleOptions[highlightedIndex]) {
                visibleOptions[highlightedIndex].click();
                return;
            }

            const value = input.value.trim();

            if (!value) {
                selectValue("");
                return;
            }

            const exact = getOptions().find(option =>
                option.textContent.trim().toLowerCase() === value.toLowerCase()
            );

            if (exact) {
                selectValue(exact.value);
                return;
            }

            await openCatalogCreateModal(
                config,
                value,
                async result => {
                    await refreshGenericDropdown(
                        select,
                        input,
                        dropdown,
                        result
                    );
                }
            );
        }

        if (event.key === "Escape") {
            syncInput();
            closeDropdown();
        }
    }

    input.addEventListener("focus", openDropdown);
    input.addEventListener("input", openDropdown);
    input.addEventListener("keydown", handleKeyboard);

    input.addEventListener("blur", () => {
        setTimeout(() => {
            closeDropdown();
            syncInput();
        }, 150);
    });

    select.addEventListener("change", syncInput);

    syncInput();
}

async function createTroubleshootingTemplateInline(
    config,
    name,
    select,
    input,
    dropdown
) {

    const cleanName = name.trim();

    if (!cleanName) {
        return;
    }

    try {

        const created = await config.create(
            cleanName,
            "Created from Ticket Creator"
        );

        if (!created) {
            return;
        }

        await refreshGenericDropdown(
            select,
            input,
            dropdown,
            created
        );

        // A newly created template starts without troubleshooting steps.
        // Unlock the existing ticket field so the user can enter the steps
        // directly in Ticket Detail. No modal is required.
        newlyCreatedTroubleshootingTemplateId = created.id;

        const troubleshootingSteps =
            document.getElementById("troubleshootingSteps");

        if (troubleshootingSteps) {
            troubleshootingSteps.readOnly = false;
            troubleshootingSteps.value = "";
            troubleshootingSteps.value = "";
            troubleshootingSteps.focus();
            markAutosaveDirty();
        }

        showDetailNotification(
            `Troubleshooting Template "${cleanName}" created. Add the troubleshooting steps below.`,
            "success"
        );

        return created;

    } catch (error) {

        console.error(
            "Error creating Troubleshooting Template:",
            error
        );

        showDetailNotification(
            "Error creating Troubleshooting Template.",
            "error"
        );
    }
}


async function refreshGenericDropdown(select, input, dropdown, createdItem) {

    if (!createdItem) return;

    const option = document.createElement("option");
    option.value = String(createdItem.id);
    option.textContent = createdItem.name;

    select.appendChild(option);
    select.value = String(createdItem.id);
    select.dispatchEvent(new Event("change", { bubbles: true }));

    input.value = createdItem.name;
    dropdown.classList.remove("catalog-search-options-visible");

    markAutosaveDirty();

    showDetailNotification(
        `${createdItem.name} created successfully.`,
        "success"
    );
}

function openCatalogCreateModal(config, initialName, onCreated) {

    return new Promise(resolve => {

        const overlay = document.createElement("div");
        overlay.className = "catalog-create-overlay";

        const modal = document.createElement("div");
        modal.className = "catalog-create-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");

        const isLocation = config.id === "location";
        const isTroubleshooting = config.id === "troubleshootingTemplate";

        modal.innerHTML = `
            <div class="catalog-create-header">
                <div>
                    <div class="catalog-create-eyebrow">Quick Create</div>
                    <h3>Add ${escapeNotificationHtml(config.label)}</h3>
                </div>

                <button
                    type="button"
                    class="catalog-create-close"
                    aria-label="Close"
                >×</button>
            </div>

            <div class="catalog-create-body">

                <label>Name</label>
                <input
                    type="text"
                    class="catalog-create-name"
                    value="${escapeNotificationHtml(initialName)}"
                    autocomplete="off"
                >

                ${isLocation ? `
                    <label>City</label>
                    <input
                        type="text"
                        class="catalog-create-city"
                        autocomplete="off"
                    >

                    <label>State</label>
                    <input
                        type="text"
                        class="catalog-create-state"
                        autocomplete="off"
                    >

                    <label>Code</label>
                    <input
                        type="text"
                        class="catalog-create-code"
                        autocomplete="off"
                    >
                ` : `
                    <label>Description</label>
                    <textarea
                        class="catalog-create-description"
                        rows="3"
                        placeholder="Optional description"
                    ></textarea>

                `}

            </div>

            <div class="catalog-create-actions">

                <button
                    type="button"
                    class="button button-secondary catalog-create-cancel"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="button button-primary catalog-create-submit"
                >
                    Add ${escapeNotificationHtml(config.label)}
                </button>

            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const nameInput = modal.querySelector(".catalog-create-name");
        const descriptionInput = modal.querySelector(".catalog-create-description");
        const cityInput = modal.querySelector(".catalog-create-city");
        const stateInput = modal.querySelector(".catalog-create-state");
        const codeInput = modal.querySelector(".catalog-create-code");

        const closeButton = modal.querySelector(".catalog-create-close");
        const cancelButton = modal.querySelector(".catalog-create-cancel");
        const submitButton = modal.querySelector(".catalog-create-submit");

        const close = () => {
            overlay.remove();
            resolve(null);
        };

        closeButton.addEventListener("click", close);
        cancelButton.addEventListener("click", close);

        overlay.addEventListener("mousedown", event => {
            if (event.target === overlay) {
                close();
            }
        });

        const submit = async () => {

            const name = nameInput.value.trim();

            if (!name) {
                nameInput.focus();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Adding…";

            try {

                let created;

                if (isLocation) {

                    created = await config.create(
                        name,
                        "",
                        {
                            city: cityInput.value.trim(),
                            state: stateInput.value.trim(),
                            code: codeInput.value.trim()
                        }
                    );

                } else {

                    created = await config.create(
                        name,
                        descriptionInput
                            ? descriptionInput.value.trim()
                            : "",
                        {}
                    );
                }

                overlay.remove();

                await onCreated(created);

                resolve(created);

            } catch (error) {

                console.error(
                    `Error creating ${config.label}:`,
                    error
                );

                showDetailNotification(
                    `Error creating ${config.label}. Please check the required fields.`,
                    "error"
                );

                submitButton.disabled = false;
                submitButton.textContent =
                    `Add ${config.label}`;
            }
        };

        submitButton.addEventListener("click", submit);

        nameInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                event.preventDefault();
                submit();
            }

            if (event.key === "Escape") {
                close();
            }
        });

        setTimeout(() => {
            nameInput.focus();
            nameInput.select();
        }, 0);
    });
}


function setupSaveFormTemplateButton() {

    const formContent =
        document.getElementById("formContent");

    if (!formContent) {
        return;
    }

    const existingButton =
        document.getElementById("saveFormTemplateButton");

    if (existingButton) {
        return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.id = "saveFormTemplateButton";
    button.className = "button button-secondary";
    button.textContent = "Save as a template?";
    button.style.marginTop = "10px";
    button.style.transition = "opacity 0.15s ease";

    formContent.insertAdjacentElement("afterend", button);

    // The current form content is the saved baseline. The button only
    // becomes available when the user changes the content.
    let originalContent =
        normalizeFormTemplateContent(
            formContent.value
        );

    const updateButtonState = () => {
        const currentContent =
            normalizeFormTemplateContent(
                formContent.value
            );

        const hasChanges =
            currentContent !== originalContent;

        button.disabled = !hasChanges;
        button.style.opacity = button.disabled ? "0.5" : "1";
        button.style.cursor = button.disabled
            ? "not-allowed"
            : "pointer";
    };

    button.markSaved = () => {
        originalContent =
            normalizeFormTemplateContent(
                formContent.value
            );
        updateButtonState();
    };

    formContent.addEventListener(
        "input",
        updateButtonState
    );

    button.addEventListener(
        "click",
        () => {
            const content =
                normalizeFormTemplateContent(
                    formContent.value
                );

            if (!content) {
                return;
            }

            openSaveFormTemplateModal(content);
        }
    );

    updateButtonState();
}

function openSaveFormTemplateModal(content) {

    const overlay = document.createElement("div");
    overlay.className = "catalog-create-overlay";

    const modal = document.createElement("div");
    modal.className = "catalog-create-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
        <div class="catalog-create-header">
            <div>
                <div class="catalog-create-eyebrow">Save Template</div>
                <h3>Save as a Form Template</h3>
            </div>

            <button
                type="button"
                class="catalog-create-close"
                aria-label="Close"
            >×</button>
        </div>

        <div class="catalog-create-body">

            <label for="saveFormTemplateName">
                Template Name
            </label>

            <input
                type="text"
                id="saveFormTemplateName"
                class="catalog-create-name"
                autocomplete="off"
                placeholder="Enter template name"
            >

        </div>

        <div class="catalog-create-actions">

            <button
                type="button"
                class="button button-secondary catalog-create-cancel"
            >
                Cancel
            </button>

            <button
                type="button"
                class="button button-primary catalog-create-submit"
            >
                Save Template
            </button>

        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const nameInput =
        modal.querySelector("#saveFormTemplateName");

    const closeButton =
        modal.querySelector(".catalog-create-close");

    const cancelButton =
        modal.querySelector(".catalog-create-cancel");

    const submitButton =
        modal.querySelector(".catalog-create-submit");

    const close = () => {
        overlay.remove();
    };

    closeButton.addEventListener("click", close);
    cancelButton.addEventListener("click", close);

    overlay.addEventListener("mousedown", event => {
        if (event.target === overlay) {
            close();
        }
    });

    const submit = async () => {

        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Saving…";

        try {

            // The form content is stored as the Form description because
            // the current Form API exposes description as the template body.
            const created =
                await createForm({
                    name,
                    description: content,
                    is_active: true
                });

            if (!created) {
                throw new Error("Form was not created");
            }

            const issueTypeSelect =
                document.getElementById("issueType");

            const issueTypeId =
                issueTypeSelect?.value
                    ? Number(issueTypeSelect.value)
                    : null;

            const formSelect =
                document.getElementById("form");

            await loadForms(
                issueTypeId,
                created.id
            );

            if (formSelect) {
                formSelect.value = String(created.id);

                formSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
            }

            // Keep the form content in the ticket. The newly created form
            // now represents the saved baseline for the button.
            const saveAsTemplateButton =
                document.getElementById("saveFormTemplateButton");

            if (saveAsTemplateButton) {
                if (typeof saveAsTemplateButton.markSaved === "function") {
                    saveAsTemplateButton.markSaved();
                } else {
                    saveAsTemplateButton.disabled = true;
                    saveAsTemplateButton.style.opacity = "0.5";
                    saveAsTemplateButton.style.cursor = "not-allowed";
                }
            }

            overlay.remove();

            markAutosaveDirty();

            showDetailNotification(
                `Form Template "${name}" saved successfully.`,
                "success"
            );

        } catch (error) {

            console.error(
                "Error saving Form Template:",
                error
            );

            showDetailNotification(
                "Error saving Form Template.",
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Save Template";
        }
    };

    submitButton.addEventListener("click", submit);

    nameInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();
            submit();
        }

        if (event.key === "Escape") {
            close();
        }
    });

    setTimeout(() => {
        nameInput.focus();
    }, 0);
}


// ============================================================
// TROUBLESHOOTING LOG
// ============================================================


// ============================================================
// TROUBLESHOOTING TEMPLATE STEPS
// ============================================================

function getSelectedTroubleshootingTemplateLines() {
    const select =
        document.getElementById(
            "troubleshootingTemplate"
        );

    if (!select || !select.value) {
        return [];
    }

    const selectedTemplate =
        troubleshootingTemplates.find(
            template =>
                template.id ===
                Number(select.value)
        );

    if (!selectedTemplate) {
        return [];
    }

    return String(
        selectedTemplate.steps ??
        selectedTemplate.generated_description ??
        ""
    )
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function normalizeTroubleshootingStep(value) {
    return String(value ?? "")
        .replace(/^\s*-\s*/, "")
        .trim();
}

function getTroubleshootingStepCounts() {
    const textarea =
        document.getElementById(
            "troubleshootingSteps"
        );

    const counts = new Map();

    if (!textarea) {
        return counts;
    }

    textarea.value
        .split(/\r?\n/)
        .map(normalizeTroubleshootingStep)
        .filter(Boolean)
        .forEach(step => {
            counts.set(
                step,
                (counts.get(step) || 0) + 1
            );
        });

    return counts;
}

function syncTroubleshootingTemplateStepCards() {
    const container =
        document.getElementById(
            "troubleshootingTemplateSteps"
        );

    if (!container) {
        return;
    }

    const counts =
        getTroubleshootingStepCounts();

    container
        .querySelectorAll(
            ".troubleshooting-template-step"
        )
        .forEach(card => {
            const step =
                card.dataset.troubleshootingStep || "";

            const remaining =
                counts.get(step) || 0;

            if (remaining > 0) {
                counts.set(
                    step,
                    remaining - 1
                );
            }

            const used =
                remaining > 0;

            const marker =
                card.querySelector(
                    ".troubleshooting-template-check"
                );

            const useButton =
                card.querySelector(
                    ".troubleshooting-template-use"
                );

            card.classList.toggle(
                "is-used",
                used
            );

            if (marker) {
                marker.textContent =
                    used ? "✓" : "";
            }

            if (useButton) {
                useButton.textContent =
                    used ? "Used" : "Use";
                useButton.disabled = used;
            }
        });
}

function appendTroubleshootingStep(step) {
    const textarea =
        document.getElementById(
            "troubleshootingSteps"
        );

    if (!textarea || !step) {
        return;
    }

    const current =
        textarea.value.trim();

    const troubleshootingStep =
        `- ${step}`;

    textarea.value =
        current
            ? `${current}\n${troubleshootingStep}`
            : troubleshootingStep;

    textarea.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );

    markAutosaveDirty();
    syncTroubleshootingTemplateStepCards();
    textarea.focus();
}

function renderTroubleshootingTemplateSteps() {
    const container =
        document.getElementById(
            "troubleshootingTemplateSteps"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const steps =
        getSelectedTroubleshootingTemplateLines();

    if (steps.length === 0) {
        const empty =
            document.createElement("div");

        empty.className =
            "troubleshooting-template-empty";

        empty.textContent =
            "Select a troubleshooting template to see its steps.";

        container.appendChild(empty);
        return;
    }

    steps.forEach(step => {
        const card =
            document.createElement("div");

        card.className =
            "troubleshooting-template-step";

        const marker =
            document.createElement("span");

        marker.className =
            "troubleshooting-template-check";

        marker.textContent = "";

        const text =
            document.createElement("div");

        text.className =
            "troubleshooting-template-step-text";

        const displayStep =
            normalizeTroubleshootingStep(step);

        card.dataset.troubleshootingStep =
            displayStep;

        text.textContent = displayStep;

        const useButton =
            document.createElement("button");

        useButton.type = "button";
        useButton.className =
            "troubleshooting-template-use";

        useButton.textContent = "Use";

        useButton.addEventListener(
            "click",
            () => {
                appendTroubleshootingStep(step);

                useButton.textContent = "Used";
                useButton.disabled = true;

                marker.textContent = "✓";

                card.classList.add("is-used");
            }
        );

        card.appendChild(marker);
        card.appendChild(text);
        card.appendChild(useButton);

        container.appendChild(card);
    });
}


function setupTroubleshootingTemplateSteps() {
    const select =
        document.getElementById(
            "troubleshootingTemplate"
        );

    if (!select) {
        return;
    }

    select.addEventListener(
        "change",
        () => {
            renderTroubleshootingTemplateSteps();
        }
    );

    const textarea =
        document.getElementById(
            "troubleshootingSteps"
        );

    if (textarea) {
        textarea.addEventListener(
            "input",
            syncTroubleshootingTemplateStepCards
        );
    }

    renderTroubleshootingTemplateSteps();
}

function setupSaveTroubleshootingTemplateButton() {

    const troubleshootingSteps =
        document.getElementById("troubleshootingSteps");

    if (!troubleshootingSteps) {
        return;
    }

    const existingButton =
        document.getElementById("saveTroubleshootingTemplateButton");

    if (existingButton) {
        return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.id = "saveTroubleshootingTemplateButton";
    button.className = "button button-secondary";
    button.textContent = "Save as a template?";
    button.style.marginTop = "10px";
    button.style.transition = "opacity 0.15s ease";

    const troubleshootingEntry =
        document.querySelector(
            ".troubleshooting-entry"
        );

    if (troubleshootingEntry) {
        troubleshootingEntry.insertAdjacentElement(
            "afterend",
            button
        );
    } else {
        troubleshootingSteps.insertAdjacentElement(
            "afterend",
            button
        );
    }

    // Keep the value that existed when the button was initialized.
    // The button is only enabled when the user actually changes the
    // troubleshooting steps from that original value.
    let originalSteps = troubleshootingSteps.value;

    const updateButtonState = () => {
        const currentSteps = troubleshootingSteps.value;
        const hasChanges = currentSteps !== originalSteps;

        button.disabled = !hasChanges;

        // Make the disabled state visually obvious.
        button.style.opacity = button.disabled ? "0.5" : "1";
        button.style.cursor = button.disabled
            ? "not-allowed"
            : "pointer";
    };

    // Called after a template has been successfully saved. The current
    // steps are now the new saved state, so there are no pending changes.
    button.markSaved = () => {
        originalSteps = troubleshootingSteps.value;
        updateButtonState();
    };

    troubleshootingSteps.addEventListener(
        "input",
        updateButtonState
    );

    button.addEventListener(
        "click",
        () => {
            const steps = troubleshootingSteps.value
                .trim()
                .split(/\r?\n/)
                .map(line => line.replace(/^\s*-\s*/, ""))
                .join("\n");

            if (!steps) {
                return;
            }

            openSaveTroubleshootingTemplateModal(steps);
        }
    );

    updateButtonState();
}

function openSaveTroubleshootingTemplateModal(steps) {

    const overlay = document.createElement("div");
    overlay.className = "catalog-create-overlay";

    const modal = document.createElement("div");
    modal.className = "catalog-create-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
        <div class="catalog-create-header">
            <div>
                <div class="catalog-create-eyebrow">Save Template</div>
                <h3>Save as a Troubleshooting Template</h3>
            </div>

            <button
                type="button"
                class="catalog-create-close"
                aria-label="Close"
            >×</button>
        </div>

        <div class="catalog-create-body">

            <label for="saveTroubleshootingTemplateName">
                Template Name
            </label>

            <input
                type="text"
                id="saveTroubleshootingTemplateName"
                class="catalog-create-name"
                autocomplete="off"
                placeholder="Enter template name"
            >

        </div>

        <div class="catalog-create-actions">

            <button
                type="button"
                class="button button-secondary catalog-create-cancel"
            >
                Cancel
            </button>

            <button
                type="button"
                class="button button-primary catalog-create-submit"
            >
                Save Template
            </button>

        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const nameInput =
        modal.querySelector("#saveTroubleshootingTemplateName");

    const closeButton =
        modal.querySelector(".catalog-create-close");

    const cancelButton =
        modal.querySelector(".catalog-create-cancel");

    const submitButton =
        modal.querySelector(".catalog-create-submit");

    const close = () => {
        overlay.remove();
    };

    closeButton.addEventListener("click", close);
    cancelButton.addEventListener("click", close);

    overlay.addEventListener("mousedown", event => {
        if (event.target === overlay) {
            close();
        }
    });

    const submit = async () => {

        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Saving…";

        try {

            const created =
                await createTroubleshootingTemplate({
                    name,
                    steps,
                    generated_description: "Created from Ticket",
                    is_active: true
                });

            if (!created) {
                throw new Error("Template was not created");
            }

            // Refresh the normal Troubleshooting Template dropdown so
            // the new template appears in the regular Related/All lists.
            const issueTypeSelect =
                document.getElementById("issueType");

            const issueTypeId =
                issueTypeSelect?.value
                    ? Number(issueTypeSelect.value)
                    : null;

            const troubleshootingTemplateSelect =
                document.getElementById("troubleshootingTemplate");

            await loadTroubleshootingTemplates(
                issueTypeId,
                created.id
            );

            if (troubleshootingTemplateSelect) {
                troubleshootingTemplateSelect.value =
                    String(created.id);

                troubleshootingTemplateSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
            }

            overlay.remove();

            const saveAsTemplateButton =
                document.getElementById("saveTroubleshootingTemplateButton");

            if (saveAsTemplateButton) {
                if (typeof saveAsTemplateButton.markSaved === "function") {
                    saveAsTemplateButton.markSaved();
                } else {
                    saveAsTemplateButton.disabled = true;
                    saveAsTemplateButton.style.opacity = "0.5";
                    saveAsTemplateButton.style.cursor = "not-allowed";
                }
            }

            markAutosaveDirty();

            showDetailNotification(
                `Troubleshooting Template "${name}" saved successfully.`,
                "success"
            );

        } catch (error) {

            console.error(
                "Error saving Troubleshooting Template:",
                error
            );

            showDetailNotification(
                "Error saving Troubleshooting Template.",
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Save Template";
        }
    };

    submitButton.addEventListener("click", submit);

    nameInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();
            submit();
        }

        if (event.key === "Escape") {
            close();
        }
    });

    setTimeout(() => {
        nameInput.focus();
    }, 0);
}

// ============================================================
// QUICK NOTES
// ============================================================

let quickNotes = [];

async function loadQuickNotes() {
    const tbody = document.getElementById("quickNotesTableBody");
    if (!tbody || !ticketId) return;

    tbody.innerHTML = `<tr><td colspan="5" class="quick-note-empty">Loading notes…</td></tr>`;

    try {
        quickNotes = await getKnowledgeBaseNotesByTicket(ticketId);
        renderQuickNotesTable();
    } catch (error) {
        console.error("Error loading Quick Notes:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="quick-note-empty">Error loading notes.</td></tr>`;
    }
}

function renderQuickNotesTable() {
    const tbody = document.getElementById("quickNotesTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!quickNotes.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="quick-note-empty">No notes associated with this ticket.</td></tr>`;
        return;
    }

    quickNotes.forEach(note => {
        const row = document.createElement("tr");
        row.className = "quick-note-row";
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.innerHTML = `
            <td><div class="quick-note-title">${escapeNotificationHtml(note.title)}</div></td>
            <td><div class="quick-note-preview">${escapeNotificationHtml(note.content)}</div></td>
            <td><div class="quick-note-related">${renderNoteRelatedPills(note)}</div></td>
            <td><div class="quick-note-created">${note.created_at ? escapeNotificationHtml(new Date(note.created_at).toLocaleString()) : "-"}</div></td>
            <td class="quick-note-actions">
                <button
                    type="button"
                    class="quick-note-delete-button"
                    aria-label="Delete note"
                    title="Delete note"
                >
                    Delete
                </button>
            </td>
        `;

        const deleteButton = row.querySelector(".quick-note-delete-button");
        deleteButton.addEventListener("click", async event => {
            event.preventDefault();
            event.stopPropagation();

            openQuickNoteDeleteConfirmation(note, deleteButton);
        });

        const open = () => openQuickNoteView(note.id);
        row.addEventListener("click", open);
        row.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });
        tbody.appendChild(row);
    });
}

function renderNoteRelatedPills(note) {
    const related = [];
    (note.tools || []).forEach(tool => {
        related.push(`<span class="quick-note-pill">Tool: ${escapeNotificationHtml(tool.name)}</span>`);
    });
    (note.issue_types || []).forEach(issueType => {
        related.push(`<span class="quick-note-pill">Issue Type: ${escapeNotificationHtml(issueType.name)}</span>`);
    });
    return related.length ? related.join("") : "-";
}

function openQuickNoteDeleteConfirmation(note, deleteButton) {
    const overlay = createQuickNoteOverlay();
    const modal = document.createElement("div");
    modal.className = "catalog-create-modal quick-note-modal quick-note-delete-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <div class="catalog-create-header">
            <div>
                <div class="catalog-create-eyebrow">Delete Note</div>
                <h3>Delete Note?</h3>
            </div>
            <button type="button" class="catalog-create-close" aria-label="Close">×</button>
        </div>
        <div class="catalog-create-body">
            <p class="quick-note-delete-message">
                Are you sure you want to delete this note?
            </p>
        </div>
        <div class="catalog-create-actions">
            <button type="button" class="button button-secondary quick-note-delete-cancel">Cancel</button>
            <button type="button" class="button quick-note-delete-confirm">Delete</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => closeQuickNoteModal(overlay);
    modal.querySelector(".catalog-create-close").addEventListener("click", close);
    modal.querySelector(".quick-note-delete-cancel").addEventListener("click", close);

    modal.querySelector(".quick-note-delete-confirm").addEventListener("click", async () => {
        const confirmButton = modal.querySelector(".quick-note-delete-confirm");
        confirmButton.disabled = true;
        confirmButton.textContent = "Deleting…";
        deleteButton.disabled = true;

        try {
            await deleteKnowledgeBaseNote(note.id);
            quickNotes = quickNotes.filter(item => Number(item.id) !== Number(note.id));
            close();
            renderQuickNotesTable();
            showDetailNotification("Note deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting Quick Note:", error);
            confirmButton.disabled = false;
            confirmButton.textContent = "Delete";
            deleteButton.disabled = false;
            showDetailNotification(error.message || "Error deleting note.", "error");
        }
    });
}

let quickNoteDraft = null;

function createQuickNoteOverlay(onBackgroundClick = null) {
    const overlay = document.createElement("div");
    overlay.className = "catalog-create-overlay";
    overlay.addEventListener("mousedown", event => {
        if (event.target !== overlay) return;

        if (typeof onBackgroundClick === "function") {
            onBackgroundClick();
            return;
        }

        overlay.remove();
    });
    return overlay;
}

function closeQuickNoteModal(overlay) {
    if (overlay) overlay.remove();
}

function removeQuickNoteDraft() {
    quickNoteDraft = null;
    document.getElementById("quickNoteDraftTab")?.remove();
}

function renderQuickNoteDraftTab() {
    let tab = document.getElementById("quickNoteDraftTab");

    if (!quickNoteDraft) {
        tab?.remove();
        return;
    }

    if (!tab) {
        tab = document.createElement("button");
        tab.type = "button";
        tab.id = "quickNoteDraftTab";
        tab.className = "quick-note-draft-tab";
        document.body.appendChild(tab);
    }

    const title = quickNoteDraft.title.trim() || "Untitled note";
    tab.innerHTML = `
        <span class="quick-note-draft-label">Draft</span>
        <span class="quick-note-draft-title">${escapeNotificationHtml(title)}</span>
        <span class="quick-note-draft-close" aria-label="Discard draft">×</span>
    `;

    tab.onclick = event => {
        if (event.target.closest(".quick-note-draft-close")) {
            event.preventDefault();
            event.stopPropagation();
            removeQuickNoteDraft();
            return;
        }

        const draft = { ...quickNoteDraft };
        quickNoteDraft = null;
        tab.remove();
        openQuickNoteEditor(draft.noteId, draft);
    };
}

function minimizeQuickNoteEditor(overlay, noteId, isEdit, toolsField, issueTypesField) {
    const modal = overlay?.querySelector(".quick-note-modal");
    if (!modal) return;

    quickNoteDraft = {
        noteId: noteId || null,
        isEdit: Boolean(isEdit),
        title: modal.querySelector("#quickNoteTitle")?.value ?? "",
        content: modal.querySelector("#quickNoteContent")?.value ?? "",
        tools: toolsField?.getSelectedIds?.() ?? [],
        issueTypes: issueTypesField?.getSelectedIds?.() ?? []
    };

    overlay.remove();
    renderQuickNoteDraftTab();
}

async function getQuickNoteCatalogData() {
    const [tools, issueTypes] = await Promise.all([getTools(), getIssueTypes()]);
    return { tools, issueTypes };
}

function createQuickNoteMultiSelect({ label, items, selectedIds, createItem, itemType }) {
    const field = document.createElement("div");
    field.className = "quick-note-related-field";

    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    field.appendChild(labelElement);

    const wrapper = document.createElement("div");
    wrapper.className = "tool-search-dropdown quick-note-multi-dropdown";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "tool-search-input";
    input.autocomplete = "off";
    input.placeholder = `Search or select ${label.toLowerCase()}...`;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");

    const dropdown = document.createElement("div");
    dropdown.className = "tool-search-options";
    dropdown.setAttribute("role", "listbox");

    const selectedContainer = document.createElement("div");
    selectedContainer.className = "quick-note-selected";

    const hiddenSelect = document.createElement("select");
    hiddenSelect.multiple = true;
    hiddenSelect.style.display = "none";

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = item.name;
        option.selected = selectedIds.has(Number(item.id));
        hiddenSelect.appendChild(option);
    });

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(hiddenSelect);
    field.appendChild(wrapper);
    field.appendChild(selectedContainer);

    let currentItems = [...items];
    let highlightedIndex = -1;
    let visibleOptions = [];

    function selectedIdsNow() {
        return new Set(Array.from(hiddenSelect.selectedOptions).map(option => Number(option.value)));
    }

    function syncPills() {
        const selected = selectedIdsNow();
        selectedContainer.innerHTML = "";
        currentItems.filter(item => selected.has(Number(item.id))).forEach(item => {
            const pill = document.createElement("span");
            pill.className = "quick-note-selected-pill";
            pill.innerHTML = `${escapeNotificationHtml(item.name)} <button type="button" aria-label="Remove ${escapeNotificationHtml(item.name)}">×</button>`;
            pill.querySelector("button").addEventListener("click", () => setSelected(item.id, false));
            selectedContainer.appendChild(pill);
        });
    }

    function setSelected(id, selected) {
        const option = Array.from(hiddenSelect.options).find(item => String(item.value) === String(id));
        if (!option) return;
        option.selected = selected;
        syncPills();
        renderOptions(input.value);
    }

    function closeDropdown() {
        dropdown.classList.remove("tool-search-options-visible");
        input.setAttribute("aria-expanded", "false");
        highlightedIndex = -1;
    }

    function addCatalogItem(item) {
        if (!currentItems.some(existing => Number(existing.id) === Number(item.id))) {
            currentItems.push(item);
            const option = document.createElement("option");
            option.value = String(item.id);
            option.textContent = item.name;
            hiddenSelect.appendChild(option);
        }
        setSelected(item.id, true);
        input.value = "";
        closeDropdown();
    }

    async function createFromSearch(name) {
        const cleanName = String(name ?? "").trim();
        if (!cleanName) return;

        const existing = currentItems.find(item => String(item.name).trim().toLowerCase() === cleanName.toLowerCase());
        if (existing) {
            addCatalogItem(existing);
            return;
        }

        input.disabled = true;
        try {
            const created = await createItem(cleanName);
            if (!created) throw new Error(`Could not create ${itemType}.`);
            addCatalogItem(created);
            showSuccessMessage(`${itemType} "${created.name}" created successfully.`);
        } catch (error) {
            console.error(`Error creating ${itemType}:`, error);
            showErrorMessage(error.message || `Could not create the ${itemType.toLowerCase()}.`);
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    function renderOptions(searchValue = "") {
        const query = searchValue.trim().toLowerCase();
        dropdown.innerHTML = "";
        visibleOptions = [];
        highlightedIndex = -1;
        const selected = selectedIdsNow();

        currentItems.filter(item => !query || String(item.name).toLowerCase().includes(query)).forEach(item => {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "tool-search-option";
            option.setAttribute("role", "option");
            option.textContent = selected.has(Number(item.id)) ? `✓ ${item.name}` : item.name;
            option.addEventListener("mousedown", event => event.preventDefault());
            option.addEventListener("click", () => {
                setSelected(item.id, !selectedIdsNow().has(Number(item.id)));
                input.value = "";
                renderOptions("");
            });
            dropdown.appendChild(option);
            visibleOptions.push(option);
        });

        const exactMatch = currentItems.some(item => String(item.name).trim().toLowerCase() === query);
        if (query && !exactMatch) {
            const addOption = document.createElement("button");
            addOption.type = "button";
            addOption.className = "tool-search-option tool-search-add";
            addOption.setAttribute("role", "option");
            addOption.innerHTML = `<span class="tool-search-add-icon">+</span><span>Add "${escapeNotificationHtml(searchValue.trim())}"</span>`;
            addOption.addEventListener("mousedown", event => event.preventDefault());
            addOption.addEventListener("click", async () => createFromSearch(searchValue));
            dropdown.appendChild(addOption);
            visibleOptions.push(addOption);
        }

        if (!visibleOptions.length) {
            const empty = document.createElement("div");
            empty.className = "tool-search-empty";
            empty.textContent = `No ${label.toLowerCase()} found.`;
            dropdown.appendChild(empty);
        }
    }

    function openDropdown() {
        renderOptions(input.value);
        dropdown.classList.add("tool-search-options-visible");
        input.setAttribute("aria-expanded", "true");
    }

    function handleKeyboard(event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!dropdown.classList.contains("tool-search-options-visible")) openDropdown();
            if (!visibleOptions.length) return;
            highlightedIndex = event.key === "ArrowDown"
                ? Math.min(highlightedIndex + 1, visibleOptions.length - 1)
                : highlightedIndex <= 0 ? visibleOptions.length - 1 : highlightedIndex - 1;
            visibleOptions.forEach((option, index) => option.classList.toggle("tool-search-option-highlighted", index === highlightedIndex));
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (highlightedIndex >= 0 && visibleOptions[highlightedIndex]) {
                visibleOptions[highlightedIndex].click();
                return;
            }
            const typedName = input.value.trim();
            if (!typedName) return;
            const exact = currentItems.find(item => String(item.name).trim().toLowerCase() === typedName.toLowerCase());
            if (exact) addCatalogItem(exact);
            else createFromSearch(typedName);
            return;
        }

        if (event.key === "Escape") {
            input.value = "";
            closeDropdown();
        }
    }

    input.addEventListener("focus", openDropdown);
    input.addEventListener("input", openDropdown);
    input.addEventListener("keydown", handleKeyboard);
    input.addEventListener("blur", () => setTimeout(closeDropdown, 150));
    document.addEventListener("click", event => {
        if (!wrapper.contains(event.target)) closeDropdown();
    });

    syncPills();
    return { field, getSelectedIds: () => Array.from(selectedIdsNow()) };
}

async function saveQuickNoteRelations(noteId, relationEditor) {
    const desiredTools = new Set(relationEditor.tools.getSelectedIds().map(Number));
    const desiredIssueTypes = new Set(relationEditor.issueTypes.getSelectedIds().map(Number));
    const [currentTools, currentIssueTypes] = await Promise.all([
        getKnowledgeBaseNoteTools(noteId),
        getKnowledgeBaseNoteIssueTypes(noteId)
    ]);
    const currentToolIds = new Set(currentTools.map(item => Number(item.id)));
    const currentIssueTypeIds = new Set(currentIssueTypes.map(item => Number(item.id)));

    await Promise.all([
        ...[...desiredTools].filter(id => !currentToolIds.has(id)).map(id => addKnowledgeBaseNoteTool(noteId, id)),
        ...[...currentToolIds].filter(id => !desiredTools.has(id)).map(id => removeKnowledgeBaseNoteTool(noteId, id)),
        ...[...desiredIssueTypes].filter(id => !currentIssueTypeIds.has(id)).map(id => addKnowledgeBaseNoteIssueType(noteId, id)),
        ...[...currentIssueTypeIds].filter(id => !desiredIssueTypes.has(id)).map(id => removeKnowledgeBaseNoteIssueType(noteId, id))
    ]);
}

async function openQuickNoteEditor(noteId = null, draft = null) {
    const isEdit = Boolean(noteId);
    const note = isEdit ? await getKnowledgeBaseNote(noteId) : null;
    const { tools, issueTypes } = await getQuickNoteCatalogData();
    const draftTools = new Set((draft?.tools || []).map(Number));
    const draftIssueTypes = new Set((draft?.issueTypes || []).map(Number));
    const selectedTools = draft ? draftTools : new Set((note?.tools || []).map(item => Number(item.id)));
    const selectedIssueTypes = draft ? draftIssueTypes : new Set((note?.issue_types || []).map(item => Number(item.id)));
    const initialTitle = draft?.title ?? note?.title ?? "";
    const initialContent = draft?.content ?? note?.content ?? "";

    let backgroundCloseHandler = null;
    const overlay = createQuickNoteOverlay(() => {
        if (backgroundCloseHandler) backgroundCloseHandler();
    });
    const modal = document.createElement("div");
    modal.className = "catalog-create-modal quick-note-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <div class="catalog-create-header">
            <div><div class="catalog-create-eyebrow">${isEdit ? "Edit Note" : "Quick Note"}</div><h3>${isEdit ? "Edit Note" : "Add Note"}</h3></div>
            <button type="button" class="catalog-create-close" aria-label="Close">×</button>
        </div>
        <div class="catalog-create-body">
            <label for="quickNoteTitle">Title</label>
            <input type="text" id="quickNoteTitle" class="catalog-create-name" autocomplete="off" placeholder="Enter note title" value="${escapeNotificationHtml(initialTitle)}">
            <div class="quick-note-related-editor">
                <div id="quickNoteToolsField"></div>
                <div id="quickNoteIssueTypesField"></div>
            </div>
            <label for="quickNoteContent">Content</label>
            <textarea id="quickNoteContent" placeholder="Write the note content...">${escapeNotificationHtml(initialContent)}</textarea>
        </div>
        <div class="catalog-create-actions">
            <button type="button" class="button button-secondary quick-note-cancel">Cancel</button>
            <button type="button" class="button button-primary quick-note-save">${isEdit ? "Save Changes" : "Add Note"}</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const toolsField = createQuickNoteMultiSelect({
        label: "Tools",
        items: tools,
        selectedIds: selectedTools,
        itemType: "Tool",
        createItem: name => createTool({ name, description: "Created from Ticket Creator", is_active: true })
    });
    const issueTypesField = createQuickNoteMultiSelect({
        label: "Issue Types",
        items: issueTypes,
        selectedIds: selectedIssueTypes,
        itemType: "Issue Type",
        createItem: name => createIssueType({ name, description: "Created from Ticket Creator" })
    });

    document.getElementById("quickNoteToolsField").appendChild(toolsField.field);
    document.getElementById("quickNoteIssueTypesField").appendChild(issueTypesField.field);

    const close = () => {
        removeQuickNoteDraft();
        closeQuickNoteModal(overlay);
    };

    backgroundCloseHandler = () => {
        minimizeQuickNoteEditor(
            overlay,
            noteId,
            isEdit,
            toolsField,
            issueTypesField
        );
        backgroundCloseHandler = null;
    };

    modal.querySelector(".catalog-create-close").addEventListener("click", close);
    modal.querySelector(".quick-note-cancel").addEventListener("click", close);

    const saveButton = modal.querySelector(".quick-note-save");
    saveButton.addEventListener("click", async () => {
        const title = modal.querySelector("#quickNoteTitle").value.trim();
        const content = modal.querySelector("#quickNoteContent").value.trim();
        if (!title) return modal.querySelector("#quickNoteTitle").focus();
        if (!content) return modal.querySelector("#quickNoteContent").focus();

        saveButton.disabled = true;
        saveButton.textContent = isEdit ? "Saving…" : "Adding…";
        try {
            const savedNote = isEdit
                ? await updateKnowledgeBaseNote(noteId, { title, content })
                : await createKnowledgeBaseNote({ title, content, category: null, is_pinned: false, is_active: true, source_ticket_id: Number(ticketId) });

            await saveQuickNoteRelations(savedNote.id, { tools: toolsField, issueTypes: issueTypesField });
            removeQuickNoteDraft();
            closeQuickNoteModal(overlay);
            await loadQuickNotes();
            showDetailNotification(isEdit ? "Note updated successfully." : "Note added successfully.", "success");
        } catch (error) {
            console.error("Error saving Quick Note:", error);
            showDetailNotification(error.message || "Error saving note.", "error");
            saveButton.disabled = false;
            saveButton.textContent = isEdit ? "Save Changes" : "Add Note";
        }
    });
    modal.querySelector("#quickNoteTitle").focus();
}

async function openQuickNoteView(noteId) {
    try {
        const note = await getKnowledgeBaseNote(noteId);
        const overlay = createQuickNoteOverlay();
        const modal = document.createElement("div");
        modal.className = "catalog-create-modal quick-note-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML = `
            <div class="catalog-create-header">
                <div><div class="catalog-create-eyebrow">Note</div><h3>${escapeNotificationHtml(note.title)}</h3></div>
                <button type="button" class="catalog-create-close" aria-label="Close">×</button>
            </div>
            <div class="catalog-create-body">
                <div class="quick-note-related-field">
                    <label>Related</label>
                    <div class="quick-note-related">${renderNoteRelatedPills(note)}</div>
                </div>
                <label>Content</label>
                <div class="quick-note-content">${escapeNotificationHtml(note.content)}</div>
            </div>
            <div class="catalog-create-actions">
                <button type="button" class="button button-secondary quick-note-close">Close</button>
                <button type="button" class="button button-primary quick-note-edit">Edit</button>
            </div>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const close = () => closeQuickNoteModal(overlay);
        modal.querySelector(".catalog-create-close").addEventListener("click", close);
        modal.querySelector(".quick-note-close").addEventListener("click", close);
        modal.querySelector(".quick-note-edit").addEventListener("click", async () => {
            close();
            await openQuickNoteEditor(note.id);
        });
    } catch (error) {
        console.error("Error loading Quick Note:", error);
        showDetailNotification("Error loading note.", "error");
    }
}

function setupQuickNotes() {
    const addButton = document.getElementById("addQuickNoteButton");
    if (!addButton || addButton.dataset.quickNotesReady === "true") return;
    addButton.dataset.quickNotesReady = "true";
    addButton.addEventListener("click", async () => {
        try {
            if (isNewTicket || !ticketId) await saveTicket({ silent: true, force: true });
            if (!ticketId) throw new Error("Save the ticket before adding a note.");
            await openQuickNoteEditor();
        } catch (error) {
            console.error("Error preparing Quick Note:", error);
            showDetailNotification(error.message || "Could not open Add Note.", "error");
        }
    });
}


function setupEventListeners() {

    setupAutosaveListeners();
    setupSaveTroubleshootingTemplateButton();
    setupTroubleshootingTemplateSteps();
    setupSaveFormTemplateButton();
    setupFormTemplateFieldsSync();
    setupQuickNotes();





    // ========================================================

    // BACK

    // ========================================================



    document.getElementById(
        "backButton"
    ).addEventListener(
        "click",
        async () => {

            if (autosaveTimer) {
                clearTimeout(autosaveTimer);
                autosaveTimer = null;
            }

            try {
                if (autosaveDirty) {
                    await saveTicket({
                        silent: true,
                        force: true
                    });
                }
            } catch (error) {
                console.error("Error saving before leaving:", error);
                showDetailNotification(
                    "Changes could not be saved. Please try again.",
                    "error"
                );
                return;
            }

            navigateBack("index.html");
        }
    );





    // ========================================================

    // SAVE

    // ========================================================



    document.getElementById(

        "saveButton"

    ).addEventListener(

        "click",

        saveTicket

    );



    // ========================================================

    // GENERATE TICKET

    // ========================================================



    document.getElementById(

        "generateTicketButton"

    ).addEventListener(

        "click",

        generateTicket

    );



    // ========================================================

    // GENERATE TIME ENTRY

    // ========================================================

    document.getElementById(

        "generateTimeEntryButton"

    ).addEventListener(

        "click",

        generateTimeEntry

    );



    // ========================================================

    // COPY TICKET

    // ========================================================



    document.getElementById(

        "copyTicketButton"

    ).addEventListener(

        "click",

        copyTicketPreview

    );





    // ========================================================

    // COPY TIME ENTRY

    // ========================================================



    document.getElementById(

        "copyTimeEntryButton"

    ).addEventListener(

        "click",

        copyTimeEntryPreview

    );



    // ========================================================

    // COPY FORM

    // ========================================================



    document.getElementById(

        "copyFormButton"

    ).addEventListener(

        "click",

        copyFormPreview

    );





    // ========================================================

    // COPY TEMPLATE

    // ========================================================



    document.getElementById(

        "copyTemplateButton"

    ).addEventListener(

        "click",

        copyTemplatePreview

    );





    // ========================================================

    // TEMPLATE CHANGE

    // ========================================================



    document.getElementById(

        "troubleshootingTemplate"

    ).addEventListener(

        "change",

        async () => {



            await loadSelectedTemplate();



        }

    );





    // ========================================================

    // TEMPLATE USED — YES

    // ========================================================



    document.getElementById(

        "useTemplateYes"

    ).addEventListener(

        "click",

        useCurrentTemplate

    );





    // ========================================================

    // TEMPLATE USED — NO

    // ========================================================



    document.getElementById(

        "useTemplateNo"

    ).addEventListener(

        "click",

        doNotUseTemplate

    );





    // ========================================================

    // FORM CHANGE

    // ========================================================



    document.getElementById(

        "form"

    ).addEventListener(

        "change",

        async event => {



            const formId =

                event.target.value

                    ? Number(

                        event.target.value

                    )

                    : null;





            await loadSelectedForm(

                formId

            );

        }

    );





    // ============================================================

    // TOOL CHANGE

    // ============================================================



    document.getElementById(

        "tool"

    ).addEventListener(

        "change",

        async event => {



            const toolId =

                event.target.value

                    ? Number(

                        event.target.value

                    )

                    : null;



            await loadToolKnowledgeBase(

                toolId

            );



            await loadIssueTypesByTool(

                toolId

            );

            const issueTypeSelect =
                document.getElementById("issueType");

            const issueTypeId =
                issueTypeSelect?.value
                    ? Number(issueTypeSelect.value)
                    : null;

            await loadRelatedKnowledgeBaseNotes(
                issueTypeId,
                toolId
            );

        }

    );





    // ========================================================

    // ISSUE TYPE CHANGE

    // ========================================================



    document.getElementById(

    "issueType"

    ).addEventListener(

        "change",

        async (event) => {



            const issueTypeId =

                event.target.value

                    ? Number(event.target.value)

                    : null;





            if (!issueTypeId) {
                await loadQueues(null, null);

                const toolSelect =
                    document.getElementById("tool");

                await loadRelatedKnowledgeBaseNotes(
                    null,
                    toolSelect?.value
                        ? Number(toolSelect.value)
                        : null
                );

                return;
            }

            await loadQueues(null, issueTypeId);

            // Change Form Template



            await loadForms(

                issueTypeId,

                null

            );





            // Change Troubleshooting Template



            await loadTroubleshootingTemplates(

                issueTypeId,

                null

            );





            // Change Issue Type KB



            await loadIssueTypeKnowledgeBase(

                issueTypeId

            );

            const toolSelect =
                document.getElementById("tool");

            await loadRelatedKnowledgeBaseNotes(
                issueTypeId,
                toolSelect?.value
                    ? Number(toolSelect.value)
                    : null
            );



        }

    );

    // ========================================================

    // TITLE SUGGESTION

    // ========================================================



    document.getElementById(

        "location"

    ).addEventListener(

        "change",

        updateTitleSuggestion

    );





    document.getElementById(

        "issueType"

    ).addEventListener(

        "change",

        updateTitleSuggestion

    );


    document.getElementById(

        "tool"

    ).addEventListener(

        "change",

        updateTitleSuggestion

    );





    document.getElementById(

        "shortIssue"

    ).addEventListener(

        "input",

        updateTitleSuggestion

    );



    // ========================================================

    // COPY TITLE SUGGESTION

    // ========================================================



    document.getElementById(

        "copyTitleSuggestionButton"

    ).addEventListener(

        "click",

        async () => {



            const suggestion =

                document.getElementById(

                    "titleSuggestion"

                ).textContent;



            if (!suggestion || suggestion === "-") {

                return;

            }



            try {

                await navigator.clipboard.writeText(

                    suggestion

                );

                showSuccessMessage("Title suggestion copied to clipboard.");

            } catch (error) {

                console.error("Error copying title suggestion:", error);
                showErrorMessage("Unable to copy title suggestion.");
            }

        }

    );



    // ========================================================

    // USE TITLE SUGGESTION

    // ========================================================



    document.getElementById(

        "useTitleSuggestionButton"

    ).addEventListener(

        "click",

        () => {



            const suggestion =

                document.getElementById(

                    "titleSuggestion"

                ).textContent;



            if (!suggestion || suggestion === "-") {

                return;

            }



            const ticketTitle = document.getElementById("ticketTitle");
            ticketTitle.value = suggestion;

            // Programmatic changes do not trigger input listeners automatically.
            // Dispatch the same event as user input so autosave runs immediately.
            ticketTitle.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            showSuccessMessage("Title suggestion applied.");

        }

    );



}



// ============================================================

// GENERATE TICKET

// ============================================================



function generateTicket() {



    const prioritySelect =

        document.getElementById("priority");



    const userTypeSelect =
        document.getElementById("userType");

    const userType =
        userTypeSelect?.selectedOptions?.[0]?.textContent
            ?.trim() || "";



    const userName =

        document.getElementById("userName")

            .value.trim();



    const locationSelect =

        document.getElementById("location");



    const userPhone =

        document.getElementById("userPhone")

            .value.trim();



    const userEmail =

        document.getElementById("userEmail")

            .value.trim();



    const shortIssue =

        document.getElementById("shortIssue")

            .value.trim();



    const issueDescription =

        document.getElementById("issueDescription")

            .value.trim();



    const formContent =

        document.getElementById("formContent")

            .value.trim();



    const troubleshootingSteps =

        document.getElementById("troubleshootingSteps")

            .value.trim();



    const additionalNotes =

        document.getElementById("additionalNotes")

            .value.trim();





    // ========================================================

    // PRIORITY

    // ========================================================



    const priority =

        prioritySelect.options[

            prioritySelect.selectedIndex

        ]?.textContent.trim() ?? "";





    // ========================================================

    // LOCATION

    // ========================================================



    const selectedLocation =

        locationSelect.options[

            locationSelect.selectedIndex

        ];



    const locationValue =

        locationSelect.value;



    let affectedLocation = "";



    if (locationValue) {



        const locationName =

            selectedLocation?.textContent.trim() ?? "";



        const locationCode =

            selectedLocation?.dataset.code?.trim() ?? "";



        if (locationName && locationCode) {



            affectedLocation =

                `${locationName}. ${locationCode}`;



        } else if (locationName) {



            affectedLocation =

                locationName;



        } else if (locationCode) {



            affectedLocation =

                locationCode;

        }

    }



    // ========================================================

    // BUILD USER INFORMATION

    // ========================================================



    const userInformation = [];





    if (priority) {



        userInformation.push(

            `Ticket Priority: ${priority}`

        );

    }





    if (userType) {



        userInformation.push(

            `Customer/Employee/Contractor: ${userType}`

        );

    }





    if (userName) {



        userInformation.push(

            `Name: ${userName}`

        );

    }





    if (affectedLocation) {



        userInformation.push(

            `Affected Location: ${affectedLocation}`

        );

    }





    if (userPhone) {



        userInformation.push(

            `Primary Contact: ${userPhone}`

        );

    }





    if (userEmail) {



        userInformation.push(

            `Email Address: ${userEmail}`

        );

    }





    // ========================================================

    // BUILD TICKET

    // ========================================================



    const sections = [];





    if (userInformation.length > 0) {



        sections.push(

            userInformation.join("\n")

        );

    }





    if (shortIssue) {



        sections.push(

            `Short Description:\n${shortIssue}`

        );

    }





    if (issueDescription) {



        sections.push(

            `Detailed Issue Description:\n${issueDescription}`

        );

    }





    if (formContent) {



        sections.push(

            `Information:\n${formContent}`

        );

    }





    if (troubleshootingSteps) {



        sections.push(

            `Troubleshooting:\n${troubleshootingSteps}`

        );

    }





    if (additionalNotes) {



        sections.push(

            `Additional Notes:\n${additionalNotes}`

        );

    }





    const ticketText =

        sections.join("\n\n");





    // ========================================================

    // UPDATE PREVIEW

    // ========================================================



    document.getElementById(

        "ticketPreview"

    ).textContent =

        ticketText || "-";

    if (ticketText) showSuccessMessage("Ticket generated.");

}



// ============================================================

// GENERATE TIME ENTRY

// ============================================================



function generateTimeEntry() {



    const issueDescription =

        document.getElementById("issueDescription")

            .value.trim();



    const troubleshootingSteps =

        document.getElementById("troubleshootingSteps")

            .value.trim();



    const userName =

        document.getElementById("userName")

            .value.trim();



    const userPhone =

        document.getElementById("userPhone")

            .value.trim();



    const userEmail =

        document.getElementById("userEmail")

            .value.trim();



    const formContent =

        document.getElementById("formContent")

            .value.trim();





    // ========================================================

    // DETAILS

    // ========================================================



    const details = [];





    if (userName) {

        details.push(`Name: ${userName}`);

    }





    if (userPhone) {

        details.push(`Primary Contact: ${userPhone}`);

    }





    if (userEmail) {

        details.push(`Email Address: ${userEmail}`);

    }





    if (formContent) {

        details.push(`Form:\n${formContent}`);

    }





    // ========================================================

    // BUILD TIME ENTRY

    // ========================================================



    const timeEntrySections = [];





    // Situation

    timeEntrySections.push(

        `Situation:\n${issueDescription}`

    );





    // Action Taken

    timeEntrySections.push(

        `Action Taken:\n${troubleshootingSteps}`

    );





    // Next Steps



    const isRouted =

        document.getElementById("isRouted").checked;



    const nextSteps =

        isRouted

            ? "Route ticket to the solver team"

            : "Complete the ticket";



    timeEntrySections.push(

        `Next Steps:\n${nextSteps}`

    );





    // Details

    timeEntrySections.push(

        `Details:\n${details.join("\n")}`

    );





    const timeEntryText =

        timeEntrySections.join("\n\n");





    // ========================================================

    // UPDATE PREVIEW

    // ========================================================



    document.getElementById(

        "timeEntryPreview"

    ).textContent =

        timeEntryText;

    if (timeEntryText) showSuccessMessage("Time Entry generated.");

}



// ============================================================

// SAVE TICKET
// ============================================================

function markAutosaveDirty() {
    autosaveDirty = true;

    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
    }

    autosaveTimer = setTimeout(() => {
        saveTicket({ silent: true });
    }, 900);
}

function setupAutosaveListeners() {

    const editableFields = [
        "ticketNumber", "ticketTitle", "userName", "userEmail",
        "userPhone", "userType", "shortIssue", "issueDescription",
        "troubleshootingSteps", "additionalNotes", "formContent",
        "isRouted", "form", "tool", "location", "priority",
        "issueType", "troubleshootingTemplate", "status", "queue"
    ];

    editableFields.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        const eventName =
            element.type === "checkbox" || element.tagName === "SELECT"
                ? "change"
                : "input";

        element.addEventListener(eventName, () => {
            autosaveDirty = true;

            if (autosaveTimer) clearTimeout(autosaveTimer);

            autosaveTimer = setTimeout(() => {
                saveTicket({ silent: true });
            }, 900);
        });
    });
}

function buildTicketData() {
    return {
        ticket_number: document.getElementById("ticketNumber").value,
        title: document.getElementById("ticketTitle").value,
        user_name: document.getElementById("userName").value,
        user_email: document.getElementById("userEmail").value,
        user_best_contact_number: document.getElementById("userPhone").value,
        user_type_id: document.getElementById("userType").value ? Number(document.getElementById("userType").value) : null,
        short_issue: document.getElementById("shortIssue").value,
        issue_description: document.getElementById("issueDescription").value,
        troubleshooting_steps: document.getElementById("troubleshootingSteps").value,
        additional_notes: document.getElementById("additionalNotes").value,
        form_content: document.getElementById("formContent").value,
        is_routed: document.getElementById("isRouted").checked,
        generated_ticket: document.getElementById("ticketPreview").textContent,
        generated_time_entry: document.getElementById("timeEntryPreview").textContent,
        form_template_id: document.getElementById("form").value ? Number(document.getElementById("form").value) : null,
        tool_id: document.getElementById("tool").value ? Number(document.getElementById("tool").value) : null,
        location_id: document.getElementById("location").value ? Number(document.getElementById("location").value) : null,
        priority_id: document.getElementById("priority").value ? Number(document.getElementById("priority").value) : null,
        issue_type_id: document.getElementById("issueType").value ? Number(document.getElementById("issueType").value) : null,
        troubleshooting_template_id: document.getElementById("troubleshootingTemplate").value ? Number(document.getElementById("troubleshootingTemplate").value) : null,
        status_id: document.getElementById("status").value ? Number(document.getElementById("status").value) : null,
        queue_id: document.getElementById("queue").value ? Number(document.getElementById("queue").value) : null
    };
}

async function saveTicket(options = {}) {

    const { silent = false, force = false } = options;

    if (autosaveInProgress) return;
    if (!force && !autosaveDirty) return;

    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
    }

    autosaveInProgress = true;

    const saveButton = document.getElementById("saveButton");
    const originalSaveText = saveButton?.textContent || "Save Changes";

    if (!silent && saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving…";
    }

    const ticketData = buildTicketData();

    try {

        if (isNewTicket || !ticketId) {
            const createdTicket = await createTicket(ticketData);

            ticketId = createdTicket.id;
            isNewTicket = false;

            const currentReturnTo = new URLSearchParams(
                window.location.search
            ).get("returnTo");
            const createdTicketUrl = new URL(
                `ticket-detail.html?id=${createdTicket.id}`,
                window.location.href
            );

            if (currentReturnTo) {
                createdTicketUrl.searchParams.set(
                    "returnTo",
                    currentReturnTo
                );
            }

            window.history.replaceState(
                {},
                "",
                `${createdTicketUrl.pathname}${createdTicketUrl.search}`
            );

            autosaveDirty = false;

            if (!silent) {
                showDetailNotification("Ticket created successfully.", "success");
            }

            return createdTicket;
        }

        await updateTicket(ticketId, ticketData);
        autosaveDirty = false;

        if (!silent) {
            showDetailNotification("Ticket updated successfully.", "success");
        }

    } catch (error) {

        console.error("Error saving ticket:", error);
        autosaveDirty = true;

        if (!silent) {
            showDetailNotification("Error saving ticket. Please try again.", "error");
        }

        throw error;

    } finally {
        autosaveInProgress = false;

        if (!silent && saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = originalSaveText;
        }
    }
}
