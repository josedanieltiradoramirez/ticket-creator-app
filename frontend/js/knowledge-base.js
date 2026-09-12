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
            .trim()
            .toLowerCase();


    tableBody.innerHTML = "";


    const filteredItems =
        knowledgeBaseItems.filter(item => {

            return (

                (
                    item.article_number || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    item.title || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    item.description || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    item.url || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });


    if (filteredItems.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="5">
                No Knowledge Base articles found.
            </td>
        `;

        tableBody.appendChild(row);

        return;

    }


    filteredItems.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    item.article_number || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.title || ""
                )}
            </td>

            <td>

                <a
                    href="${escapeAttribute(item.url || "")}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open
                </a>

            </td>

            <td>
                ${escapeHtml(
                    item.description || ""
                )}
            </td>

            <td>

                <button
                    class="action-button view-button"
                >
                    View
                </button>

                <button
                    class="action-button edit-button"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                >
                    Delete
                </button>

            </td>

        `;


        row
            .querySelector(".view-button")
            .addEventListener(
                "click",
                () => openKnowledgeBaseDetail(item.id)
            );


        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => openEditModal(item.id)
            );


        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteKnowledgeBaseConfirm(item.id)
            );


        tableBody.appendChild(row);

    });

}


function openKnowledgeBaseDetail(
    knowledgeBaseId
) {

    window.location.href =
        `knowledge-base-detail.html?id=${knowledgeBaseId}`;

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


async function openEditModal(
    knowledgeBaseId
) {

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
            item.article_number || "";


        document.getElementById(
            "title"
        ).value =
            item.title || "";


        document.getElementById(
            "url"
        ).value =
            item.url || "";


        document.getElementById(
            "description"
        ).value =
            item.description || "";


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
            document
                .getElementById("articleNumber")
                .value
                .trim(),

        title:
            document
                .getElementById("title")
                .value
                .trim(),

        url:
            document
                .getElementById("url")
                .value
                .trim(),

        description:
            document
                .getElementById("description")
                .value
                .trim()

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


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function escapeAttribute(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}