let issueTypes = [];

let editingIssueTypeId = null;


document.addEventListener("DOMContentLoaded", async () => {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("addIssueTypeButton")
        .addEventListener("click", openCreateModal);


    document
        .getElementById("closeModalButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("cancelButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("issueTypeForm")
        .addEventListener("submit", saveIssueType);


    document
        .getElementById("searchInput")
        .addEventListener("input", renderIssueTypes);


    await loadIssueTypes();

});


async function loadIssueTypes() {

    try {

        issueTypes = await getIssueTypes();

        renderIssueTypes();

    } catch (error) {

        console.error(
            "Error loading issue types:",
            error
        );

        alert(
            "Error loading issue types."
        );

    }

}


function renderIssueTypes() {

    const tableBody =
        document.getElementById(
            "issueTypesTableBody"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredIssueTypes =
        issueTypes.filter(issueType => {

            return (

                issueType.name
                    .toLowerCase()
                    .includes(search)

                ||

                issueType.category
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    issueType.display_name || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });


    filteredIssueTypes.forEach(issueType => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${issueType.name}
            </td>

            <td>
                ${issueType.category}
            </td>

            <td>
                ${issueType.display_name || ""}
            </td>

            <td>
                ${
                    issueType.form_template_id
                        ? issueType.form_template_id
                        : "None"
                }
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
                    class="action-button"
                    onclick="openEditModal(${issueType.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button"
                    onclick="deleteIssueTypeConfirm(${issueType.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


function openCreateModal() {

    editingIssueTypeId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "New Issue Type";


    document
        .getElementById("issueTypeForm")
        .reset();


    document.getElementById(
        "isActive"
    ).checked = true;


    document.getElementById(
        "formTemplate"
    ).value = "";


    document.getElementById(
        "issueTypeModal"
    ).classList.remove("hidden");

}


async function openEditModal(issueTypeId) {

    try {

        const issueType =
            await getIssueType(issueTypeId);


        editingIssueTypeId =
            issueTypeId;


        document.getElementById(
            "modalTitle"
        ).textContent = "Edit Issue Type";


        document.getElementById(
            "name"
        ).value =
            issueType.name;


        document.getElementById(
            "description"
        ).value =
            issueType.description;


        document.getElementById(
            "category"
        ).value =
            issueType.category;


        document.getElementById(
            "displayName"
        ).value =
            issueType.display_name || "";


        document.getElementById(
            "searchKeywords"
        ).value =
            issueType.search_keywords || "";


        document.getElementById(
            "formTemplate"
        ).value =
            issueType.form_template_id || "";


        document.getElementById(
            "isActive"
        ).checked =
            issueType.is_active;


        document.getElementById(
            "issueTypeModal"
        ).classList.remove("hidden");


    } catch (error) {

        console.error(
            "Error loading issue type:",
            error
        );

        alert(
            "Error loading issue type."
        );

    }

}


function closeModal() {

    document.getElementById(
        "issueTypeModal"
    ).classList.add("hidden");

}


async function saveIssueType(event) {

    event.preventDefault();


    const issueTypeData = {

        name:
            document.getElementById(
                "name"
            ).value,

        description:
            document.getElementById(
                "description"
            ).value,

        category:
            document.getElementById(
                "category"
            ).value,

        display_name:
            document.getElementById(
                "displayName"
            ).value || null,

        search_keywords:
            document.getElementById(
                "searchKeywords"
            ).value || null,

        form_template_id:
            document.getElementById(
                "formTemplate"
            ).value
                ? Number(
                    document.getElementById(
                        "formTemplate"
                    ).value
                )
                : null,

        is_active:
            document.getElementById(
                "isActive"
            ).checked

    };


    try {

        if (editingIssueTypeId === null) {

            await createIssueType(
                issueTypeData
            );

            alert(
                "Issue type created successfully."
            );

        } else {

            await updateIssueType(
                editingIssueTypeId,
                issueTypeData
            );

            alert(
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

        alert(
            "Error saving issue type."
        );

    }

}


async function deleteIssueTypeConfirm(issueTypeId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this issue type?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteIssueType(
            issueTypeId
        );


        alert(
            "Issue type deleted successfully."
        );


        await loadIssueTypes();


    } catch (error) {

        console.error(
            "Error deleting issue type:",
            error
        );

        alert(
            "Error deleting issue type."
        );

    }

}