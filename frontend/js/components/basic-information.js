// ============================================================
// BASIC INFORMATION COMPONENT
// ============================================================

function renderBasicInformationComponent({
    containerId,
    data,
    fields,
    onSave,
    expanded = true
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Basic Information container "${containerId}" not found.`
        );
        return;
    }

    let editMode = false;
    let currentExpanded = expanded;

    // ============================================================
    // RENDER
    // ============================================================

    function render() {
        const content = `
            <div class="basic-information">
                <div class="basic-information-header">
                    <div></div>
                    <div class="basic-information-actions">
                        ${
                            editMode
                                ? `
                                    <button
                                        type="button"
                                        class="basic-information-button secondary"
                                        id="basicInformationCancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        class="basic-information-button primary"
                                        id="basicInformationSave"
                                    >
                                        Save
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="basic-information-button secondary"
                                        id="basicInformationEdit"
                                    >
                                        Edit
                                    </button>
                                `
                        }
                    </div>
                </div>
                <div class="basic-information-content">
                    ${renderFields()}
                </div>
            </div>
        `;

        renderCollapsibleSection({
            containerId: containerId,
            title: "Basic Information",
            content: content,
            expanded: currentExpanded
        });

        setupEvents();
    }

    // ============================================================
    // FIELDS
    // ============================================================

    function renderFields() {
        return fields
            .map(field => {
                const value = data[field.key];

                if (editMode) {
                    return renderEditField(field, value);
                }

                return renderReadField(field, value);
            })
            .join("");
    }

    // ============================================================
    // READ FIELD
    // ============================================================

    function renderReadField(field, value) {
        let displayValue = value;

        if (field.type === "boolean") {
            displayValue = value
                ? `
                    <span class="basic-information-status active">
                        Active
                    </span>
                `
                : `
                    <span class="basic-information-status inactive">
                        Inactive
                    </span>
                `;
        }

        if (field.type === "select") {
            const option =
                (field.options || []).find(
                    option =>
                        String(option.value) ===
                        String(value ?? "")
                );

            displayValue = option
                ? escapeHtml(option.label)
                : "-";
        }

        if (field.type === "textarea") {
            displayValue = String(displayValue ?? "").trim();
        }

        if (
            displayValue === null ||
            displayValue === undefined ||
            displayValue === ""
        ) {
            displayValue = "-";
        }

        const valueClass =
            field.type === "textarea"
                ? "basic-information-value basic-information-description"
                : "basic-information-value";

        return `
            <div class="basic-information-row">
                <div class="basic-information-label">
                    ${escapeHtml(field.label)}
                </div>
                <div class="${valueClass}">${ 
                    field.type === "textarea"
                        ? escapeHtml(displayValue)
                        : displayValue
                }</div>
            </div>
        `;
    }

    // ============================================================
    // EDIT FIELD
    // ============================================================

    function renderEditField(field, value) {
        // ========================================================
        // READONLY
        // ========================================================

        if (field.readonly) {
            return `
                <div class="basic-information-row">
                    <div class="basic-information-label">
                        ${escapeHtml(field.label)}
                    </div>
                    <div class="basic-information-value">
                        <span class="basic-information-readonly">
                            ${escapeHtml(value ?? "-")}
                        </span>
                    </div>
                </div>
            `;
        }

        // ========================================================
        // SELECT
        // ========================================================

        if (field.type === "select") {
            const options = field.options || [];
            const selectedValue = String(value ?? "");

            return `
                <div class="basic-information-row">
                    <label
                        class="basic-information-label"
                        for="basicInformationField_${field.key}"
                    >
                        ${escapeHtml(field.label)}
                    </label>
                    <div class="basic-information-value">
                        <select
                            id="basicInformationField_${field.key}"
                            class="basic-information-input"
                        >
                            ${options.map(option => `
                                <option
                                    value="${escapeHtmlAttribute(option.value)}"
                                    ${
                                        String(option.value) === selectedValue
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${escapeHtml(option.label)}
                                </option>
                            `).join("")}
                        </select>
                    </div>
                </div>
            `;
        }

        // ========================================================
        // BOOLEAN
        // ========================================================

        if (field.type === "boolean") {
            return `
                <div class="basic-information-row">
                    <label
                        class="basic-information-label"
                        for="basicInformationField_${field.key}"
                    >
                        ${escapeHtml(field.label)}
                    </label>
                    <div class="basic-information-value">
                        <select
                            id="basicInformationField_${field.key}"
                            class="basic-information-input"
                        >
                            <option
                                value="true"
                                ${value === true ? "selected" : ""}
                            >
                                Active
                            </option>
                            <option
                                value="false"
                                ${value === false ? "selected" : ""}
                            >
                                Inactive
                            </option>
                        </select>
                    </div>
                </div>
            `;
        }

        // ========================================================
        // TEXT
        // ========================================================

        return `
            <div class="basic-information-row">
                <label
                    class="basic-information-label"
                    for="basicInformationField_${field.key}"
                >
                    ${escapeHtml(field.label)}
                </label>
                <div class="basic-information-value">
                    <textarea
                        id="basicInformationField_${field.key}"
                        class="basic-information-input"
                        rows="1"
                    >${escapeHtmlAttribute(value ?? "")}</textarea>
                </div>
            </div>
        `;
    }

    function getCurrentExpandedState() {
        const header =
            container.querySelector(
                ".collapsible-section-header"
            );

        if (!header) {
            return currentExpanded;
        }

        return (
            header.getAttribute("aria-expanded") === "true"
        );
    }

    // ============================================================
    // EVENTS
    // ============================================================

    function setupEvents() {
        const editButton =
            document.getElementById(
                "basicInformationEdit"
            );

        const saveButton =
            document.getElementById(
                "basicInformationSave"
            );

        const cancelButton =
            document.getElementById(
                "basicInformationCancel"
            );

        const textareas =
            container.querySelectorAll("textarea");

        // ========================================================
        // TEXTAREA AUTO HEIGHT
        // ========================================================

        textareas.forEach(textarea => {
            textarea.addEventListener(
                "input",
                () => {
                    textarea.style.height = "auto";
                    textarea.style.height =
                        `${textarea.scrollHeight}px`;
                }
            );

            textarea.style.height = "auto";
            textarea.style.height =
                `${textarea.scrollHeight}px`;
        });

        // ========================================================
        // EDIT
        // ========================================================

        if (editButton) {
            editButton.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();

                    currentExpanded =
                        getCurrentExpandedState();

                    editMode = true;

                    render();
                }
            );
        }

        // ========================================================
        // CANCEL
        // ========================================================

        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();

                    currentExpanded =
                        getCurrentExpandedState();

                    editMode = false;

                    render();
                }
            );
        }

        // ========================================================
        // SAVE
        // ========================================================

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                async (event) => {
                    event.stopPropagation();

                    const updatedData = {};

                    fields.forEach(field => {
                        const input =
                            document.getElementById(
                                `basicInformationField_${field.key}`
                            );

                        if (!input) {
                            return;
                        }

                        if (field.type === "boolean") {
                            updatedData[field.key] =
                                input.value === "true";
                        } else {
                            updatedData[field.key] =
                                input.value;
                        }
                    });

                    saveButton.disabled = true;
                    saveButton.textContent = "Saving...";

                    try {
                        await onSave(updatedData);

                        Object.assign(
                            data,
                            updatedData
                        );

                        currentExpanded =
                            getCurrentExpandedState();

                        editMode = false;

                        render();
                    } catch (error) {
                        console.error(
                            "Error saving Basic Information:",
                            error
                        );

                        saveButton.disabled = false;
                        saveButton.textContent = "Save";

                        showErrorMessage(
                            "Error saving changes."
                        );
                    }
                }
            );
        }
    }

    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeHtmlAttribute(value) {
        return escapeHtml(value);
    }

    // ============================================================
    // INITIAL RENDER
    // ============================================================

    render();
}