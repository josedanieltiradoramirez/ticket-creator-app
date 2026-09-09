let knowledgeBaseItems = [];

let editingKnowledgeBaseId = null;


document.addEventListener("DOMContentLoaded", async () => {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });


    document
        .getElementById("addKnowledgeBaseButton")
        .addEventListener(
            "click",
            openCreateModal
        );


    document
        .getElementById("closeModalButton")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("cancelButton")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("knowledgeBaseForm")
        .addEventListener(
            "submit",
            saveKnowledgeBaseItem
        );


    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderKnowledgeBase
        );


    await loadKnowledgeBase();

});


async function loadKnowledgeBase() {

    try {

        knowledgeBaseItems =
            await getKnowledgeBaseItems();

        renderKnowledgeBase();

    } catch (error) {

        console.error(
            "Error loading knowledge base:",
            error
        );

        alert(
            "Error loading knowledge base."
        );

    }

}


function renderKnowledgeBase() {

    const tableBody =
        document.getElementById(
            "knowledgeBaseTableBody"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredItems =
        knowledgeBaseItems.filter(item => {

            return (

                item.article_number
                    .toLowerCase()
                    .includes(search)

                ||

                item.title
                    .toLowerCase()
                    .includes(search)

                ||

                item.description
                    .toLowerCase()
                    .includes(search)

                ||

                item.url
                    .toLowerCase()
                    .includes(search)

            );

        });


    filteredItems.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.article_number}
            </td>

            <td>
                ${item.title}
            </td>

            <td>
                <a
                    href="${item.url}"
                    target="_blank"
                >
                    Open
                </a>
            </td>

            <td>
                ${item.description}
            </td>

            <td>

                <button
                    class="action-button"
                    onclick="openEditModal(${item.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button"
                    onclick="deleteKnowledgeBaseConfirm(${item.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


function openCreateModal() {

    editingKnowledgeBaseId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "New Knowledge Base Article";


    document
        .getElementById("knowledgeBaseForm")
        .reset();


    document.getElementById(
        "knowledgeBaseModal"
    ).classList.remove("hidden");

}


async function openEditModal(knowledgeBaseId) {

    try {

        const item =
            await getKnowledgeBaseItem(
                knowledgeBaseId
            );


        editingKnowledgeBaseId =
            knowledgeBaseId;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Knowledge Base Article";


        document.getElementById(
            "articleNumber"
        ).value =
            item.article_number;


        document.getElementById(
            "title"
        ).value =
            item.title;


        document.getElementById(
            "url"
        ).value =
            item.url;


        document.getElementById(
            "description"
        ).value =
            item.description;


        document.getElementById(
            "knowledgeBaseModal"
        ).classList.remove("hidden");


    } catch (error) {

        console.error(
            "Error loading knowledge base item:",
            error
        );

        alert(
            "Error loading knowledge base item."
        );

    }

}


function closeModal() {

    document.getElementById(
        "knowledgeBaseModal"
    ).classList.add("hidden");

}


async function saveKnowledgeBaseItem(event) {

    event.preventDefault();


    const itemData = {

        article_number:
            document.getElementById(
                "articleNumber"
            ).value,

        title:
            document.getElementById(
                "title"
            ).value,

        url:
            document.getElementById(
                "url"
            ).value,

        description:
            document.getElementById(
                "description"
            ).value

    };


    try {

        if (
            editingKnowledgeBaseId === null
        ) {

            await createKnowledgeBaseItem(
                itemData
            );

            alert(
                "Knowledge base article created successfully."
            );

        } else {

            await updateKnowledgeBaseItem(
                editingKnowledgeBaseId,
                itemData
            );

            alert(
                "Knowledge base article updated successfully."
            );

        }


        closeModal();

        await loadKnowledgeBase();


    } catch (error) {

        console.error(
            "Error saving knowledge base item:",
            error
        );

        alert(
            "Error saving knowledge base article."
        );

    }

}


async function deleteKnowledgeBaseConfirm(
    knowledgeBaseId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this knowledge base article?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteKnowledgeBaseItem(
            knowledgeBaseId
        );


        alert(
            "Knowledge base article deleted successfully."
        );


        await loadKnowledgeBase();


    } catch (error) {

        console.error(
            "Error deleting knowledge base item:",
            error
        );

        alert(
            "Error deleting knowledge base article."
        );

    }

}