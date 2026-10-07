let formId = null;



let currentForm = null;



let relatedIssueTypes = [];





// ============================================================

// INITIALIZATION

// ============================================================



document.addEventListener(

    "DOMContentLoaded",

    async () => {



        const params =

            new URLSearchParams(

                window.location.search

            );





        formId =

            Number(

                params.get("id")

            );





        if (!formId) {



            showErrorMessage(

                "Invalid form ID."

            );



            window.location.href =

                "forms.html";



            return;



        }





        await loadForm();



        await loadRelatedIssueTypes();



    }

);





// ============================================================

// LOAD FORM

// ============================================================



async function loadForm() {



    try {



        currentForm =

            await getForm(

                formId

            );





        if (!currentForm) {



            showErrorMessage(

                "Form not found."

            );



            window.location.href =

                "forms.html";



            return;



        }





        renderFormHeader();



        renderFormBasicInformation();



    } catch (error) {



        console.error(

            "Error loading form:",

            error

        );





        showErrorMessage(

            "Error loading form."

        );





        window.location.href =

            "forms.html";



    }



}





// ============================================================

// DETAIL HEADER

// ============================================================



function renderFormHeader() {



    renderDetailHeader({



        containerId:

            "detailHeader",



        type:

            "Form",



        title:

            currentForm.name,



        actions: {



            back:

                true,



            edit:

                false



        },



        onBack: () => {



            window.location.href =

                "forms.html";



        }



    });



}





// ============================================================

// BASIC INFORMATION

// ============================================================



function renderFormBasicInformation() {



    renderBasicInformationComponent({



        containerId:

            "basicInformation",



        data:

            currentForm,



        fields: [



            {

                key:

                    "id",



                label:

                    "ID",



                type:

                    "text",



                readonly:

                    true



            },



            {

                key:

                    "name",



                label:

                    "Name",



                type:

                    "text"



            },



            {

                key:

                    "description",



                label:

                    "Information Needed",



                type:

                    "textarea"



            },



            {

                key:

                    "is_active",



                label:

                    "Status",



                type:

                    "boolean"



            }



        ],



        expanded:

            true,



        onSave:

            async (

                updatedData

            ) => {



                try {



                    const data = {



                        name:

                            updatedData.name,



                        description:

                            updatedData.description,



                        is_active:

                            updatedData.is_active



                    };





                    const updatedForm =

                        await updateForm(

                            formId,

                            data

                        );





                    currentForm =

                        updatedForm;





                    renderFormHeader();





                    showSuccessMessage(

                        "Form updated successfully."

                    );



                } catch (error) {



                    console.error(

                        "Error updating form:",

                        error

                    );





                    showErrorMessage(

                        "Error updating form."

                    );



                }



            }



    });



}





// ============================================================

// LOAD RELATED ISSUE TYPES

// ============================================================



async function loadRelatedIssueTypes() {



    try {



        const allIssueTypes =

            await getIssueTypes();





        relatedIssueTypes =

            allIssueTypes.filter(

                issueType =>

                    Number(

                        issueType.form_template_id

                    ) === Number(formId)

            );





        renderRelatedIssueTypes();



    } catch (error) {



        console.error(

            "Error loading related Issue Types:",

            error

        );





        relatedIssueTypes = [];





        renderRelatedIssueTypes();





        showErrorMessage(

            "Error loading related Issue Types."

        );



    }



}





// ============================================================

// RENDER RELATED ISSUE TYPES

// ============================================================



function renderRelatedIssueTypes() {



    renderRelationships({



        containerId:

            "relationships",



        expanded:

            true,



        relationships: [



            {



                title:

                    "Issue Types",



                entityLabel:

                    "Issue Type",



                addLabel:

                    "Add Issue Type",



                items:

                    relatedIssueTypes,



                expanded:

                    true,



                actions: {



                    view:

                        true,



                    edit:

                        true,



                    remove:

                        true,



                    add:

                        true,



                    create:

                        true



                },



                getItemName:

                    (item) => {



                        return item.name || "-";



                    },





                onAdd:

                    () => {



                        openIssueTypeModal();



                    },





                onCreate:

                    () => {



                        openCreateIssueTypeModal();



                    },





                onView:

                    (

                        issueType

                    ) => {



                        window.location.href =

                            `issue-type-detail.html?id=${issueType.id}`;



                    },





                onEdit:

                    (

                        issueType

                    ) => {



                        openEditIssueTypeModal(

                            issueType

                        );



                    },





                onRemove:

                    async (

                        issueType

                    ) => {



                        removeIssueType(

                            issueType.id

                        );



                    }



            }



        ]



    });



}





// ============================================================

// ADD ISSUE TYPE MODAL

// ============================================================



async function openIssueTypeModal() {



    const content = `



        <div class="form-group">



            <label

                for="issueTypeSelect"

            >

                Issue Type

            </label>





            <select

                id="issueTypeSelect"

            >



                <option value="">

                    Select an Issue Type

                </option>



            </select>



        </div>





        <div class="modal-actions">



            <button

                type="button"

                id="cancelIssueTypeButton"

            >

                Cancel

            </button>





            <button

                type="button"

                id="saveIssueTypeButton"

            >

                Add

            </button>



        </div>



    `;





    renderModal({



        containerId:

            "issueTypeModal",



        title:

            "Add Issue Type",



        content:

            content,



        onClose:

            closeIssueTypeModal



    });





    const modal =

        document.getElementById(

            "issueTypeModal"

        );





    if (modal) {



        modal.classList.remove(

            "hidden"

        );



    }





    try {



        const allIssueTypes =

            await getIssueTypes();





        const availableIssueTypes =

            allIssueTypes.filter(

                issueType =>

                    Number(

                        issueType.form_template_id

                    ) !== Number(formId)

            );





        const select =

            document.getElementById(

                "issueTypeSelect"

            );





        if (!select) {

            return;

        }





        availableIssueTypes.forEach(

            issueType => {



                const option =

                    document.createElement(

                        "option"

                    );





                option.value =

                    issueType.id;





                option.textContent =

                    issueType.name;





                select.appendChild(

                    option

                );



            }

        );





        if (

            availableIssueTypes.length === 0

        ) {



            const option =

                document.createElement(

                    "option"

                );





            option.value =

                "";





            option.textContent =

                "No available Issue Types";





            option.disabled =

                true;





            select.appendChild(

                option

            );



        }





        const cancelButton =

            document.getElementById(

                "cancelIssueTypeButton"

            );





        if (cancelButton) {



            cancelButton.addEventListener(

                "click",

                closeIssueTypeModal

            );



        }





        const saveButton =

            document.getElementById(

                "saveIssueTypeButton"

            );





        if (saveButton) {



            saveButton.addEventListener(

                "click",

                addSelectedIssueType

            );



        }



    } catch (error) {



        console.error(

            "Error loading Issue Types:",

            error

        );





        showErrorMessage(

            "Error loading Issue Types."

        );



    }



}





// ============================================================

// CLOSE ISSUE TYPE MODAL

// ============================================================



function closeIssueTypeModal() {



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

// ADD SELECTED ISSUE TYPE

// ============================================================



async function addSelectedIssueType() {



    const select =

        document.getElementById(

            "issueTypeSelect"

        );





    if (!select) {

        return;

    }





    const issueTypeId =

        Number(

            select.value

        );





    if (!issueTypeId) {



        showWarningMessage(

            "Please select an Issue Type."

        );



        return;



    }





    try {



        const issueType =

            await getIssueType(

                issueTypeId

            );





        const updatedData = {



            name:

                issueType.name,



            description:

                issueType.description,



            form_template_id:

                formId,



            category:

                issueType.category,



            is_active:

                issueType.is_active,



            display_name:

                issueType.display_name,



            search_keywords:

                issueType.search_keywords



        };





        await updateIssueType(

            issueTypeId,

            updatedData

        );





        closeIssueTypeModal();





        await loadRelatedIssueTypes();





        showSuccessMessage(

            "Issue Type added successfully."

        );



    } catch (error) {



        console.error(

            "Error adding Issue Type:",

            error

        );





        showErrorMessage(

            "Error adding Issue Type."

        );



    }



}





// ============================================================

// CREATE ISSUE TYPE MODAL

// ============================================================



function openCreateIssueTypeModal() {



    const content = `



        <div class="form-group">



            <label

                for="createIssueTypeName"

            >

                Name

            </label>





            <input

                type="text"

                id="createIssueTypeName"

                required

            >



        </div>





        <div class="form-group">



            <label

                for="createIssueTypeDescription"

            >

                Description

            </label>





            <textarea

                id="createIssueTypeDescription"

                rows="5"

            ></textarea>



        </div>





        <div class="form-group">



            <label

                for="createIssueTypeCategory"

            >

                Category

            </label>





            <input

                type="text"

                id="createIssueTypeCategory"

            >



        </div>





        <div class="form-group">



            <label

                for="createIssueTypeDisplayName"

            >

                Display Name

            </label>





            <input

                type="text"

                id="createIssueTypeDisplayName"

            >



        </div>





        <div class="form-group">



            <label

                for="createIssueTypeSearchKeywords"

            >

                Search Keywords

            </label>





            <input

                type="text"

                id="createIssueTypeSearchKeywords"

            >



        </div>





        <div class="form-group checkbox-group">



            <input

                type="checkbox"

                id="createIssueTypeIsActive"

                checked

            >





            <label

                for="createIssueTypeIsActive"

            >

                Active

            </label>



        </div>





        <div class="modal-actions">



            <button

                type="button"

                id="cancelCreateIssueTypeButton"

            >

                Cancel

            </button>





            <button

                type="button"

                id="saveCreateIssueTypeButton"

            >

                Create

            </button>



        </div>



    `;





    renderModal({



        containerId:

            "issueTypeModal",



        title:

            "Create Issue Type",



        content:

            content,



        onClose:

            closeIssueTypeModal



    });





    const modal =

        document.getElementById(

            "issueTypeModal"

        );





    if (modal) {



        modal.classList.remove(

            "hidden"

        );



    }





    const cancelButton =

        document.getElementById(

            "cancelCreateIssueTypeButton"

        );





    if (cancelButton) {



        cancelButton.addEventListener(

            "click",

            closeIssueTypeModal

        );



    }





    const saveButton =

        document.getElementById(

            "saveCreateIssueTypeButton"

        );





    if (saveButton) {



        saveButton.addEventListener(

            "click",

            saveCreatedIssueType

        );



    }



}





// ============================================================

// SAVE CREATED ISSUE TYPE

// ============================================================



async function saveCreatedIssueType() {



    const nameInput =

        document.getElementById(

            "createIssueTypeName"

        );





    const descriptionInput =

        document.getElementById(

            "createIssueTypeDescription"

        );





    const categoryInput =

        document.getElementById(

            "createIssueTypeCategory"

        );





    const displayNameInput =

        document.getElementById(

            "createIssueTypeDisplayName"

        );





    const searchKeywordsInput =

        document.getElementById(

            "createIssueTypeSearchKeywords"

        );





    const isActiveInput =

        document.getElementById(

            "createIssueTypeIsActive"

        );





    if (

        !nameInput ||

        !descriptionInput ||

        !categoryInput ||

        !displayNameInput ||

        !searchKeywordsInput ||

        !isActiveInput

    ) {



        return;



    }





    const name =

        nameInput.value.trim();





    const description =

        descriptionInput.value.trim();





    const category =

        categoryInput.value.trim();





    const displayName =

        displayNameInput.value.trim();





    const searchKeywords =

        searchKeywordsInput.value.trim();





    const isActive =

        isActiveInput.checked;





    if (!name) {



        showWarningMessage(

            "Please enter an Issue Type Name."

        );





        nameInput.focus();





        return;



    }





    try {



        const issueTypeData = {



            name:

                name,



            description:

                description,



            category:

                category,



            display_name:

                displayName,



            search_keywords:

                searchKeywords,



            form_template_id:

                formId,



            is_active:

                isActive



        };





        await createIssueType(

            issueTypeData

        );





        closeIssueTypeModal();





        await loadRelatedIssueTypes();





        showSuccessMessage(

            "Issue Type created successfully."

        );



    } catch (error) {



        console.error(

            "Error creating Issue Type:",

            error

        );





        showErrorMessage(

            "Error creating Issue Type."

        );



    }



}





// ============================================================

// EDIT ISSUE TYPE MODAL

// ============================================================



function openEditIssueTypeModal(

    issueType

) {



    const content = `



        <div class="form-group">



            <label

                for="editIssueTypeName"

            >

                Name

            </label>





            <input

                type="text"

                id="editIssueTypeName"

                value="${escapeHtml(

                    issueType.name || ""

                )}"

                required

            >



        </div>





        <div class="form-group">



            <label

                for="editIssueTypeDescription"

            >

                Description

            </label>





            <textarea

                id="editIssueTypeDescription"

                rows="5"

            >${escapeHtml(

                issueType.description || ""

            )}</textarea>



        </div>





        <div class="form-group">



            <label

                for="editIssueTypeCategory"

            >

                Category

            </label>





            <input

                type="text"

                id="editIssueTypeCategory"

                value="${escapeHtml(

                    issueType.category || ""

                )}"

            >



        </div>





        <div class="form-group">



            <label

                for="editIssueTypeDisplayName"

            >

                Display Name

            </label>





            <input

                type="text"

                id="editIssueTypeDisplayName"

                value="${escapeHtml(

                    issueType.display_name || ""

                )}"

            >



        </div>





        <div class="form-group">



            <label

                for="editIssueTypeSearchKeywords"

            >

                Search Keywords

            </label>





            <input

                type="text"

                id="editIssueTypeSearchKeywords"

                value="${escapeHtml(

                    issueType.search_keywords || ""

                )}"

            >



        </div>





        <div class="form-group checkbox-group">



            <input

                type="checkbox"

                id="editIssueTypeIsActive"

                ${

                    issueType.is_active

                        ? "checked"

                        : ""

                }

            >





            <label

                for="editIssueTypeIsActive"

            >

                Active

            </label>



        </div>





        <div class="modal-actions">



            <button

                type="button"

                id="cancelEditIssueTypeButton"

            >

                Cancel

            </button>





            <button

                type="button"

                id="saveEditIssueTypeButton"

            >

                Save

            </button>



        </div>



    `;





    renderModal({



        containerId:

            "issueTypeModal",



        title:

            "Edit Issue Type",



        content:

            content,



        onClose:

            closeIssueTypeModal



    });





    const modal =

        document.getElementById(

            "issueTypeModal"

        );





    if (modal) {



        modal.classList.remove(

            "hidden"

        );



    }





    const cancelButton =

        document.getElementById(

            "cancelEditIssueTypeButton"

        );





    if (cancelButton) {



        cancelButton.addEventListener(

            "click",

            closeIssueTypeModal

        );



    }





    const saveButton =

        document.getElementById(

            "saveEditIssueTypeButton"

        );





    if (saveButton) {



        saveButton.addEventListener(

            "click",

            () => {



                saveEditedIssueType(

                    issueType.id

                );



            }

        );



    }



}





// ============================================================

// SAVE EDITED ISSUE TYPE

// ============================================================



async function saveEditedIssueType(

    issueTypeId

) {



    const nameInput =

        document.getElementById(

            "editIssueTypeName"

        );





    const descriptionInput =

        document.getElementById(

            "editIssueTypeDescription"

        );





    const categoryInput =

        document.getElementById(

            "editIssueTypeCategory"

        );





    const displayNameInput =

        document.getElementById(

            "editIssueTypeDisplayName"

        );





    const searchKeywordsInput =

        document.getElementById(

            "editIssueTypeSearchKeywords"

        );





    const isActiveInput =

        document.getElementById(

            "editIssueTypeIsActive"

        );





    if (

        !nameInput ||

        !descriptionInput ||

        !categoryInput ||

        !displayNameInput ||

        !searchKeywordsInput ||

        !isActiveInput

    ) {



        return;



    }





    const name =

        nameInput.value.trim();





    const description =

        descriptionInput.value.trim();





    const category =

        categoryInput.value.trim();





    const displayName =

        displayNameInput.value.trim();





    const searchKeywords =

        searchKeywordsInput.value.trim();





    const isActive =

        isActiveInput.checked;





    if (!name) {



        showWarningMessage(

            "Please enter an Issue Type Name."

        );





        nameInput.focus();





        return;



    }





    try {



        const currentIssueType =

            await getIssueType(

                issueTypeId

            );





        const issueTypeData = {



            name:

                name,



            description:

                description,



            form_template_id:

                currentIssueType.form_template_id,



            category:

                category,



            is_active:

                isActive,



            display_name:

                displayName,



            search_keywords:

                searchKeywords



        };





        await updateIssueType(

            issueTypeId,

            issueTypeData

        );





        closeIssueTypeModal();





        await loadRelatedIssueTypes();





        showSuccessMessage(

            "Issue Type updated successfully."

        );



    } catch (error) {



        console.error(

            "Error updating Issue Type:",

            error

        );





        showErrorMessage(

            "Error updating Issue Type."

        );



    }



}





// ============================================================

// REMOVE ISSUE TYPE

// ============================================================



function removeIssueType(

    issueTypeId

) {



    const issueType =

        relatedIssueTypes.find(

            item =>

                Number(item.id) ===

                Number(issueTypeId)

        );





    if (!issueType) {



        showErrorMessage(

            "Issue Type not found."

        );



        return;



    }





    openConfirmationModal({



        title:

            "Remove Issue Type",



        message:

            `Are you sure you want to remove "${issueType.name}" from this Form?`,



        confirmLabel:

            "Remove",



        danger:

            true,



        onConfirm:

            async () => {



                try {



                    const currentIssueType =

                        await getIssueType(

                            issueTypeId

                        );





                    const updatedData = {



                        name:

                            currentIssueType.name,



                        description:

                            currentIssueType.description,



                        form_template_id:

                            null,



                        category:

                            currentIssueType.category,



                        is_active:

                            currentIssueType.is_active,



                        display_name:

                            currentIssueType.display_name,



                        search_keywords:

                            currentIssueType.search_keywords



                    };





                    await updateIssueType(

                        issueTypeId,

                        updatedData

                    );





                    await loadRelatedIssueTypes();





                    showSuccessMessage(

                        "Issue Type removed successfully."

                    );



                } catch (error) {



                    console.error(

                        "Error removing Issue Type:",

                        error

                    );





                    showErrorMessage(

                        "Error removing Issue Type."

                    );



                }



            }



    });



}





// ============================================================

// CONFIRMATION MODAL

// ============================================================



function openConfirmationModal({

    title,

    message,

    confirmLabel = "Confirm",

    danger = false,

    onConfirm

}) {



    const modal =

        document.getElementById(

            "confirmationModal"

        );





    if (!modal) {



        showErrorMessage(

            "Confirmation modal could not be opened."

        );



        return;



    }





    modal.innerHTML = `



        <div class="modal-content">



            <div class="modal-header">



                <h3>

                    ${escapeHtml(title)}

                </h3>





                <button

                    type="button"

                    class="modal-close"

                    id="confirmationCloseButton"

                >

                    ×

                </button>



            </div>





            <div class="modal-body">



                <p

                    class="form-detail-confirmation-message"

                >

                    ${escapeHtml(message)}

                </p>



            </div>





            <div class="modal-actions">



                <button

                    type="button"

                    id="confirmationCancelButton"

                >

                    Cancel

                </button>





                <button

                    type="button"

                    id="confirmationConfirmButton"

                    ${

                        danger

                            ? 'class="form-detail-danger-button"'

                            : ""

                    }

                >

                    ${escapeHtml(confirmLabel)}

                </button>



            </div>



        </div>



    `;





    modal.classList.remove(

        "hidden"

    );





    const closeButton =

        document.getElementById(

            "confirmationCloseButton"

        );





    const cancelButton =

        document.getElementById(

            "confirmationCancelButton"

        );





    const confirmButton =

        document.getElementById(

            "confirmationConfirmButton"

        );





    const closeModal = () => {



        modal.classList.add(

            "hidden"

        );



        modal.innerHTML = "";



    };





    if (closeButton) {



        closeButton.addEventListener(

            "click",

            closeModal

        );



    }





    if (cancelButton) {



        cancelButton.addEventListener(

            "click",

            closeModal

        );



    }





    if (confirmButton) {



        confirmButton.addEventListener(

            "click",

            async () => {



                closeModal();



                await onConfirm();



            }

        );



    }



}





// ============================================================

// ESCAPE HTML

// ============================================================



function escapeHtml(

    value

) {



    return String(

        value ?? ""

    )

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