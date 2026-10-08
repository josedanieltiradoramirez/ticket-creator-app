// ============================================================
// ISSUE TYPES LIST
// ============================================================

let issueTypes = [];

let forms = [];

let editingIssueTypeId = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        renderPageHeader();

        setupEventListeners();

        await loadIssueTypes();

    }
);


// ============================================================
// PAGE HEADER
// ============================================================

function renderPageHeader() {

    renderDetailHeader({
        containerId: "pageHeader",
        type: "Administration",
        title: "Issue Types",
        description:
            "Manage and configure issue types used by the ticketing system.",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {

            window.location.href =
                "index.html";

        }
    });

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    const addButton =
        document.getElementById(
            "addIssueTypeButton"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            openCreateModal
        );

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderIssueTypes
        );

    }

}


// ============================================================
// LOAD ISSUE TYPES
// ============================================================

async function loadIssueTypes() {

    try {

        const [
            loadedIssueTypes,
            loadedForms
        ] = await Promise.all([
            getIssueTypes(),
            getForms()
        ]);

        issueTypes =
            loadedIssueTypes || [];

        forms =
            loadedForms || [];

        renderIssueTypes();

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );

        showErrorMessage(
            "Error loading issue types."
        );

    }

}


// ============================================================
// RENDER ISSUE TYPES
// ============================================================

function renderIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );

    const emptyState =
        document.getElementById(
            "issueTypesEmptyState"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!tableBody) {
        return;
    }


    const search =
        String(
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredIssueTypes =
        issueTypes.filter(
            issueType => {

                const name =
                    String(
                        issueType.name || ""
                    )
                        .toLowerCase();

                const category =
                    String(
                        issueType.category || ""
                    )
                        .toLowerCase();

                const displayName =
                    String(
                        issueType.display_name || ""
                    )
                        .toLowerCase();

                const searchKeywords =
                    String(
                        issueType.search_keywords || ""
                    )
                        .toLowerCase();


                return (
                    name.includes(search) ||
                    category.includes(search) ||
                    displayName.includes(search) ||
                    searchKeywords.includes(search)
                );

            }
        );


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (
        filteredIssueTypes.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "list-page-hidden"
            );

        }

        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "list-page-hidden"
        );

    }


    // ========================================================
    // TABLE ROWS
    // ========================================================

    filteredIssueTypes.forEach(
        issueType => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <div class="list-page-primary-value">

                        ${escapeIssueTypeHtml(
                            issueType.name || "-"
                        )}

                    </div>

                </td>


                <td>

                    ${escapeIssueTypeHtml(
                        issueType.category || "-"
                    )}

                </td>


                <td>

                    ${
                        issueType.display_name
                            ? escapeIssueTypeHtml(
                                issueType.display_name
                            )
                            : "-"
                    }

                </td>


                <td>

                    ${
                        (() => {
                            const form =
                                forms.find(
                                    item =>
                                        String(item.id) ===
                                        String(
                                            issueType.form_template_id
                                        )
                                );

                            return form
                                ? escapeIssueTypeHtml(form.name)
                                : "None";
                        })()
                    }

                </td>


                <td>

                    <span
                        class="
                            list-page-status
                            ${
                                issueType.is_active
                                    ? "list-page-status-active"
                                    : "list-page-status-inactive"
                            }
                        "
                    >

                        ${
                            issueType.is_active
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </td>


                <td>

                    <div class="list-page-row-actions">

                        <button
                            type="button"
                            class="list-page-action-button"
                            data-action="view"
                            data-id="${issueType.id}"
                        >
                            View
                        </button>


                        <button
                            type="button"
                            class="list-page-action-button"
                            data-action="edit"
                            data-id="${issueType.id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="
                                list-page-action-button
                                list-page-remove-button
                            "
                            data-action="remove"
                            data-id="${issueType.id}"
                        >
                            Remove
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    setupRowActionListeners();

}


// ============================================================
// ROW ACTION LISTENERS
// ============================================================

function setupRowActionListeners() {

    const buttons =
        document.querySelectorAll(
            ".list-page-action-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const issueTypeId =
                        Number(
                            button.dataset.id
                        );


                    if (!issueTypeId) {
                        return;
                    }


                    switch (action) {

                        case "view":

                            openIssueTypeDetail(
                                issueTypeId
                            );

                            break;


                        case "edit":

                            openEditModal(
                                issueTypeId
                            );

                            break;


                        case "remove":

                            openRemoveModal(
                                issueTypeId
                            );

                            break;

                    }

                }
            );

        }
    );

}


// ============================================================
// CREATE MODAL
// ============================================================

async function openCreateModal() {

    editingIssueTypeId =
        null;


    try {

        const forms =
            await getForms();


        renderIssueTypeFormModal({
            mode: "create",
            issueType: null,
            forms: forms || []
        });

    } catch (error) {

        console.error(
            "Error loading forms:",
            error
        );

        showErrorMessage(
            "Error loading forms."
        );

    }

}


// ============================================================
// EDIT MODAL
// ============================================================

async function openEditModal(
    issueTypeId
) {

    try {

        const [
            issueType,
            forms
        ] = await Promise.all([

            getIssueType(
                issueTypeId
            ),

            getForms()

        ]);


        editingIssueTypeId =
            issueTypeId;


        renderIssueTypeFormModal({

            mode: "edit",

            issueType:
                issueType,

            forms:
                forms || []

        });


    } catch (error) {

        console.error(
            "Error loading issue type:",
            error
        );

        showErrorMessage(
            "Error loading Issue Type or Forms."
        );

    }

}


// ============================================================
// ISSUE TYPE FORM MODAL
// ============================================================

function renderIssueTypeFormModal({
    mode,
    issueType,
    forms = []
}) {

    const isEdit =
        mode === "edit";


    const title =
        isEdit
            ? "Edit Issue Type"
            : "New Issue Type";


    const currentFormId =
        issueType?.form_template_id
            ? String(
                issueType.form_template_id
            )
            : "";


    const formOptions =
        forms
            .map(
                form => {

                    const selected =
                        String(form.id) ===
                        currentFormId
                            ? "selected"
                            : "";


                    return `

                        <option
                            value="${form.id}"
                            ${selected}
                        >
                            ${escapeIssueTypeHtml(
                                form.name || `Form ${form.id}`
                            )}
                        </option>

                    `;

                }
            )
            .join("");


    const content = `

        <form
            id="issueTypeForm"
            class="list-page-form"
        >

            <!-- ====================================================
                 NAME
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeName">
                    Name
                </label>

                <input
                    type="text"
                    id="issueTypeName"
                    value="${escapeIssueTypeAttribute(
                        issueType?.name || ""
                    )}"
                    required
                >

            </div>


            <!-- ====================================================
                 DESCRIPTION
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeDescription">
                    Description
                </label>

                <textarea
                    id="issueTypeDescription"
                    rows="5"
                    required
                >${escapeIssueTypeHtml(
                    issueType?.description || ""
                )}</textarea>

            </div>


            <!-- ====================================================
                 CATEGORY
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeCategory">
                    Category
                </label>

                <input
                    type="text"
                    id="issueTypeCategory"
                    value="${escapeIssueTypeAttribute(
                        issueType?.category || ""
                    )}"
                    required
                >

            </div>


            <!-- ====================================================
                 DISPLAY NAME
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeDisplayName">
                    Display Name
                </label>

                <input
                    type="text"
                    id="issueTypeDisplayName"
                    value="${escapeIssueTypeAttribute(
                        issueType?.display_name || ""
                    )}"
                >

            </div>


            <!-- ====================================================
                 SEARCH KEYWORDS
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeSearchKeywords">
                    Search Keywords
                </label>

                <input
                    type="text"
                    id="issueTypeSearchKeywords"
                    value="${escapeIssueTypeAttribute(
                        issueType?.search_keywords || ""
                    )}"
                    placeholder="Example: password, reset, AD"
                >

            </div>


            <!-- ====================================================
                 FORM TEMPLATE
            ================================================= -->

            <div class="list-page-form-group">

                <label for="issueTypeFormTemplate">
                    Form Template
                </label>

                <select
                    id="issueTypeFormTemplate"
                >

                    <option value="">
                        No Form
                    </option>

                    ${formOptions}

                </select>

            </div>


            <!-- ====================================================
                 STATUS
            ================================================= -->

            <div class="list-page-checkbox-group">

                <input
                    type="checkbox"
                    id="issueTypeIsActive"
                    ${
                        issueType
                            ? issueType.is_active
                                ? "checked"
                                : ""
                            : "checked"
                    }
                >

                <label for="issueTypeIsActive">
                    Active
                </label>

            </div>


            <!-- ====================================================
                 ACTIONS
            ================================================= -->

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="issueTypeCancelButton"
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="primary-button"
                    id="issueTypeSaveButton"
                >
                    ${
                        isEdit
                            ? "Save Changes"
                            : "Create Issue Type"
                    }
                </button>

            </div>

        </form>

    `;


    renderModal({
        containerId: "issueTypeModal",
        title: title,
        content: content,
        onClose: closeModal
    });


    const modal =
        document.getElementById(
            "issueTypeModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    // ========================================================
    // CANCEL
    // ========================================================

    const cancelButton =
        modal.querySelector(
            "#issueTypeCancelButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    // ========================================================
    // FORM SUBMIT
    // ========================================================

    const form =
        modal.querySelector(
            "#issueTypeForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveIssueType
        );

    }

}


// ============================================================
// SAVE ISSUE TYPE
// ============================================================

async function saveIssueType(
    event
) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "issueTypeSaveButton"
        );


    const issueTypeData = {

        name:
            document.getElementById(
                "issueTypeName"
            ).value.trim(),

        description:
            document.getElementById(
                "issueTypeDescription"
            ).value.trim(),

        category:
            document.getElementById(
                "issueTypeCategory"
            ).value.trim(),

        display_name:
            document.getElementById(
                "issueTypeDisplayName"
            ).value.trim() ||
            null,

        search_keywords:
            document.getElementById(
                "issueTypeSearchKeywords"
            ).value.trim() ||
            null,

        form_template_id:
            document.getElementById(
                "issueTypeFormTemplate"
            ).value
                ? Number(
                    document.getElementById(
                        "issueTypeFormTemplate"
                    ).value
                )
                : null,

        is_active:
            document.getElementById(
                "issueTypeIsActive"
            ).checked

    };


    if (
        !issueTypeData.name ||
        !issueTypeData.description ||
        !issueTypeData.category
    ) {

        showWarningMessage(
            "Please complete all required fields."
        );

        return;

    }


    if (saveButton) {

        saveButton.disabled =
            true;

    }


    try {

        if (
            editingIssueTypeId === null
        ) {

            await createIssueType(
                issueTypeData
            );


            showSuccessMessage(
                "Issue type created successfully."
            );

        } else {

            await updateIssueType(
                editingIssueTypeId,
                issueTypeData
            );


            showSuccessMessage(
                "Issue type updated successfully."
            );

        }


        closeModal();

        await loadIssueTypes();


    } catch (error) {

        console.error(
            "Error saving issue type:",
            error
        );

        showErrorMessage(
            "Error saving issue type."
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

        }

    }

}


// ============================================================
// REMOVE MODAL
// ============================================================

function openRemoveModal(
    issueTypeId
) {

    const issueType =
        issueTypes.find(
            item =>
                Number(item.id) ===
                Number(issueTypeId)
        );


    if (!issueType) {
        return;
    }


    const content = `

        <div class="list-page-confirmation">

            <p class="list-page-confirmation-message">

                Are you sure you want to remove
                <strong>
                    ${escapeIssueTypeHtml(
                        issueType.name
                    )}
                </strong>
                ?

            </p>


            <p class="list-page-confirmation-description">

                This action will remove the Issue Type
                from the system.

            </p>


            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="removeCancelButton"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="danger-button"
                    id="removeConfirmButton"
                >
                    Remove
                </button>

            </div>

        </div>

    `;


    renderModal({
        containerId: "issueTypeModal",
        title: "Remove Issue Type",
        content: content,
        onClose: closeModal
    });


    const modal =
        document.getElementById(
            "issueTypeModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    const cancelButton =
        modal.querySelector(
            "#removeCancelButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    const confirmButton =
        modal.querySelector(
            "#removeConfirmButton"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async () => {

                await removeIssueType(
                    issueTypeId
                );

            }
        );

    }

}


// ============================================================
// REMOVE ISSUE TYPE
// ============================================================

async function removeIssueType(
    issueTypeId
) {

    const confirmButton =
        document.getElementById(
            "removeConfirmButton"
        );


    if (confirmButton) {

        confirmButton.disabled =
            true;

    }


    try {

        await deleteIssueType(
            issueTypeId
        );


        closeModal();


        showSuccessMessage(
            "Issue type removed successfully."
        );


        await loadIssueTypes();


    } catch (error) {

        console.error(
            "Error removing issue type:",
            error
        );


        showErrorMessage(
            "Error removing issue type."
        );


        if (confirmButton) {

            confirmButton.disabled =
                false;

        }

    }

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    const modal =
        document.getElementById(
            "issueTypeModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.innerHTML = "";

}


// ============================================================
// OPEN DETAIL
// ============================================================

function openIssueTypeDetail(
    issueTypeId
) {

    window.location.href =
        `issue-type-detail.html?id=${issueTypeId}`;

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeIssueTypeHtml(
    value
) {

    return String(value ?? "")
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


function escapeIssueTypeAttribute(
    value
) {

    return escapeIssueTypeHtml(
        value
    );

}