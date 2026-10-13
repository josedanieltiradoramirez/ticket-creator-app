// =========================
// LOGIN
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {

            const data = await login(username, password);

            // Save JWT
            localStorage.setItem("access_token", data.access_token);

            // Go to the main screen
            window.location.href = "index.html";

        } catch (error) {

            message.textContent = error.message;

        }
    });
}

    
// =========================
// TICKETS DASHBOARD
// =========================

let currentPage = 1;
const limit = 20;
let activeView = "today";
let filters = {};

const previousPageButton = document.getElementById("previousPage");
const nextPageButton = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const ticketsContainer = document.getElementById("ticketsContainer");
const ticketsTableContainer = document.getElementById("ticketsTableContainer");
const pagination = document.getElementById("pagination");
const filtersContainer = document.getElementById("filters");
const todayView = document.getElementById("todayView");
const byDayView = document.getElementById("byDayView");
const allTicketsView = document.getElementById("allTicketsView");
const ticketsViewLabel = document.getElementById("ticketsViewLabel");
const byDayIndexView = document.getElementById("ticketsByDayIndexView");
const byDayListContainer = document.getElementById("ticketsByDayList");
const byDayDetailView = document.getElementById("ticketsByDayDetailView");
const backToDaysButton = document.getElementById("backToTicketsByDay");
const selectedDayTitle = document.getElementById("selectedTicketsDayTitle");
const groupedTicketsContainer = document.getElementById("ticketsGroupedByStatus");
let selectedDayDate = null;
const todayTicketsContainer = document.getElementById("todayTicketsByStatus");
const pendingTicketsContainer = document.getElementById("pendingTicketsByStatus");

const statusFilter = document.getElementById("statusFilter");
const issueTypeFilter = document.getElementById("issueTypeFilter");
const priorityFilter = document.getElementById("priorityFilter");
const queueFilter = document.getElementById("queueFilter");
const toolFilter = document.getElementById("toolFilter");
const locationFilter = document.getElementById("locationFilter");
const ticketNumberFilter = document.getElementById("ticketNumberFilter");
const userNameFilter = document.getElementById("userNameFilter");
const ticketDateFilter = document.getElementById("ticketDateFilter");
const applyFiltersButton = document.getElementById("applyFilters");
const clearFiltersButton = document.getElementById("clearFilters");

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatTicketDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function ticketRowMarkup(ticket) {
    return `
        <td>${ticket.ticket_number ?? ""}</td>
        <td>${ticket.title ?? "No title"}</td>
        <td>${ticket.issue_type?.name ?? ""}</td>
        <td>${ticket.tool?.name ?? ""}</td>
        <td>${ticket.status?.name ?? "No status"}</td>
        <td>${ticket.priority?.name ?? ""}</td>
        <td>${ticket.queue?.name ?? ""}</td>
        <td>${ticket.location?.name ?? ""}</td>
        <td>${formatTicketDate(ticket.created_at)}</td>
    `;
}

function appendTicketRow(container, ticket) {
    const row = document.createElement("tr");
    row.classList.add("ticket-row");
    row.innerHTML = ticketRowMarkup(ticket);
    row.addEventListener("click", () => {
        window.location.href = `ticket-detail.html?id=${ticket.id}`;
    });
    container.appendChild(row);
}

function renderTickets(tickets, container = ticketsContainer) {
    container.innerHTML = "";
    if (!tickets.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 9;
        cell.className = "tickets-empty-cell";
        cell.textContent = "No tickets found for this view.";
        row.appendChild(cell);
        container.appendChild(row);
        return;
    }
    tickets.forEach(ticket => appendTicketRow(container, ticket));
}

async function getAllTicketsForDate(dateString) {
    const results = [];
    let page = 1;
    let pages = 1;
    do {
        const response = await getTickets(page, 100, { ticket_date: dateString });
        results.push(...(response.items || []));
        pages = response.pages || 0;
        page += 1;
    } while (page <= pages);
    return results;
}

// Fetch every ticket owned by the current user. Used only to identify older open tickets.
async function getAllTickets() {
    const results = [];
    let page = 1;
    let pages = 1;
    do {
        const response = await getTickets(page, 100, {});
        results.push(...(response.items || []));
        pages = response.pages || 0;
        page += 1;
    } while (page <= pages);
    return results;
}

const TODAY_STATUS_GROUPS = [
    { label: "New", aliases: ["new"] },
    { label: "In progress", aliases: ["in progress", "in-progress", "inprogress"] },
    // Legacy status names are grouped under the canonical label.
    { label: "Waiting Customer", aliases: ["waiting customer", "waiting", "waiting on user", "pending"] },
    { label: "Completed", aliases: ["completed", "complete", "closed", "resolved"] }
];

function normalizeStatusName(value) {
    return String(value || "No status").trim().toLowerCase().replace(/\s+/g, " ");
}

function isWaitingCustomerAlias(value) {
    return ["waiting customer", "waiting", "waiting on user", "pending"].includes(normalizeStatusName(value));
}

function getCanonicalTicketStatuses(statuses) {
    const hasWaitingCustomer = statuses.some(status => normalizeStatusName(status.name) === "waiting customer");
    if (!hasWaitingCustomer) return statuses;

    // Keep Waiting Customer as the only selectable option when legacy duplicates exist.
    return statuses.filter(status => normalizeStatusName(status.name) !== "waiting");
}

let availableTicketStatuses = [];
let availablePriorities = [];
let ticketPendingDeletion = null;
// Keep collapse choices across dashboard refreshes. Completed starts collapsed to keep focus on open work.
const collapsedStatusGroups = {
    today: new Set(["completed"]),
    pending: new Set(),
    day: new Set(["completed"])
};


function normalizeStatusClass(value) {
    return normalizeStatusName(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'unknown';
}

function createEditableInput({ className, value, placeholder, ticket, field, label }) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = className;
    input.value = value ?? '';
    input.placeholder = placeholder || '';
    input.setAttribute('aria-label', label);
    input.title = `Edit ${label.toLowerCase()}`;

    let lastSavedValue = String(value ?? '');
    const save = async () => {
        const nextValue = input.value.trim();
        if (nextValue === lastSavedValue) return;

        input.disabled = true;
        input.classList.remove('field-save-error', 'field-save-success');
        try {
            await updateTicket(ticket.id, { [field]: nextValue || null });
            input.classList.add('field-save-success');
            ticket[field] = nextValue || null;
            lastSavedValue = nextValue;
            input.title = `${label} saved`;
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            input.value = lastSavedValue;
            input.classList.add('field-save-error');
            input.title = `Could not save ${label.toLowerCase()}`;
            showNotification(`Could not update ${label.toLowerCase()}. Please try again.`, 'error');
        } finally {
            input.disabled = false;
        }
    };

    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            input.blur();
        }
        if (event.key === 'Escape') {
            input.value = lastSavedValue;
            input.blur();
        }
    });
    input.addEventListener('blur', save);
    return input;
}

function toDateTimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function createEditableCreatedAt(ticket) {
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.className = 'today-editable-field today-ticket-created-input';
    input.value = toDateTimeLocal(ticket.created_at);
    input.setAttribute('aria-label', `Created at for ticket ${ticket.ticket_number || ''}`);
    input.title = 'Edit creation date and time';
    let lastSavedValue = input.value;

    input.addEventListener('change', async () => {
        const nextValue = input.value;
        if (nextValue === lastSavedValue) return;
        if (!nextValue) {
            showNotification('Created at must have a date and time.', 'warning');
            input.value = lastSavedValue;
            return;
        }

        const nextDate = new Date(nextValue);
        if (Number.isNaN(nextDate.getTime())) {
            showNotification('Please enter a valid date and time.', 'warning');
            input.value = lastSavedValue;
            return;
        }

        input.disabled = true;
        input.classList.remove('field-save-error', 'field-save-success');
        try {
            const isoValue = nextDate.toISOString();
            await updateTicket(ticket.id, { created_at: isoValue });
            ticket.created_at = isoValue;
            lastSavedValue = nextValue;
            input.classList.add('field-save-success');
            // Refresh both sections because changing the date can move a ticket between them.
            await Promise.all([loadTodayTickets(), loadPendingTickets()]);
            if (activeView === "by-day") await loadTicketsByDay();
        } catch (error) {
            console.error('Error updating ticket creation date:', error);
            input.value = lastSavedValue;
            input.classList.add('field-save-error');
            showNotification('Could not update creation date. Check that the backend accepts created_at updates.', 'error');
        } finally {
            input.disabled = false;
        }
    });
    return input;
}

function createPrioritySelect(ticket, isDraft = false) {
    const select = document.createElement('select');
    select.className = 'today-ticket-priority-select';
    select.setAttribute('aria-label', `Priority for ticket ${ticket.ticket_number || ''}`);
    select.title = 'Change priority';

    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = 'No priority';
    select.appendChild(noneOption);

    availablePriorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = String(priority.id);
        option.textContent = priority.name;
        const normalizedPriority = String(priority.name || '').trim().toLowerCase();
        option.className = `priority-option-${normalizedPriority.replace(/[^a-z0-9]+/g, '-')}`;
        select.appendChild(option);
    });

    const priorityClassFor = name => {
        const normalized = String(name || '').trim().toLowerCase();
        if (normalized === 'low') return 'priority-low';
        if (normalized === 'medium') return 'priority-medium';
        if (normalized === 'high') return 'priority-high';
        if (normalized === 'critical') return 'priority-critical';
        return 'priority-unset';
    };
    const applyPriorityStyle = () => {
        const selectedPriority = availablePriorities.find(item => String(item.id) === select.value);
        select.classList.remove('priority-low', 'priority-medium', 'priority-high', 'priority-critical', 'priority-unset');
        select.classList.add(priorityClassFor(selectedPriority?.name));
    };

    const currentPriorityId = ticket.priority_id ?? ticket.priority?.id ?? '';
    if (isDraft && (currentPriorityId === null || currentPriorityId === '')) {
        const mediumPriority = availablePriorities.find(item => String(item.name || '').trim().toLowerCase() === 'medium');
        select.value = mediumPriority ? String(mediumPriority.id) : '';
    } else {
        select.value = currentPriorityId === null ? '' : String(currentPriorityId);
    }
    applyPriorityStyle();
    select.addEventListener('change', applyPriorityStyle);

    if (!isDraft) {
        select.addEventListener('change', async () => {
            const previousPriorityId = ticket.priority_id ?? ticket.priority?.id ?? '';
            const nextPriorityId = select.value;
            if (String(previousPriorityId) === String(nextPriorityId)) return;

            select.disabled = true;
            select.classList.remove('field-save-error', 'field-save-success');
            try {
                await updateTicket(ticket.id, {
                    priority_id: nextPriorityId ? Number(nextPriorityId) : null
                });
                const selected = availablePriorities.find(item => String(item.id) === nextPriorityId);
                ticket.priority_id = nextPriorityId ? Number(nextPriorityId) : null;
                ticket.priority = selected ? { id: selected.id, name: selected.name } : null;
                select.classList.add('field-save-success');
                showNotification('Priority updated.', 'success');
            } catch (error) {
                console.error('Error updating ticket priority:', error);
                select.value = String(previousPriorityId);
                select.classList.add('field-save-error');
                showNotification('Could not update priority. Please try again.', 'error');
            } finally {
                select.disabled = false;
            }
        });
    }

    return select;
}

function createTodayTicketCard(ticket) {
    const row = document.createElement('div');
    row.className = 'today-ticket-row';
    row.dataset.ticketId = String(ticket.id);

    const number = createEditableInput({
        className: 'today-editable-field today-ticket-number',
        value: ticket.ticket_number,
        placeholder: 'Ticket number',
        ticket,
        field: 'ticket_number',
        label: 'Ticket number'
    });

    const title = createEditableInput({
        className: 'today-editable-field today-ticket-title',
        value: ticket.title,
        placeholder: 'Add title',
        ticket,
        field: 'title',
        label: 'Title'
    });

    const user = createEditableInput({
        className: 'today-editable-field today-ticket-user',
        value: ticket.user_name,
        placeholder: 'User name',
        ticket,
        field: 'user_name',
        label: 'User name'
    });

    const created = createEditableCreatedAt(ticket);

    const status = document.createElement('select');
    status.className = 'today-ticket-status-select';
    status.setAttribute('aria-label', `Status for ticket ${ticket.ticket_number || ''}`);
    const ticketStatusName = normalizeStatusName(ticket.status?.name);
    const statusByCurrentId = availableTicketStatuses.find(
        item => Number(item.id) === Number(ticket.status_id)
    );
    const effectiveTicketStatusName = ticketStatusName === "no status"
        ? normalizeStatusName(statusByCurrentId?.name)
        : ticketStatusName;
    const canonicalWaitingStatus = availableTicketStatuses.find(
        item => normalizeStatusName(item.name) === "waiting customer"
    );
    const shouldCanonicalizeWaiting = isWaitingCustomerAlias(effectiveTicketStatusName) && canonicalWaitingStatus;

    getCanonicalTicketStatuses(availableTicketStatuses).forEach(item => {
        const option = document.createElement('option');
        option.value = String(item.id);
        option.textContent = item.name;
        option.selected = shouldCanonicalizeWaiting
            ? Number(item.id) === Number(canonicalWaitingStatus.id)
            : Number(item.id) === Number(ticket.status_id);
        status.appendChild(option);
    });
    // Keep an unknown current status visible if the endpoint omitted it from the statuses list.
    if (!status.value && ticket.status?.name) {
        const option = document.createElement('option');
        option.value = String(ticket.status.id ?? ticket.status_id ?? '');
        option.textContent = ticket.status.name;
        option.selected = true;
        status.appendChild(option);
    }

    status.addEventListener('change', async () => {
        const previousStatusId = ticket.status_id ?? '';
        const nextStatusId = status.value;
        if (!nextStatusId || String(previousStatusId) === String(nextStatusId)) return;

        status.disabled = true;
        status.classList.remove('field-save-error', 'field-save-success');
        try {
            await updateTicket(ticket.id, { status_id: Number(nextStatusId) });
            const selected = availableTicketStatuses.find(item => String(item.id) === nextStatusId);
            ticket.status_id = Number(nextStatusId);
            ticket.status = selected ? { id: selected.id, name: selected.name } : ticket.status;
            status.classList.add('field-save-success');
            // Re-fetch so the ticket moves to the matching section immediately.
            await Promise.all([loadTodayTickets(), loadPendingTickets()]);
            if (activeView === "by-day") await loadTicketsByDay();
        } catch (error) {
            console.error('Error updating ticket status:', error);
            status.value = String(previousStatusId);
            status.classList.add('field-save-error');
            showNotification('Could not update ticket status. Please try again.', 'error');
        } finally {
            status.disabled = false;
        }
    });

    const priority = createPrioritySelect(ticket);

    const actions = document.createElement('div');
    actions.className = 'today-ticket-actions';

    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'today-ticket-open';
    openButton.textContent = 'Open';
    openButton.setAttribute('aria-label', `Open ticket ${ticket.ticket_number || ''}`);
    openButton.addEventListener('click', () => {
        window.location.href = `ticket-detail.html?id=${ticket.id}`;
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'today-ticket-delete';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ticket ${ticket.ticket_number || ''}`);
    deleteButton.addEventListener('click', () => openDeleteTicketModal(ticket));

    actions.append(openButton, deleteButton);
    row.append(number, title, user, created, status, priority, actions);
    return row;
}

function isCompletedStatus(statusName) {
    const normalized = normalizeStatusName(statusName);
    return ["completed", "complete", "closed", "resolved"].includes(normalized);
}

function getStatusIdForGroup(groupData) {
    const aliases = groupData.aliases || [normalizeStatusName(groupData.label)];
    const exact = availableTicketStatuses.find(status => normalizeStatusName(status.name) === normalizeStatusName(groupData.label));
    const found = exact || availableTicketStatuses.find(status => aliases.includes(normalizeStatusName(status.name)));
    return found ? String(found.id) : "";
}

function createDraftTicketRow(groupData, context) {
    const row = document.createElement("div");
    row.className = "today-ticket-row today-ticket-draft-row";
    row.setAttribute("aria-label", `New ticket in ${groupData.label}`);

    const number = document.createElement("input");
    number.type = "text";
    number.className = "today-editable-field today-ticket-number";
    number.placeholder = "Ticket number";
    number.setAttribute("aria-label", "New ticket number");

    const title = document.createElement("input");
    title.type = "text";
    title.className = "today-editable-field today-ticket-title";
    title.placeholder = "Ticket title";
    title.setAttribute("aria-label", "New ticket title");

    const user = document.createElement("input");
    user.type = "text";
    user.className = "today-editable-field today-ticket-user";
    user.placeholder = "User name";
    user.setAttribute("aria-label", "New ticket user name");

    const created = document.createElement("span");
    created.className = "today-ticket-created today-ticket-created-label";
    created.textContent = "Now";
    created.title = "Creation date will be set when the ticket is saved";

    const status = document.createElement("select");
    status.className = "today-ticket-status-select";
    status.setAttribute("aria-label", "Status for new ticket");
    getCanonicalTicketStatuses(availableTicketStatuses).forEach(item => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = item.name;
        status.appendChild(option);
    });
    const defaultStatusId = getStatusIdForGroup(groupData);
    if (defaultStatusId) status.value = defaultStatusId;

    const priority = createPrioritySelect({ ticket_number: "", priority_id: null }, true);
    priority.setAttribute("aria-label", "Priority for new ticket");

    const actions = document.createElement("div");
    actions.className = "today-draft-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "today-draft-save";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "today-draft-cancel";
    cancelButton.textContent = "Cancel";

    cancelButton.addEventListener("click", () => row.remove());
    saveButton.addEventListener("click", async () => {
        const ticketNumber = number.value.trim();
        const ticketTitle = title.value.trim();
        const userName = user.value.trim();
        const statusId = status.value;

        // Ticket number, title, and user name are optional for inline creation.
        // The status is normally preselected from the section where the row was added.
        if (!statusId) {
            showNotification("Select a status before saving the ticket.", "warning");
            status.focus();
            return;
        }

        saveButton.disabled = true;
        cancelButton.disabled = true;
        row.classList.add("is-saving");
        try {
            await createTicket({
                ticket_number: ticketNumber || null,
                title: ticketTitle || null,
                user_name: userName || null,
                status_id: Number(statusId),
                priority_id: priority.value ? Number(priority.value) : null
            });
            showNotification("Ticket created.", "success");
            await Promise.all([loadTodayTickets(), loadPendingTickets()]);
            if (activeView === "by-day") {
                if (context === "day") selectedDayDate = getLocalDateString();
                await loadTicketsByDay();
            }
        } catch (error) {
            console.error("Could not create inline ticket:", error);
            showNotification("Could not create the ticket. Please try again.", "error");
            saveButton.disabled = false;
            cancelButton.disabled = false;
            row.classList.remove("is-saving");
        }
    });

    actions.append(saveButton, cancelButton);
    row.append(number, title, user, created, status, priority, actions);
    return row;
}

function renderStatusGroups(container, tickets, context, options = {}) {
    container.innerHTML = "";
    const includeCompleted = options.includeCompleted !== false;
    const knownGroups = TODAY_STATUS_GROUPS
        .filter(group => includeCompleted || !group.aliases.some(alias => ["completed", "complete", "closed", "resolved"].includes(alias)))
        .map(group => ({ ...group, tickets: [] }));
    const extraGroups = new Map();

    tickets.forEach(ticket => {
        const statusName = ticket.status?.name || "No status";
        if (!includeCompleted && isCompletedStatus(statusName)) return;
        const normalized = normalizeStatusName(statusName);
        const known = knownGroups.find(group => group.aliases.includes(normalized));
        if (known) {
            known.tickets.push(ticket);
        } else {
            if (!extraGroups.has(statusName)) extraGroups.set(statusName, []);
            extraGroups.get(statusName).push(ticket);
        }
    });

    const groupsToRender = [
        ...knownGroups,
        ...[...extraGroups.entries()].map(([label, groupTickets]) => ({ label, tickets: groupTickets, aliases: [normalizeStatusName(label)] }))
    ];

    groupsToRender.forEach(groupData => {
        groupData.tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const section = document.createElement("section");
        section.className = `tickets-status-group today-status-group status-${normalizeStatusClass(groupData.label)}`;
        section.dataset.statusGroup = normalizeStatusClass(groupData.label);

        const groupKey = normalizeStatusClass(groupData.label);
        const isCollapsed = collapsedStatusGroups[context].has(groupKey);

        const heading = document.createElement("button");
        heading.type = "button";
        heading.className = "tickets-status-group-heading today-status-group-toggle";
        heading.setAttribute("aria-expanded", String(!isCollapsed));
        heading.setAttribute("aria-label", `${isCollapsed ? "Expand" : "Collapse"} ${groupData.label} tickets`);

        const title = document.createElement("h3");
        title.textContent = groupData.label;
        const count = document.createElement("span");
        count.className = "today-status-count";
        count.textContent = String(groupData.tickets.length);
        const chevron = document.createElement("span");
        chevron.className = "today-status-chevron";
        chevron.textContent = isCollapsed ? "+" : "−";
        chevron.setAttribute("aria-hidden", "true");
        heading.append(title, count, chevron);

        const body = document.createElement("div");
        body.className = "today-status-group-body";
        body.hidden = isCollapsed;

        if (groupData.tickets.length) {
            const columnHeadings = document.createElement("div");
            columnHeadings.className = "today-ticket-columns";
            ["Ticket number", "Title", "User", "Created at", "Status", "Priority", "Actions"].forEach(label => {
                const cell = document.createElement("span");
                cell.textContent = label;
                columnHeadings.appendChild(cell);
            });
            body.appendChild(columnHeadings);
        }

        const list = document.createElement("div");
        list.className = "today-ticket-list";
        if (groupData.tickets.length) {
            groupData.tickets.forEach(ticket => list.appendChild(createTodayTicketCard(ticket)));
        } else {
            const empty = document.createElement("p");
            empty.className = "today-status-empty";
            empty.textContent = context === "pending" ? "No pending tickets" : "No tickets";
            list.appendChild(empty);
        }

        const draftHost = document.createElement("div");
        draftHost.className = "today-ticket-draft-host";
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "today-add-ticket-button";
        addButton.textContent = "+ New ticket";
        addButton.addEventListener("click", () => {
            const existingDraft = draftHost.querySelector(".today-ticket-draft-row");
            if (existingDraft) {
                existingDraft.querySelector("input")?.focus();
                return;
            }
            const draft = createDraftTicketRow(groupData, context);
            draftHost.appendChild(draft);
            draft.querySelector(".today-ticket-title")?.focus();
        });
        draftHost.appendChild(addButton);

        body.append(list, draftHost);
        heading.addEventListener("click", () => {
            const nextCollapsed = !body.hidden;
            body.hidden = nextCollapsed;
            heading.setAttribute("aria-expanded", String(!nextCollapsed));
            heading.setAttribute("aria-label", `${nextCollapsed ? "Expand" : "Collapse"} ${groupData.label} tickets`);
            chevron.textContent = nextCollapsed ? "+" : "−";
            if (nextCollapsed) collapsedStatusGroups[context].add(groupKey);
            else collapsedStatusGroups[context].delete(groupKey);
        });

        section.append(heading, body);
        container.appendChild(section);
    });
}

function showNotification(message, type = "info") {
    const container = document.getElementById("notificationContainer");
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.setAttribute("role", type === "error" ? "alert" : "status");

    const icon = document.createElement("span");
    icon.className = "notification-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ({ success: "✓", error: "!", warning: "⚠", info: "i" })[type] || "i";

    const text = document.createElement("span");
    text.className = "notification-message";
    text.textContent = message;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "notification-close";
    close.setAttribute("aria-label", "Dismiss notification");
    close.textContent = "×";
    close.addEventListener("click", () => notification.remove());

    notification.append(icon, text, close);
    container.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add("notification-visible"));
    window.setTimeout(() => {
        notification.classList.remove("notification-visible");
        window.setTimeout(() => notification.remove(), 220);
    }, 4200);
}

function openDeleteTicketModal(ticket) {
    const modal = document.getElementById("deleteTicketModal");
    const message = document.getElementById("deleteTicketModalMessage");
    const confirmButton = document.getElementById("confirmDeleteTicketButton");
    if (!modal || !message || !confirmButton) {
        showNotification("Delete confirmation dialog is unavailable.", "error");
        return;
    }

    ticketPendingDeletion = ticket;
    message.textContent = "Are you sure you want to delete this ticket?";
    confirmButton.disabled = false;
    confirmButton.textContent = "Delete ticket";
    modal.classList.remove("hidden");
    confirmButton.focus();
}

function closeDeleteTicketModal() {
    const modal = document.getElementById("deleteTicketModal");
    if (modal) modal.classList.add("hidden");
    ticketPendingDeletion = null;
}

async function confirmDeleteTicket() {
    if (!ticketPendingDeletion) return;

    const ticket = ticketPendingDeletion;
    const confirmButton = document.getElementById("confirmDeleteTicketButton");
    confirmButton.disabled = true;
    confirmButton.textContent = "Deleting…";

    try {
        await deleteTicket(ticket.id);
        closeDeleteTicketModal();
        showNotification("Ticket deleted.", "success");
        await Promise.all([loadTodayTickets(), loadPendingTickets()]);
        if (activeView === "all") await loadAllTickets();
        if (activeView === "by-day") await loadTicketsByDay();
    } catch (error) {
        console.error("Could not delete ticket:", error);
        confirmButton.disabled = false;
        confirmButton.textContent = "Delete ticket";
        showNotification(error.message || "Could not delete the ticket. Please try again.", "error");
    }
}

const deleteTicketModal = document.getElementById("deleteTicketModal");
document.getElementById("closeDeleteTicketModal")?.addEventListener("click", closeDeleteTicketModal);
document.getElementById("cancelDeleteTicketButton")?.addEventListener("click", closeDeleteTicketModal);
document.getElementById("confirmDeleteTicketButton")?.addEventListener("click", confirmDeleteTicket);
deleteTicketModal?.addEventListener("click", event => {
    if (event.target === deleteTicketModal) closeDeleteTicketModal();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && deleteTicketModal && !deleteTicketModal.classList.contains("hidden")) {
        closeDeleteTicketModal();
    }
});

async function loadTodayTickets() {
    todayTicketsContainer.innerHTML = '<p class="tickets-loading">Loading today\'s tickets…</p>';
    try {
        if (!availableTicketStatuses.length) {
            availableTicketStatuses = getCanonicalTicketStatuses(await getTicketStatuses());
        }
        if (!availablePriorities.length) {
            availablePriorities = await getPriorities();
        }
        const tickets = await getAllTicketsForDate(getLocalDateString());
        renderStatusGroups(todayTicketsContainer, tickets, "today", { includeCompleted: true });
    } catch (error) {
        console.error(error);
        todayTicketsContainer.innerHTML = '<p class="tickets-error-message">Could not load today\'s tickets. Please try again.</p>';
    }
}

async function loadPendingTickets() {
    pendingTicketsContainer.innerHTML = '<p class="tickets-loading">Loading pending tickets…</p>';
    try {
        if (!availableTicketStatuses.length) {
            availableTicketStatuses = getCanonicalTicketStatuses(await getTicketStatuses());
        }
        if (!availablePriorities.length) {
            availablePriorities = await getPriorities();
        }
        const allTickets = await getAllTickets();
        // Pending Tickets is the complete open-work list, including tickets created today.
        const pendingTickets = allTickets.filter(ticket => !isCompletedStatus(ticket.status?.name || ""));
        renderStatusGroups(pendingTicketsContainer, pendingTickets, "pending", { includeCompleted: false });
    } catch (error) {
        console.error(error);
        pendingTicketsContainer.innerHTML = '<p class="tickets-error-message">Could not load pending tickets. Please try again.</p>';
    }
}

async function loadAllTickets() {
    try {
        const data = await getTickets(currentPage, limit, filters);
        renderTickets(data.items || []);
        const pages = data.pages || 0;
        pageInfo.textContent = `Page ${data.page} of ${pages}`;
        previousPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = pages === 0 || currentPage >= pages;
    } catch (error) {
        console.error(error);
        ticketsContainer.innerHTML = '<tr><td colspan="9" class="tickets-empty-cell">Could not load tickets. Please try again.</td></tr>';
    }
}

function formatDayHeading(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function getTicketLocalDate(ticket) {
    if (!ticket.created_at) return "Unknown date";
    const date = new Date(ticket.created_at);
    return Number.isNaN(date.getTime()) ? "Unknown date" : getLocalDateString(date);
}

function renderTicketsByDayIndex(tickets) {
    byDayListContainer.innerHTML = "";
    const days = new Map();
    tickets.forEach(ticket => {
        const dateKey = getTicketLocalDate(ticket);
        if (!days.has(dateKey)) days.set(dateKey, []);
        days.get(dateKey).push(ticket);
    });

    if (!days.size) {
        byDayListContainer.innerHTML = '<p class="tickets-empty-message">No tickets have been created yet.</p>';
        return;
    }

    [...days.entries()]
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .forEach(([dateKey, dayTickets]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "tickets-by-day-item";

            const copy = document.createElement("span");
            copy.className = "tickets-by-day-copy";
            const title = document.createElement("span");
            title.className = "tickets-by-day-date";
            title.textContent = dateKey === "Unknown date" ? dateKey : formatDayHeading(dateKey);
            const subtitle = document.createElement("span");
            subtitle.className = "tickets-by-day-subtitle";
            subtitle.textContent = "View tickets created on this day";
            copy.append(title, subtitle);

            const count = document.createElement("span");
            count.className = "tickets-by-day-count";
            count.innerHTML = `<strong>${dayTickets.length}</strong><span>ticket${dayTickets.length === 1 ? "" : "s"}</span>`;
            const arrow = document.createElement("span");
            arrow.className = "tickets-by-day-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "›";
            button.append(copy, count, arrow);
            button.addEventListener("click", () => {
                selectedDayDate = dateKey;
                loadTicketsByDay();
            });
            byDayListContainer.appendChild(button);
        });
}

async function loadTicketsByDay() {
    const showingDayDetail = Boolean(selectedDayDate);
    if (showingDayDetail) {
        byDayIndexView.hidden = true;
        byDayDetailView.hidden = false;
        selectedDayTitle.textContent = selectedDayDate === "Unknown date" ? selectedDayDate : formatDayHeading(selectedDayDate);
        groupedTicketsContainer.innerHTML = '<p class="tickets-loading">Loading tickets…</p>';
    } else {
        byDayIndexView.hidden = false;
        byDayDetailView.hidden = true;
        byDayListContainer.innerHTML = '<p class="tickets-loading">Loading days…</p>';
    }

    try {
        if (!availableTicketStatuses.length) {
            availableTicketStatuses = getCanonicalTicketStatuses(await getTicketStatuses());
        }
        if (!availablePriorities.length) {
            availablePriorities = await getPriorities();
        }
        const allTickets = await getAllTickets();
        if (!selectedDayDate) {
            renderTicketsByDayIndex(allTickets);
            return;
        }
        const dayTickets = allTickets.filter(ticket => getTicketLocalDate(ticket) === selectedDayDate);
        renderStatusGroups(groupedTicketsContainer, dayTickets, "day", { includeCompleted: true });
    } catch (error) {
        console.error(error);
        if (showingDayDetail) {
            groupedTicketsContainer.innerHTML = '<p class="tickets-error-message">Could not load tickets for this day. Please try again.</p>';
        } else {
            byDayListContainer.innerHTML = '<p class="tickets-error-message">Could not load ticket history. Please try again.</p>';
        }
    }
}

function switchView(view) {
    activeView = view;
    document.querySelectorAll(".tickets-tab").forEach(tab => {
        const selected = tab.dataset.view === view;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
    });

    todayView.hidden = view !== "today";
    byDayView.hidden = view !== "by-day";
    allTicketsView.hidden = view !== "all";
    ticketsTableContainer.hidden = view !== "all";
    pagination.hidden = view !== "all";
    filtersContainer.hidden = view !== "all";

    const labels = { today: "Today's Tickets", "by-day": "Tickets by Day", all: "All Tickets" };
    ticketsViewLabel.textContent = labels[view];

    if (view === "today") { loadTodayTickets(); loadPendingTickets(); }
    if (view === "by-day") loadTicketsByDay();
    if (view === "all") loadAllTickets();
}

// =========================
// PAGINATION
// =========================
previousPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadAllTickets();
    }
});

nextPageButton.addEventListener("click", () => {
    currentPage++;
    loadAllTickets();
});

// =========================
// FILTERS (ALL TICKETS)
// =========================
applyFiltersButton.addEventListener("click", applyFilters);
clearFiltersButton.addEventListener("click", clearFilters);

[ticketNumberFilter, userNameFilter].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") applyFilters();
    });
});

function applyFilters() {
    currentPage = 1;
    filters = {
        status_id: statusFilter.value,
        issue_type_id: issueTypeFilter.value,
        priority_id: priorityFilter.value,
        queue_id: queueFilter.value,
        tool_id: toolFilter.value,
        location_id: locationFilter.value,
        ticket_number: ticketNumberFilter.value.trim(),
        user_name: userNameFilter.value.trim(),
        ticket_date: ticketDateFilter.value
    };
    loadAllTickets();
}

function clearFilters() {
    [statusFilter, issueTypeFilter, priorityFilter, queueFilter, toolFilter, locationFilter,
        ticketNumberFilter, userNameFilter, ticketDateFilter].forEach(input => input.value = "");
    filters = {};
    currentPage = 1;
    loadAllTickets();
}

// =========================
// FILTER DROPDOWNS
// =========================
async function populateSelect(selectElement, loader, labelProperty = "name") {
    try {
        const items = await loader();
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item[labelProperty];
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadStatuses() { await populateSelect(statusFilter, getTicketStatuses); }
async function loadIssueTypes() { await populateSelect(issueTypeFilter, getIssueTypes); }
async function loadPriorities() { await populateSelect(priorityFilter, getPriorities); }
async function loadQueues() { await populateSelect(queueFilter, getQueues); }
async function loadTools() { await populateSelect(toolFilter, getTools); }
async function loadLocations() { await populateSelect(locationFilter, getLocations); }

// =========================
// NEW TICKET — AVAILABLE IN EVERY TAB
// =========================
document.getElementById("newTicketButton").addEventListener("click", () => {
    window.location.href = "ticket-detail.html?new=true";
});

document.querySelectorAll(".tickets-tab").forEach(tab => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
});

if (backToDaysButton) {
    backToDaysButton.addEventListener("click", () => {
        selectedDayDate = null;
        loadTicketsByDay();
    });
}

// =========================
// INITIAL LOAD
// =========================
async function initialize() {
    await Promise.all([
        loadStatuses(), loadIssueTypes(), loadPriorities(), loadQueues(), loadTools(), loadLocations()
    ]);
    switchView("today");
}

initialize();
