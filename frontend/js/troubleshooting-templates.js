let troubleshootingTemplates = [];

let editingTemplateId = null;


document.addEventListener("DOMContentLoaded", async () => {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("addTemplateButton")
        .addEventListener("click", openCreateModal);


    document
        .getElementById("closeModalButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("cancelButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("templateForm")
        .addEventListener("submit", saveTemplate);


    document
        .getElementById("searchInput")
        .addEventListener("input", renderTemplates);


    await loadTemplates();

});


async function loadTemplates() {

    try {

        troubleshootingTemplates =
            await getTroubleshootingTemplates();

        renderTemplates();

    } catch (error) {

        console.error(
            "Error loading troubleshooting templates:",
            error
        );

        alert(
            "Error loading troubleshooting templates."
        );

    }

}


function renderTemplates() {

    const tableBody =
        document.getElementById(
            "templatesTableBody"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredTemplates =
        troubleshootingTemplates.filter(template => {

            return (

                (
                    template.name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    template.generated_description || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    template.steps || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });


    filteredTemplates.forEach(template => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${template.name || ""}
            </td>

            <td>
                ${template.generated_description}
            </td>

            <td>

                <span
                    class="status-badge ${
                        template.is_active
                            ? "active"
                            : "inactive"
                    }"
                >

                    ${
                        template.is_active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <button
                    class="action-button"
                    onclick="openEditModal(${template.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button"
                    onclick="deleteTemplateConfirm(${template.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


function openCreateModal() {

    editingTemplateId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "New Troubleshooting Template";


    document
        .getElementById("templateForm")
        .reset();


    document.getElementById(
        "isActive"
    ).checked = true;


    document.getElementById(
        "templateModal"
    ).classList.remove("hidden");

}


async function openEditModal(templateId) {

    try {

        const template =
            await getTroubleshootingTemplate(
                templateId
            );


        editingTemplateId =
            templateId;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Troubleshooting Template";


        document.getElementById(
            "name"
        ).value =
            template.name || "";


        document.getElementById(
            "generatedDescription"
        ).value =
            template.generated_description;


        document.getElementById(
            "steps"
        ).value =
            template.steps;


        document.getElementById(
            "isActive"
        ).checked =
            template.is_active;


        document.getElementById(
            "templateModal"
        ).classList.remove("hidden");


    } catch (error) {

        console.error(
            "Error loading troubleshooting template:",
            error
        );

        alert(
            "Error loading troubleshooting template."
        );

    }

}


function closeModal() {

    document.getElementById(
        "templateModal"
    ).classList.add("hidden");

}


async function saveTemplate(event) {

    event.preventDefault();


    const templateData = {

        name:
            document.getElementById(
                "name"
            ).value || null,

        steps:
            document.getElementById(
                "steps"
            ).value,

        generated_description:
            document.getElementById(
                "generatedDescription"
            ).value,

        is_active:
            document.getElementById(
                "isActive"
            ).checked

    };


    try {

        if (editingTemplateId === null) {

            await createTroubleshootingTemplate(
                templateData
            );

            alert(
                "Troubleshooting template created successfully."
            );

        } else {

            await updateTroubleshootingTemplate(
                editingTemplateId,
                templateData
            );

            alert(
                "Troubleshooting template updated successfully."
            );

        }


        closeModal();

        await loadTemplates();


    } catch (error) {

        console.error(
            "Error saving troubleshooting template:",
            error
        );

        alert(
            "Error saving troubleshooting template."
        );

    }

}


async function deleteTemplateConfirm(templateId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this troubleshooting template?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteTroubleshootingTemplate(
            templateId
        );


        alert(
            "Troubleshooting template deleted successfully."
        );


        await loadTemplates();


    } catch (error) {

        console.error(
            "Error deleting troubleshooting template:",
            error
        );

        alert(
            "Error deleting troubleshooting template."
        );

    }

}