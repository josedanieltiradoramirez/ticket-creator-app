// ============================================================
// BASIC INFORMATION COMPONENT
// ============================================================

function renderBasicInformationComponent({
    containerId,
    data,
    fields,
    onSave
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Basic Information container "${containerId}" not found.`);
        return;
    }

    let editMode = false;

    function render() {
        container.innerHTML = `
            <section class="basic-information">
                <div class="basic-information-header">
                    <h2>Basic Information</h2>

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
            </section>
        `;

        setupEvents();
    }

    function renderFields() {
        return fields.map(field => {
            const value = data[field.key];

            if (editMode) {
                return renderEditField(field, value);
            }

            return renderReadField(field, value);
        }).join("");
    }

    function renderReadField(field, value) {
        let displayValue = value;

        if (field.type === "boolean") {
            displayValue = value
                ? `<span class="basic-information-status active">Active</span>`
                : `<span class="basic-information-status inactive">Inactive</span>`;
        }

        if (displayValue === null || displayValue === undefined || displayValue === "") {
            displayValue = "-";
        }

        return `
            <div class="basic-information-row">
                <div class="basic-information-label">
                    ${field.label}
                </div>

                <div class="basic-information-value">
                    ${displayValue}
                </div>
            </div>
        `;
    }

    function renderEditField(field, value) {
        if (field.readonly) {
            return `
                <div class="basic-information-row">
                    <div class="basic-information-label">
                        ${field.label}
                    </div>

                    <div class="basic-information-value">
                        <span class="basic-information-readonly">
                            ${value ?? "-"}
                        </span>
                    </div>
                </div>
            `;
        }

        if (field.type === "boolean") {
            return `
                <div class="basic-information-row">
                    <label
                        class="basic-information-label"
                        for="basicInformationField_${field.key}"
                    >
                        ${field.label}
                    </label>

                    <div class="basic-information-value">
                        <select
                            id="basicInformationField_${field.key}"
                            class="basic-information-input"
                        >
                            <option value="true" ${value === true ? "selected" : ""}>
                                Active
                            </option>

                            <option value="false" ${value === false ? "selected" : ""}>
                                Inactive
                            </option>
                        </select>
                    </div>
                </div>
            `;
        }

        return `
            <div class="basic-information-row">
                <label
                    class="basic-information-label"
                    for="basicInformationField_${field.key}"
                >
                    ${field.label}
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

    function setupEvents() {
        const editButton = document.getElementById("basicInformationEdit");
        const saveButton = document.getElementById("basicInformationSave");
        const cancelButton = document.getElementById("basicInformationCancel");
        const textareas = container.querySelectorAll("textarea");

        textareas.forEach(textarea => {
            textarea.addEventListener("input", () => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            });

            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        });

        if (editButton) {
            editButton.addEventListener("click", () => {
                editMode = true;
                render();
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener("click", () => {
                editMode = false;
                render();
            });
        }

        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                const updatedData = {};

                fields.forEach(field => {
                    const input = document.getElementById(
                        `basicInformationField_${field.key}`
                    );

                    if (!input) {
                        return;
                    }

                    if (field.type === "boolean") {
                        updatedData[field.key] = input.value === "true";
                    } else {
                        updatedData[field.key] = input.value;
                    }
                });

                saveButton.disabled = true;
                saveButton.textContent = "Saving...";

                try {
                    await onSave(updatedData);

                    Object.assign(data, updatedData);

                    editMode = false;
                    render();

                } catch (error) {
                    console.error("Error saving Basic Information:", error);

                    saveButton.disabled = false;
                    saveButton.textContent = "Save";

                    alert("Error saving changes.");
                }
            });
        }
    }

    function escapeHtmlAttribute(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    render();
}