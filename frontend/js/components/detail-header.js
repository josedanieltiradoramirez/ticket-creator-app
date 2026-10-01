function renderDetailHeader({
    containerId,
    type,
    title,
    description = "",
    actions = {},
    onBack = null,
    onEdit = null
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Detail header container "${containerId}" not found.`
        );
        return;
    }

    const {
        back = true,
        edit = false
    } = actions;

    const headerActions = [];

    if (back) {
        headerActions.push(`
            <button
                type="button"
                class="detail-back-button"
                id="detailHeaderBackButton"
            >
                <span class="detail-back-icon">←</span>
                <span>Back</span>
            </button>
        `);
    }

    if (edit) {
        headerActions.push(`
            <button
                type="button"
                class="detail-header-action-button"
                id="detailHeaderEditButton"
            >
                Edit
            </button>
        `);
    }

    container.innerHTML = `
        <header class="detail-page-header">

            <div class="detail-page-header-content">

                <p class="detail-page-type">
                    ${escapeDetailHeaderHtml(type)}
                </p>

                <h1 class="detail-page-title">
                    ${escapeDetailHeaderHtml(title)}
                </h1>

                ${
                    description
                        ? `
                            <p class="detail-page-description">
                                ${escapeDetailHeaderHtml(description)}
                            </p>
                        `
                        : ""
                }

            </div>

            ${
                headerActions.length > 0
                    ? `
                        <div class="detail-page-actions">
                            ${headerActions.join("")}
                        </div>
                    `
                    : ""
            }

        </header>
    `;

    const backButton = document.getElementById(
        "detailHeaderBackButton"
    );

    if (backButton && onBack) {
        backButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onBack();
            }
        );
    }

    const editButton = document.getElementById(
        "detailHeaderEditButton"
    );

    if (editButton && onEdit) {
        editButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                onEdit();
            }
        );
    }
}


function escapeDetailHeaderHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}