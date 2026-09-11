let formId = null;
let currentForm = null;
let relatedIssueTypes = [];


document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    formId =
        Number(params.get("id"));


    if (!formId) {

        alert("Invalid form ID.");

        window.location.href =
            "forms.html";

        return;

    }


    setupEventListeners();

    await loadForm();

    await loadRelatedIssueTypes();

});


function setupEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href =
                "forms.html";

        });


    document
        .getElementById("saveFormButton")
        .addEventListener(
            "click",
            saveForm
        );


    document
        .getElementById("addIssueTypeButton")
        .addEventListener(
            "open",
            () => {}
        );


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

}


async function loadForm() {

    try {

        currentForm =
            await getForm(formId);


        renderForm();


    } catch (error) {

        console.error(
            "Error loading form:",
            error
        );

        alert(
            "Error loading form."
        );

        window.location.href =
            "forms.html";

    }

}


function renderForm() {

    if (!currentForm) {
        return;
    }


    document.getElementById(
        "formNameHeader"
    ).textContent =
        currentForm.name;


    document.getElementById(
        "formName"
    ).value =
        currentForm.name || "";


    document.getElementById(
        "formDescription"
    ).value =
        currentForm.description || "";


    document.getElementById(
        "formIsActive"
    ).checked =
        currentForm.is_active;

}


async function saveForm() {

    const name =
        document
            .getElementById("formName")
            .value
            .trim();


    const description =
        document
            .getElementById("formDescription")
            .value
            .trim();


    const isActive =
        document.getElementById(
            "formIsActive"
        ).checked;


    if (!name) {

        alert(
            "Form name is required."
        );

        return;

    }


    if (!description) {

        alert(
            "Form description is required."
        );

        return;

    }


    const formData = {

        name: name,

        description: description,

        is_active: isActive

    };


    try {

        const updatedForm =
            await updateForm(
                formId,
                formData
            );


        currentForm =
            updatedForm;


        document.getElementById(
            "formNameHeader"
        ).textContent =
            updatedForm.name;


        alert(
            "Form updated successfully."
        );


    } catch (error) {

        console.error(
            "Error updating form:",
            error
        );

        alert(
            "Error updating form."
        );

    }

}


async function loadRelatedIssueTypes() {

    try {

        const allIssueTypes =
            await getIssueTypes();


        relatedIssueTypes =
            allIssueTypes.filter(
                issueType =>
                    Number(issueType.form_template_id)
                    === Number(formId)
            );


        renderRelatedIssueTypes();


    } catch (error) {

        console.error(
            "Error loading related issue types:",
            error
        );

        alert(
            "Error loading related issue types."
        );

    }

}


function renderRelatedIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );


    tableBody.innerHTML = "";


    if (relatedIssueTypes.length === 0) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td
                colspan="4"
                style="text-align: center;"
            >
                No Issue Types are related to this Form.
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
                ${escapeHtml(issueType.name)}
            </td>

            <td>
                ${escapeHtml(
                    issueType.category || "-"
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
                    data-id="${issueType.id}"
                >
                    View
                </button>

                <button
                    class="action-button delete-button"
                    data-id="${issueType.id}"
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
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => {

                    removeIssueType(
                        issueType.id
                    );

                }
            );


        tableBody.appendChild(row);

    });

}


async function openIssueTypeModal() {

    try {

        const allIssueTypes =
            await getIssueTypes();


        const availableIssueTypes =
            allIssueTypes.filter(issueType => {

                return Number(
                    issueType.form_template_id
                ) !== Number(formId);

            });


        const select =
            document.getElementById(
                "issueTypeSelect"
            );


        select.innerHTML = `

            <option value="">
                Select an Issue Type
            </option>

        `;


        availableIssueTypes.forEach(issueType => {

            const option =
                document.createElement("option");


            option.value =
                issueType.id;


            option.textContent =
                issueType.name;


            select.appendChild(option);

        });


        if (availableIssueTypes.length === 0) {

            const option =
                document.createElement("option");


            option.value = "";

            option.textContent =
                "No available Issue Types";


            option.disabled = true;


            select.appendChild(option);

        }


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

    const select =
        document.getElementById(
            "issueTypeSelect"
        );


    const issueTypeId =
        Number(select.value);


    if (!issueTypeId) {

        alert(
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

            name: issueType.name,

            description:
                issueType.description,

            form_template_id: formId,

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


        alert(
            "Issue Type added successfully."
        );


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


async function removeIssueType(issueTypeId) {

    const confirmed =
        confirm(
            "Remove this Issue Type from the Form?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const issueType =
            await getIssueType(
                issueTypeId
            );


        const updatedData = {

            name: issueType.name,

            description:
                issueType.description,

            form_template_id: null,

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


        await loadRelatedIssueTypes();


        alert(
            "Issue Type removed successfully."
        );


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


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}