// ============================================================
// RELATIONSHIPS COMPONENT
// ============================================================

function renderRelationships({
    containerId,
    relationships
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Relationships container "${containerId}" not found.`);
        return;
    }

    function render() {
        container.innerHTML = relationships
            .map((relationship, relationshipIndex) => {
                return `
                    <section class="relationships-section">

                        <div class="relationships-header">
                            <h2>${relationship.title}</h2>

                            <button
                                type="button"
                                class="relationships-add-button"
                                data-relationship-index="${relationshipIndex}"
                            >
                                + ${relationship.addLabel}
                            </button>
                        </div>

                        <div class="relationships-list">

                            ${
                                relationship.items.length === 0
                                    ? `
                                        <div class="relationships-empty">
                                            No ${relationship.title.toLowerCase()} found.
                                        </div>
                                    `
                                    : relationship.items.map((item, itemIndex) => {

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

                                                    <button
                                                        type="button"
                                                        class="relationship-action-button"
                                                        data-action="view"
                                                        data-relationship-index="${relationshipIndex}"
                                                        data-item-index="${itemIndex}"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        class="relationship-action-button"
                                                        data-action="edit"
                                                        data-relationship-index="${relationshipIndex}"
                                                        data-item-index="${itemIndex}"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        class="relationship-action-button remove"
                                                        data-action="remove"
                                                        data-relationship-index="${relationshipIndex}"
                                                        data-item-index="${itemIndex}"
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            </div>
                                        `;
                                    }).join("")
                            }

                        </div>

                    </section>
                `;
            })
            .join("");

        setupEvents();
    }

    function setupEvents() {
        const addButtons = container.querySelectorAll(
            ".relationships-add-button"
        );

        addButtons.forEach(button => {
            button.addEventListener("click", () => {
                const relationshipIndex =
                    Number(button.dataset.relationshipIndex);

                const relationship =
                    relationships[relationshipIndex];

                if (relationship.onAdd) {
                    relationship.onAdd();
                }
            });
        });

        const actionButtons = container.querySelectorAll(
            ".relationship-action-button"
        );

        actionButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const relationshipIndex =
                    Number(button.dataset.relationshipIndex);

                const itemIndex =
                    Number(button.dataset.itemIndex);

                const action =
                    button.dataset.action;

                const relationship =
                    relationships[relationshipIndex];

                const item =
                    relationship.items[itemIndex];

                if (!item) {
                    return;
                }

                if (action === "view" && relationship.onView) {
                    relationship.onView(item);
                }

                if (action === "edit" && relationship.onEdit) {
                    relationship.onEdit(item);
                }

                if (action === "remove" && relationship.onRemove) {
                    await relationship.onRemove(item);
                }
            });
        });
    }

    function escapeRelationshipHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    render();
}