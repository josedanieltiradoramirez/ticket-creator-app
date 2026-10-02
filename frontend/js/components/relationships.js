// ============================================================
// RELATIONSHIPS COMPONENT
// ============================================================

// ============================================================
// RELATIONSHIPS STATE
// ============================================================

const relationshipsExpandedState = {};

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
    // STATE
    // ============================================================

    // Guarda el estado abierto/cerrado de cada relación.
    //
    // Ejemplo:
    // {
    //     "Queues": true,
    //     "Tools": false
    // }
    //
    // Esto permite conservar el estado cuando la sección
    // vuelve a renderizarse después de Add / Remove / etc.

    const stateKey = containerId;

    if (!relationshipsExpandedState[stateKey]) {
        relationshipsExpandedState[stateKey] = {
            main: expanded,
            relationships: {}
        };
    }

    const relationshipState =
        relationshipsExpandedState[stateKey];

    // ============================================================
    // RENDER
    // ============================================================

    function render() {

        const content = `
            <div class="relationships-content">

                ${relationships
                    .map(
                        (
                            relationship,
                            relationshipIndex
                        ) => {

                            return `
                                <div
                                    class="relationship-collapsible-container"
                                    id="relationshipSection_${relationshipIndex}"
                                ></div>
                            `;

                        }
                    )
                    .join("")}

            </div>
        `;


        // ========================================================
        // MAIN RELATIONSHIPS SECTION
        // ========================================================

        renderCollapsibleSection({
            containerId: containerId,
            title: "Relationships",
            content: content,
            expanded: relationshipState.main
        });


        // ========================================================
        // RENDER EACH RELATIONSHIP
        // ========================================================

        relationships.forEach(
            (
                relationship,
                relationshipIndex
            ) => {

                const relationshipContainer =
                    document.getElementById(
                        `relationshipSection_${relationshipIndex}`
                    );


                if (!relationshipContainer) {
                    return;
                }


                // ====================================================
                // ACTIONS
                // ====================================================

                const actions = {
                    view: true,
                    edit: true,
                    remove: true,
                    add: true,
                    create: true,
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
                                        .map(
                                            (
                                                item,
                                                itemIndex
                                            ) => {

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

                                            }
                                        )
                                        .join("")
                            }

                        </div>

                    </div>
                `;


                // ====================================================
                // RELATIONSHIP HEADER ACTIONS
                // ====================================================

                const relationshipHeaderActions = `
                    ${
                        actions.add
                            ? `
                                <button
                                    type="button"
                                    class="relationships-add-button"
                                    data-action="add"
                                    data-relationship-index="${relationshipIndex}"
                                >
                                    + ${escapeRelationshipHtml(
                                        relationship.addLabel
                                    )}
                                </button>
                            `
                            : ""
                    }


                    ${
                        actions.create
                            ? `
                                <button
                                    type="button"
                                    class="relationships-create-button"
                                    data-action="create"
                                    data-relationship-index="${relationshipIndex}"
                                >
                                    Create ${escapeRelationshipHtml(
                                        relationship.entityLabel
                                    )}
                                </button>
                            `
                            : ""
                    }
                `;


                // ====================================================
                // RELATIONSHIP COLLAPSIBLE SECTION
                // ====================================================

                renderCollapsibleSection({

                    containerId:
                        `relationshipSection_${relationshipIndex}`,

                    title:
                        relationship.title,

                    content:
                        relationshipContent,

                    expanded:
                        relationshipState.relationships[
                            relationship.title
                        ] ??
                        relationship.expanded ??
                        false,

                    headerActions:
                        relationshipHeaderActions

                });


                // ====================================================
                // TRACK COLLAPSIBLE STATE
                // ====================================================

                const relationshipSection =
                    relationshipContainer.querySelector(
                        ".collapsible-section"
                    );


                const relationshipHeader =
                    relationshipContainer.querySelector(
                        ".collapsible-section-header"
                    );


                if (
                    relationshipHeader &&
                    relationshipSection
                ) {

                    relationshipHeader.addEventListener(
                        "click",
                        () => {

                            relationshipState.relationships[
                                relationship.title
                            ] =
                                relationshipHeader.getAttribute(
                                    "aria-expanded"
                                ) === "true";

                        }
                    );

                }

            }
        );


        // ========================================================
        // TRACK MAIN RELATIONSHIPS STATE
        // ========================================================

        const mainHeader =
            container.querySelector(
                ".collapsible-section-header"
            );


        if (mainHeader) {

            mainHeader.addEventListener(
                "click",
                () => {

                    relationshipState.main =
                        mainHeader.getAttribute(
                            "aria-expanded"
                        ) === "true";

                }
            );

        }


        // ========================================================
        // EVENTS
        // ========================================================

        setupEvents();

    }


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


        addButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const relationshipIndex =
                            Number(
                                button.dataset.relationshipIndex
                            );


                        const relationship =
                            relationships[
                                relationshipIndex
                            ];


                        if (
                            relationship &&
                            relationship.onAdd
                        ) {

                            relationship.onAdd();

                        }

                    }
                );

            }
        );


        // ========================================================
        // CREATE BUTTONS
        // ========================================================

        const createButtons =
            container.querySelectorAll(
                ".relationships-create-button"
            );


        createButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const relationshipIndex =
                            Number(
                                button.dataset.relationshipIndex
                            );


                        const relationship =
                            relationships[
                                relationshipIndex
                            ];


                        if (
                            relationship &&
                            relationship.onCreate
                        ) {

                            relationship.onCreate();

                        }

                    }
                );

            }
        );


        // ========================================================
        // ITEM ACTION BUTTONS
        // ========================================================

        const actionButtons =
            container.querySelectorAll(
                ".relationship-action-button"
            );


        actionButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();


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


                        if (!relationship) {
                            return;
                        }


                        const item =
                            relationship.items[
                                itemIndex
                            ];


                        if (!item) {
                            return;
                        }


                        // =========================================
                        // VIEW
                        // =========================================

                        if (
                            action === "view" &&
                            relationship.onView
                        ) {

                            relationship.onView(
                                item
                            );

                        }


                        // =========================================
                        // EDIT
                        // =========================================

                        if (
                            action === "edit" &&
                            relationship.onEdit
                        ) {

                            relationship.onEdit(
                                item
                            );

                        }


                        // =========================================
                        // REMOVE
                        // =========================================

                        if (
                            action === "remove" &&
                            relationship.onRemove
                        ) {

                            await relationship.onRemove(
                                item
                            );

                        }

                    }
                );

            }
        );

    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeRelationshipHtml(value) {

        return String(value ?? "")
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


    // ============================================================
    // INITIAL RENDER
    // ============================================================

    render();

}