// ============================================================

// GLOBAL VARIABLES

// ============================================================



const params = new URLSearchParams(window.location.search);



let ticketId = params.get("id");

let isNewTicket = params.get("new") === "true";

let autosaveTimer = null;
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

    await loadQueues(null);

    await loadLocations(null);

    await loadUserTypes(null);

    await loadTools(null);



    // Load all Issue Types

    await loadIssueTypes(null);



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



        await loadQueues(

            ticket.queue_id

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



        await loadIssueTypeKnowledgeBase(

            ticket.issue_type_id

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

    currentQueueId

) {



    const queues =

        await getQueues();





    const queueSelect =

        document.getElementById(

            "queue"

        );





    queueSelect.innerHTML = "";





    queues.forEach(

        queue => {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                queue.id;



            option.textContent =

                queue.name;





            if (

                queue.id ===

                currentQueueId

            ) {



                option.selected = true;

            }





            queueSelect.appendChild(

                option

            );

        }

    );

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

        document.getElementById(

            "toolKnowledgeBase"

        );





    container.innerHTML = "";





    if (!toolId) {



        container.innerHTML =

            "\<p>No Knowledge Base articles selected.\</p>";



        return;

    }





    try {



        const knowledgeBase =

            await getToolKnowledgeBase(

                toolId

            );





        if (

            !knowledgeBase ||

            knowledgeBase.length === 0

        ) {



            container.innerHTML =

                "\<p>No Knowledge Base articles associated.\</p>";



            return;

        }





        knowledgeBase.forEach(

            kb => {



                const item =

                    document.createElement(

                        "div"

                    );





                item.textContent =

                    `${kb.article_number} - ${kb.title}`;





                container.appendChild(

                    item

                );

            }

        );





    } catch (error) {



        console.error(

            "Error loading Tool KB:",

            error

        );



        container.innerHTML =

            "\<p>Error loading Knowledge Base articles.\</p>";

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

        document.getElementById(

            "location"

        );





    locationSelect.innerHTML = "";



    const emptyOption =

        document.createElement("option");



    emptyOption.value = "";

    emptyOption.textContent =

        "Select a Location";



    locationSelect.appendChild(

        emptyOption

    );



    locations.forEach(

        location => {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                location.id;



            option.textContent =

                location.name;



            option.dataset.code =

                location.code ?? "";





            if (

                location.id ===

                currentLocationId

            ) {



                option.selected = true;

            }





            locationSelect.appendChild(

                option

            );

        }

    );

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

// ISSUE TYPE KNOWLEDGE BASE

// ============================================================



async function loadIssueTypeKnowledgeBase(

    issueTypeId

) {



    const container =

        document.getElementById(

            "issueTypeKnowledgeBase"

        );





    container.innerHTML = "";





    if (!issueTypeId) {



        container.innerHTML =

            "\<p>No Knowledge Base articles selected.\</p>";



        return;

    }





    try {



        const knowledgeBase =

            await getIssueTypeKnowledgeBase(

                issueTypeId

            );





        if (

            !knowledgeBase ||

            knowledgeBase.length === 0

        ) {



            container.innerHTML =

                "\<p>No Knowledge Base articles associated.\</p>";



            return;

        }





        knowledgeBase.forEach(

            kb => {



                const item =

                    document.createElement(

                        "div"

                    );





                item.textContent =

                    `${kb.article_number} - ${kb.title}`;





                container.appendChild(

                    item

                );

            }

        );





    } catch (error) {



        console.error(

            "Error loading Issue Type KB:",

            error

        );



        container.innerHTML =

            "\<p>Error loading Knowledge Base articles.\</p>";

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



    loadTemplatePreview();





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



function loadTemplatePreview() {



    const templateSelect =

        document.getElementById(

            "troubleshootingTemplate"

        );





    const preview =

        document.getElementById(

            "troubleshootingTemplatePreview"

        );





    const selectedTemplateId =

        templateSelect.value

            ? Number(

                templateSelect.value

            )

            : null;





    const selectedTemplate =

        troubleshootingTemplates.find(

            template =>

                template.id ===

                selectedTemplateId

        );





    if (selectedTemplate) {



        preview.value =

            selectedTemplate.steps ??

            selectedTemplate.generated_description ??

            "";



    } else {



        preview.value = "";

    }

}





// ============================================================

// TEMPLATE KNOWLEDGE BASE

// ============================================================



async function loadTemplateKnowledgeBase(

    templateId

) {



    const container =

        document.getElementById(

            "templateKnowledgeBase"

        );





    container.innerHTML = "";





    if (!templateId) {



        container.innerHTML =

            "\<p>No Knowledge Base articles associated.\</p>";



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



            container.innerHTML =

                "\<p>No Knowledge Base articles associated.\</p>";



            return;

        }





        knowledgeBase.forEach(

            kb => {



                const item =

                    document.createElement(

                        "div"

                    );





                item.textContent =

                    `${kb.article_number} - ${kb.title}`;





                container.appendChild(

                    item

                );

            }

        );





    } catch (error) {



        console.error(

            "Error loading Template KB:",

            error

        );



        container.innerHTML =

            "\<p>Error loading Knowledge Base articles.\</p>";

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



    const preview =

        document.getElementById(

            "formPreview"

        );





    if (!formId) {



        preview.value = "";



        return;

    }





    const form =

        forms.find(

            form =>

                form.id ===

                Number(formId)

        );





    if (!form) {



        preview.value = "";



        return;

    }





    try {



        const fields =

            await getFormFields(

                formId

            );





        if (

            !fields ||

            fields.length === 0

        ) {



            preview.value =

                form.description ?? "";



            return;

        }





        let previewText = "";





        fields.forEach(

            field => {



                previewText +=

                    `${field.label}:\n\n`;

            }

        );





        preview.value =

            previewText;





    } catch (error) {



        console.error(

            "Error loading Form Preview:",

            error

        );





        preview.value =

            form.description ?? "";

    }

}





// ============================================================

// COPY FORM PREVIEW

// ============================================================



async function copyFormPreview() {



    const preview =

        document.getElementById(

            "formPreview"

        );





    if (!preview.value) {



        return;

    }





    try {



        await navigator.clipboard.writeText(

            preview.value

        );





        showSuccessMessage("Form copied to clipboard.");





    } catch (error) {



        console.error(

            "Error copying form:",

            error

        );

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



    const preview =

        document.getElementById(

            "troubleshootingTemplatePreview"

        );





    if (!preview.value) {



        return;

    }





    try {



        await navigator.clipboard.writeText(

            preview.value

        );





        showSuccessMessage("Template copied to clipboard.");





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





    } catch (error) {



        console.error(

            "Error adding template KBs:",

            error

        );





        showErrorMessage("Error adding Knowledge Base articles.");

    }

}





// ============================================================

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
                    description: description || "Created from Ticket Creator"
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
                    description: description || "Created from Ticket Creator"
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

            if (isLocation) {

                if (!cityInput.value.trim()) {
                    cityInput.focus();
                    return;
                }

                if (!stateInput.value.trim()) {
                    stateInput.focus();
                    return;
                }

                if (!codeInput.value.trim()) {
                    codeInput.focus();
                    return;
                }
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
    let originalContent = formContent.value;

    const updateButtonState = () => {
        const currentContent = formContent.value;
        const hasChanges = currentContent !== originalContent;

        button.disabled = !hasChanges;
        button.style.opacity = button.disabled ? "0.5" : "1";
        button.style.cursor = button.disabled
            ? "not-allowed"
            : "pointer";
    };

    button.markSaved = () => {
        originalContent = formContent.value;
        updateButtonState();
    };

    formContent.addEventListener(
        "input",
        updateButtonState
    );

    button.addEventListener(
        "click",
        () => {
            const content = formContent.value.trim();

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

    troubleshootingSteps.insertAdjacentElement("afterend", button);

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
            const steps = troubleshootingSteps.value.trim();

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

function setupEventListeners() {

    setupAutosaveListeners();
    setupSaveTroubleshootingTemplateButton();
    setupSaveFormTemplateButton();





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

            window.location.href = "index.html";
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





                return;

            }





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



            document.getElementById(

                "ticketTitle"

            ).value = suggestion;

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

            window.history.replaceState(
                {},
                "",
                `ticket-detail.html?id=${createdTicket.id}`
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
