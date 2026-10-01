// ============================================================
// RELATIONSHIPS COMPONENT
// ============================================================

function renderRelationships({
    containerId,
    relationships,
    expanded = true
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Relationships container "${containerId}" not found.`
        );

        return;
    }


    // ============================================================
    // RENDER
    // ============================================================

    function render() {

        const content = `
            <div class="relationships-content">

                ${relationships
                    .map((relationship, relationshipIndex) => {

                        // ====================================================
                        // ACTIONS
                        // ====================================================

                        const actions = {
                            view: true,
                            edit: true,
                            remove: true,
                            ...(relationship.actions || {})
                        };


                        // ====================================================
                        // RELATIONSHIP CONTENT
                        // ====================================================

                        const relationshipContent = `
                            <div class="relationships-section">

                                <div class="relationships-list">

                                    ${
                                        relationship.items.length === 0

                                            ? `
                                                <div class="relationships-empty">
                                                    No ${relationship.title.toLowerCase()} found.
                                                </div>
                                            `

                                            : relationship.items
                                                .map((item, itemIndex) => {

                                                    const itemName =
                                                        relationship.getItemName
                                                            ? relationship.getItemName(item)
                                                            : item.name ?? "-";


                                                    return `
                                                        <div class="relationship-item">

                                                            <div class="relationship-item-name">
                                                                ${escapeRelationshipHtml(itemName)}
                                                            </div>


                                                            <div class="relationship-item-actions">

                                                                ${
                                                                    actions.view
                                                                        ? `
                                                                            <button
                                                                                type="button"
                                                                                class="relationship-action-button"
                                                                                data-action="view"
                                                                                data-relationship-index="${relationshipIndex}"
                                                                                data-item-index="${itemIndex}"
                                                                            >
                                                                                View
                                                                            </button>
                                                                        `
                                                                        : ""
                                                                }


                                                                ${
                                                                    actions.edit
                                                                        ? `
                                                                            <button
                                                                                type="button"
                                                                                class="relationship-action-button"
                                                                                data-action="edit"
                                                                                data-relationship-index="${relationshipIndex}"
                                                                                data-item-index="${itemIndex}"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        `
                                                                        : ""
                                                                }


                                                                ${
                                                                    actions.remove
                                                                        ? `
                                                                            <button
                                                                                type="button"
                                                                                class="relationship-action-button remove"
                                                                                data-action="remove"
                                                                                data-relationship-index="${relationshipIndex}"
                                                                                data-item-index="${itemIndex}"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        `
                                                                        : ""
                                                                }

                                                            </div>

                                                        </div>
                                                    `;

                                                })
                                                .join("")
                                    }

                                </div>

                            </div>
                        `;


                        // ====================================================
                        // RELATIONSHIP SECTION
                        // ====================================================

                        return `
                            <div
                                class="relationship-collapsible-container"
                                id="relationshipSection_${relationshipIndex}"
                            ></div>
                        `;

                    })
                    .join("")}

            </div>
        `;


        // ============================================================
        // MAIN RELATIONSHIPS SECTION
        // ============================================================

        renderCollapsibleSection({
            containerId: containerId,
            title: "Relationships",
            content: content,
            expanded: expanded
        });


        // ============================================================
        // RENDER EACH RELATIONSHIP
        // ============================================================

        relationships.forEach(
            (relationship, relationshipIndex) => {

                const relationshipContainer =
                    document.getElementById(
                        `relationshipSection_${relationshipIndex}`
                    );


                if (!relationshipContainer) {
                    return;
                }


                const actions = {
                    view: true,
                    edit: true,
                    remove: true,
                    ...(relationship.actions || {})
                };


                const relationshipContent = `
                    <div class="relationships-section">

                        <div class="relationships-list">

                            ${
                                relationship.items.length === 0

                                    ? `
                                        <div class="relationships-empty">
                                            No ${relationship.title.toLowerCase()} found.
                                        </div>
                                    `

                                    : relationship.items
                                        .map((item, itemIndex) => {

                                            const itemName =
                                                relationship.getItemName
                                                    ? relationship.getItemName(item)
                                                    : item.name ?? "-";


                                            return `
                                                <div class="relationship-item">

                                                    <div class="relationship-item-name">
                                                        ${escapeRelationshipHtml(itemName)}
                                                    </div>


                                                    <div class="relationship-item-actions">

                                                        ${
                                                            actions.view
                                                                ? `
                                                                    <button
                                                                        type="button"
                                                                        class="relationship-action-button"
                                                                        data-action="view"
                                                                        data-relationship-index="${relationshipIndex}"
                                                                        data-item-index="${itemIndex}"
                                                                    >
                                                                        View
                                                                    </button>
                                                                `
                                                                : ""
                                                        }


                                                        ${
                                                            actions.edit
                                                                ? `
                                                                    <button
                                                                        type="button"
                                                                        class="relationship-action-button"
                                                                        data-action="edit"
                                                                        data-relationship-index="${relationshipIndex}"
                                                                        data-item-index="${itemIndex}"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                `
                                                                : ""
                                                        }


                                                        ${
                                                            actions.remove
                                                                ? `
                                                                    <button
                                                                        type="button"
                                                                        class="relationship-action-button remove"
                                                                        data-action="remove"
                                                                        data-relationship-index="${relationshipIndex}"
                                                                        data-item-index="${itemIndex}"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                `
                                                                : ""
                                                        }

                                                    </div>

                                                </div>
                                            `;

                                        })
                                        .join("")
                            }

                        </div>

                    </div>
                `;


                const relationshipHeaderActions = `
                    <button
                        type="button"
                        class="relationships-add-button"
                        data-relationship-index="${relationshipIndex}"
                    >
                        + ${escapeRelationshipHtml(
                            relationship.addLabel
                        )}
                    </button>
                `;


                renderCollapsibleSection({
                    containerId:
                        `relationshipSection_${relationshipIndex}`,

                    title: relationship.title,

                    content: relationshipContent,

                    expanded:
                        relationship.expanded ?? false,

                    headerActions:
                        relationshipHeaderActions
                });

            }
        );


        setupEvents();
    }


    // ============================================================
    // RELATIONSHIP COLLAPSIBLE SECTION
    // ============================================================

   


    // ============================================================
    // EVENTS
    // ============================================================

    function setupEvents() {

        // ========================================================
        // ADD BUTTONS
        // ========================================================

        const addButtons =
            container.querySelectorAll(
                ".relationships-add-button"
            );


        addButtons.forEach(button => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    const relationshipIndex =
                        Number(
                            button.dataset.relationshipIndex
                        );


                    const relationship =
                        relationships[
                            relationshipIndex
                        ];


                    if (relationship.onAdd) {
                        relationship.onAdd();
                    }

                }
            );

        });


        // ========================================================
        // ACTION BUTTONS
        // ========================================================

        const actionButtons =
            container.querySelectorAll(
                ".relationship-action-button"
            );


        actionButtons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const relationshipIndex =
                        Number(
                            button.dataset.relationshipIndex
                        );


                    const itemIndex =
                        Number(
                            button.dataset.itemIndex
                        );


                    const action =
                        button.dataset.action;


                    const relationship =
                        relationships[
                            relationshipIndex
                        ];


                    const item =
                        relationship.items[
                            itemIndex
                        ];


                    if (!item) {
                        return;
                    }


                    // =================================================
                    // VIEW
                    // =================================================

                    if (
                        action === "view" &&
                        relationship.onView
                    ) {

                        relationship.onView(item);

                    }


                    // =================================================
                    // EDIT
                    // =================================================

                    if (
                        action === "edit" &&
                        relationship.onEdit
                    ) {

                        relationship.onEdit(item);

                    }


                    // =================================================
                    // REMOVE
                    // =================================================

                    if (
                        action === "remove" &&
                        relationship.onRemove
                    ) {

                        await relationship.onRemove(item);

                    }

                }
            );

        });

    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeRelationshipHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ============================================================
    // INITIAL RENDER
    // ============================================================

    render();

}