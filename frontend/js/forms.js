let forms = [];

let editingFormId = null;


document.addEventListener("DOMContentLoaded", async () => {

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


    await loadForms();

});


async function loadForms() {

    try {

        forms = await getForms();

        renderForms();

    } catch (error) {

        console.error(
            "Error loading forms:",
            error
        );

        alert(
            "Error loading forms."
        );

    }

}


function renderForms() {

    const tableBody =
        document.getElementById(
            "formsTableBody"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredForms =
        forms.filter(form => {

            return (

                form.name
                    .toLowerCase()
                    .includes(search)

                ||

                form.description
                    .toLowerCase()
                    .includes(search)

            );

        });


    filteredForms.forEach(form => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${form.name}
            </td>

            <td>
                ${form.description}
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
                    class="action-button"
                    onclick="openEditModal(${form.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button"
                    onclick="deleteFormConfirm(${form.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

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


        editingFormId =
            formId;


        document.getElementById(
            "modalTitle"
        ).textContent = "Edit Form";


        document.getElementById(
            "name"
        ).value =
            form.name;


        document.getElementById(
            "description"
        ).value =
            form.description;


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

        alert(
            "Error loading form."
        );

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
            ).value,

        description:
            document.getElementById(
                "description"
            ).value,

        is_active:
            document.getElementById(
                "isActive"
            ).checked

    };


    try {

        if (editingFormId === null) {

            await createForm(
                formData
            );

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

        await deleteForm(
            formId
        );


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