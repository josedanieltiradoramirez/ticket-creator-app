let forms = [];
let editingFormId = null;


document.addEventListener("DOMContentLoaded", async () => {

    setupEventListeners();

    await loadForms();

    handleEditQueryParameter();

});


function setupEventListeners() {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("addFormButton")
        .addEventListener("click", openCreateModal);


    document
        .getElementById("closeModalButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("cancelButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("formForm")
        .addEventListener("submit", saveForm);


    document
        .getElementById("searchInput")
        .addEventListener("input", renderForms);

}


async function loadForms() {

    try {

        forms = await getForms();

        renderForms();

    } catch (error) {

        console.error("Error loading forms:", error);

        alert("Error loading forms.");

    }

}


function renderForms() {

    const tableBody =
        document.getElementById("formsTableBody");

    const search =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredForms = forms.filter(form => {

        const name =
            form.name
                ? form.name.toLowerCase()
                : "";

        const description =
            form.description
                ? form.description.toLowerCase()
                : "";


        return (
            name.includes(search) ||
            description.includes(search)
        );

    });


    if (filteredForms.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="4" style="text-align: center;">
                No forms found.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    filteredForms.forEach(form => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(form.name)}
            </td>

            <td>
                ${escapeHtml(form.description)}
            </td>

            <td>

                <span
                    class="status-badge ${
                        form.is_active
                            ? "active"
                            : "inactive"
                    }"
                >

                    ${
                        form.is_active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <button
                    class="action-button view-button"
                    data-id="${form.id}"
                >
                    View
                </button>

                <button
                    class="action-button edit-button"
                    data-id="${form.id}"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                    data-id="${form.id}"
                >
                    Delete
                </button>

            </td>

        `;


        row
            .querySelector(".view-button")
            .addEventListener("click", () => {

                openFormDetail(form.id);

            });


        row
            .querySelector(".edit-button")
            .addEventListener("click", () => {

                openEditModal(form.id);

            });


        row
            .querySelector(".delete-button")
            .addEventListener("click", () => {

                deleteFormConfirm(form.id);

            });


        tableBody.appendChild(row);

    });

}


function openFormDetail(formId) {

    window.location.href =
        `form-detail.html?id=${formId}`;

}


function openCreateModal() {

    editingFormId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "New Form";


    document
        .getElementById("formForm")
        .reset();


    document.getElementById(
        "isActive"
    ).checked = true;


    document.getElementById(
        "formModal"
    ).classList.remove("hidden");

}


async function openEditModal(formId) {

    try {

        const form =
            await getForm(formId);


        editingFormId = formId;


        document.getElementById(
            "modalTitle"
        ).textContent = "Edit Form";


        document.getElementById(
            "name"
        ).value =
            form.name || "";


        document.getElementById(
            "description"
        ).value =
            form.description || "";


        document.getElementById(
            "isActive"
        ).checked =
            form.is_active;


        document.getElementById(
            "formModal"
        ).classList.remove("hidden");


    } catch (error) {

        console.error(
            "Error loading form:",
            error
        );

        alert("Error loading form.");

    }

}


function closeModal() {

    document.getElementById(
        "formModal"
    ).classList.add("hidden");

}


async function saveForm(event) {

    event.preventDefault();


    const formData = {

        name:
            document.getElementById(
                "name"
            ).value.trim(),

        description:
            document.getElementById(
                "description"
            ).value.trim(),

        is_active:
            document.getElementById(
                "isActive"
            ).checked

    };


    try {

        if (editingFormId === null) {

            await createForm(formData);

            alert(
                "Form created successfully."
            );

        } else {

            await updateForm(
                editingFormId,
                formData
            );

            alert(
                "Form updated successfully."
            );

        }


        closeModal();

        await loadForms();


    } catch (error) {

        console.error(
            "Error saving form:",
            error
        );

        alert(
            "Error saving form."
        );

    }

}


async function deleteFormConfirm(formId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this form?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteForm(formId);


        alert(
            "Form deleted successfully."
        );


        await loadForms();


    } catch (error) {

        console.error(
            "Error deleting form:",
            error
        );

        alert(
            "Error deleting form."
        );

    }

}


function handleEditQueryParameter() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {
        return;
    }


    openEditModal(
        Number(editId)
    );

}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}