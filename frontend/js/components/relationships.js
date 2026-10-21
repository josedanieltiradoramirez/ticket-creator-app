// ============================================================
// RELATIONSHIPS COMPONENT
// ============================================================

const relationshipItemOrderByContainer = new WeakMap();

function getRelationshipItemKey(item, index) {
    const id = item?.id ?? item?.issue_type_id;
    return id === null || id === undefined || id === ""
        ? `item-index:${index}`
        : `item-id:${id}`;
}

function preserveRelationshipAppendOrder(container, relationship, relationshipIndex) {
    let containerOrder = relationshipItemOrderByContainer.get(container);

    if (!containerOrder) {
        containerOrder = new Map();
        relationshipItemOrderByContainer.set(container, containerOrder);
    }

    const relationshipKey = `${relationshipIndex}:${relationship.title || relationship.entityLabel || ""}`;
    const incomingItems = Array.isArray(relationship.items)
        ? relationship.items
        : [];
    const previousOrder = containerOrder.get(relationshipKey) || [];
    const incomingByKey = new Map(
        incomingItems.map((item, index) => [
            getRelationshipItemKey(item, index),
            item
        ])
    );
    const orderedKeys = previousOrder.filter(key => incomingByKey.has(key));
    const orderedKeySet = new Set(orderedKeys);
    const newItems = incomingItems
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) =>
            !orderedKeySet.has(getRelationshipItemKey(item, index))
        )
        .sort((left, right) => {
            const leftId = Number(
                left.item?.id ?? left.item?.issue_type_id
            );
            const rightId = Number(
                right.item?.id ?? right.item?.issue_type_id
            );
            const bothNumeric =
                Number.isFinite(leftId) && Number.isFinite(rightId);

            if (bothNumeric && leftId !== rightId) {
                return leftId - rightId;
            }

            return left.index - right.index;
        })
        .map(({ item }) => item);

    newItems.forEach(item => {
        const originalIndex = incomingItems.indexOf(item);
        const key = getRelationshipItemKey(item, originalIndex);
        orderedKeys.push(key);
        incomingByKey.set(key, item);
    });

    containerOrder.set(relationshipKey, orderedKeys);
    return orderedKeys.map(key => incomingByKey.get(key));
}

function renderRelationships({
    containerId,
    relationships,
    expanded = true
}) {
    const container =
        document.getElementById(containerId);

    if (!container) {
        console.error(
            `Relationships container "${containerId}" not found.`
        );

        return;
    }

    relationships.forEach((relationship, relationshipIndex) => {
        relationship.items = preserveRelationshipAppendOrder(
            container,
            relationship,
            relationshipIndex
        );

        if (typeof relationship.sortItems === "function") {
            relationship.items.sort(relationship.sortItems);
        }
    });

    // ========================================================
    // RENDER RELATIONSHIP CONTAINERS
    // ========================================================

    const existingContainers =
        Array.from(
            container.querySelectorAll(
                ".relationship-collapsible-container"
            )
        );

    relationships.forEach(
        (
            relationship,
            relationshipIndex
        ) => {
            const relationshipContainerId =
                `relationshipSection_${relationshipIndex}`;

            let relationshipContainer =
                document.getElementById(
                    relationshipContainerId
                );

            if (!relationshipContainer) {
                relationshipContainer =
                    document.createElement("div");

                relationshipContainer.className =
                    "relationship-collapsible-container";

                relationshipContainer.id =
                    relationshipContainerId;

                container.appendChild(
                    relationshipContainer
                );
            }
        }
    );

    // ========================================================
    // REMOVE UNUSED RELATIONSHIP CONTAINERS
    // ========================================================

    existingContainers.forEach(
        relationshipContainer => {
            const relationshipIndex =
                Number(
                    relationshipContainer.id.replace(
                        "relationshipSection_",
                        ""
                    )
                );

            if (
                relationshipIndex >=
                relationships.length
            ) {
                relationshipContainer.remove();
            }
        }
    );

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
                                            const itemContent =
                                                relationship.renderItem
                                                    ? relationship.renderItem(item)
                                                    : escapeRelationshipHtml(
                                                        relationship.getItemName
                                                            ? relationship.getItemName(item)
                                                            : item.name ?? "-"
                                                    );

                                            return `
                                                <div class="relationship-item">

                                                    <div class="relationship-item-name">
                                                        ${itemContent}
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
                    relationshipContainer.id,

                title:
                    relationship.title,

                content:
                    relationshipContent,

                expanded:
                    relationship.expanded ??
                    expanded ??
                    false,

                headerActions:
                    relationshipHeaderActions
            });
        }
    );

    // ========================================================
    // EVENTS
    // ========================================================

    setupEvents();

    // ========================================================
    // EVENT HANDLERS
    // ========================================================

    function setupEvents() {

        // ====================================================
        // ADD BUTTONS
        // ====================================================

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
                                button.dataset
                                    .relationshipIndex
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

        // ====================================================
        // CREATE BUTTONS
        // ====================================================

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
                                button.dataset
                                    .relationshipIndex
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

        // ====================================================
        // ITEM ACTION BUTTONS
        // ====================================================

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
                                button.dataset
                                    .relationshipIndex
                            );

                        const itemIndex =
                            Number(
                                button.dataset
                                    .itemIndex
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

                        // ========================================
                        // VIEW
                        // ========================================

                        if (
                            action === "view" &&
                            relationship.onView
                        ) {
                            relationship.onView(
                                item
                            );
                        }

                        // ========================================
                        // EDIT
                        // ========================================

                        if (
                            action === "edit" &&
                            relationship.onEdit
                        ) {
                            relationship.onEdit(
                                item
                            );
                        }

                        // ========================================
                        // REMOVE
                        // ========================================

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
