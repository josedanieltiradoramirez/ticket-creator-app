function renderFormSection({
    containerId,
    form,
    actions = {},
    expanded = true,
    onAdd = null,
    onCreate = null,
    onChange = null,
    onEdit = null,
    onRemove = null
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Form section container "${containerId}" not found.`
        );
        return;
    }

    /*
     * PRESERVE EXPANDED STATE
     * ----------------------------------------
     * If the Form section already exists, keep
     * its current open/closed state.
     */
    let currentExpanded = expanded;

    const existingHeader =
        container.querySelector(
            ".collapsible-section-header"
        );

    if (existingHeader) {
        currentExpanded =
            existingHeader.getAttribute(
                "aria-expanded"
            ) === "true";
    }

    const {
        add = true,
        create = true,
        change = true,
        edit = true,
        remove = true
    } = actions;

    const headerActions = [];

    /*
     * NO FORM
     * ----------------------------------------
     * Mostrar:
     * - Add Form
     * - Create Form
     */
    if (!form) {
        if (add) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionAddButton"
                >
                    + Add Form
                </button>
            `);
        }

        if (create) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionCreateButton"
                >
                    Create Form
                </button>
            `);
        }
    }

    /*
     * FORM EXISTS
     * ----------------------------------------
     * Mostrar según permissions:
     * - Change
     * - Edit
     * - Remove
     * - Create Form
     */
    else {
        if (change) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionChangeButton"
                >
                    Change
                </button>
            `);
        }

        if (edit) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionEditButton"
                >
                    Edit
                </button>
            `);
        }

        if (remove) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionRemoveButton"
                >
                    Remove
                </button>
            `);
        }

        if (create) {
            headerActions.push(`
                <button
                    type="button"
                    id="formSectionCreateButton"
                >
                    Create Form
                </button>
            `);
        }
    }

    /*
     * FORM CONTENT
     */
    const content = `
        <div class="form-section-content">
            ${
                form
                    ? `
                        <div class="form-section-row">
                            <div class="form-section-label">
                                Name
                            </div>

                            <div class="form-section-value">
                                ${escapeFormHtml(
                                    form.name || "-"
                                )}
                            </div>
                        </div>

                        <div class="form-section-row">
                            <div class="form-section-label">
                                Information Needed
                            </div>

                            <div class="form-section-value form-section-description">${escapeFormHtml(
                                (form.description || "-").trim()
                            )}</div>
                        </div>
                    `
                    : `
                        <div class="form-section-empty">
                            No form assigned.
                        </div>
                    `
            }
        </div>
    `;

    /*
     * RENDER COLLAPSIBLE SECTION
     */
    renderCollapsibleSection({
        containerId: containerId,
        title: "Form",
        content: content,
        expanded: currentExpanded,
        headerActions: headerActions.join("")
    });

    /*
     * ADD
     */
    const addButton =
        document.getElementById(
            "formSectionAddButton"
        );

    if (addButton && onAdd) {
        addButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onAdd();
            }
        );
    }

    /*
     * CREATE
     */
    const createButton =
        document.getElementById(
            "formSectionCreateButton"
        );

    if (createButton && onCreate) {
        createButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onCreate();
            }
        );
    }

    /*
     * CHANGE
     */
    const changeButton =
        document.getElementById(
            "formSectionChangeButton"
        );

    if (changeButton && onChange) {
        changeButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onChange();
            }
        );
    }

    /*
     * EDIT
     */
    const editButton =
        document.getElementById(
            "formSectionEditButton"
        );

    if (editButton && onEdit) {
        editButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onEdit();
            }
        );
    }

    /*
     * REMOVE
     */
    const removeButton =
        document.getElementById(
            "formSectionRemoveButton"
        );

    if (removeButton && onRemove) {
        removeButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onRemove();
            }
        );
    }
}


function escapeFormHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}