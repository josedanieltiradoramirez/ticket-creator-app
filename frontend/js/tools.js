let tools = [];

let editingToolId = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTools();

        setupToolEventListeners();

    }
);


function setupToolEventListeners() {

    document
        .getElementById("newToolButton")
        .addEventListener(
            "click",
            openCreateToolModal
        );


    document
        .getElementById("closeToolModal")
        .addEventListener(
            "click",
            closeToolModal
        );


    document
        .getElementById("cancelToolButton")
        .addEventListener(
            "click",
            closeToolModal
        );

    
    document
        .getElementById("toolForm")
        .addEventListener(
            "submit",
            saveTool
        );

    document
        .getElementById("backButton")
        .addEventListener("click", () => {
            window.location.href = "index.html";
        });

    document
        .getElementById("searchTools")
        .addEventListener(
            "input",
            renderTools
        );

}


async function loadTools() {

    try {

        tools = await getTools();

        renderTools();

    } catch (error) {

        console.error(
            "Error loading tools:",
            error
        );

        alert(
            "Error loading tools."
        );

    }

}


function renderTools() {

    const tableBody =
        document.getElementById(
            "toolsTableBody"
        );


    const search =
        document.getElementById(
            "searchTools"
        ).value
        .trim()
        .toLowerCase();


    tableBody.innerHTML = "";


    const filteredTools =
        tools.filter(tool => {

            return (
                tool.name
                    .toLowerCase()
                    .includes(search)
                ||
                tool.description
                    .toLowerCase()
                    .includes(search)
            );

        });


    filteredTools.forEach(tool => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(tool.name)}
            </td>

            <td>
                ${escapeHtml(tool.description)}
            </td>

            <td>

                <span class="status-badge ${
                    tool.is_active
                        ? "active"
                        : "inactive"
                }">

                    ${
                        tool.is_active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <button
                    class="action-button edit-button"
                    data-id="${tool.id}"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                    data-id="${tool.id}"
                >
                    Delete
                </button>

            </td>

        `;


        row
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => editTool(tool.id)
            );


        row
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => deleteTool(tool.id)
            );


        tableBody.appendChild(row);

    });

}


function openCreateToolModal() {

    editingToolId = null;


    document.getElementById(
        "modalTitle"
    ).textContent = "Create Tool";


    document.getElementById(
        "toolName"
    ).value = "";


    document.getElementById(
        "toolDescription"
    ).value = "";


    document.getElementById(
        "toolActive"
    ).checked = true;


    document.getElementById(
        "toolModal"
    ).classList.remove("hidden");

}


function editTool(toolId) {

    const tool =
        tools.find(
            tool => tool.id === toolId
        );


    if (!tool) {
        return;
    }


    editingToolId = toolId;


    document.getElementById(
        "modalTitle"
    ).textContent = "Edit Tool";


    document.getElementById(
        "toolName"
    ).value = tool.name;


    document.getElementById(
        "toolDescription"
    ).value = tool.description;


    document.getElementById(
        "toolActive"
    ).checked = tool.is_active;


    document.getElementById(
        "toolModal"
    ).classList.remove("hidden");

}


function closeToolModal() {

    document.getElementById(
        "toolModal"
    ).classList.add("hidden");

}


async function saveTool(event) {

    event.preventDefault();


    const toolData = {

        name:
            document.getElementById(
                "toolName"
            ).value.trim(),

        description:
            document.getElementById(
                "toolDescription"
            ).value.trim(),

        is_active:
            document.getElementById(
                "toolActive"
            ).checked

    };


    try {

        if (editingToolId === null) {

            await createTool(toolData);

            alert(
                "Tool created successfully."
            );

        } else {

            await updateTool(
                editingToolId,
                toolData
            );

            alert(
                "Tool updated successfully."
            );

        }


        closeToolModal();

        await loadTools();

    } catch (error) {

        console.error(
            "Error saving tool:",
            error
        );

        alert(
            "Error saving tool."
        );

    }

}


async function deleteTool(toolId) {

    const tool =
        tools.find(
            tool => tool.id === toolId
        );


    if (!tool) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${tool.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteToolApi(toolId);

        alert(
            "Tool deleted successfully."
        );

        await loadTools();

    } catch (error) {

        console.error(
            "Error deleting tool:",
            error
        );

        alert(
            "Error deleting tool."
        );

    }

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}