function renderDetailHeader({
    type,
    title,
    description = ""
}) {

    const container = document.getElementById("detailHeader");

    if (!container) {
        console.error(
            "No se encontró el elemento #detailHeader"
        );

        return;
    }

    container.innerHTML = `
        <header class="detail-page-header">

            <div class="detail-page-header-content">

                <div class="detail-page-type">
                    ${escapeDetailHeaderHtml(type)}
                </div>

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

            <button
                class="detail-back-button"
                type="button"
                id="detailBackButton"
            >
                <span class="detail-back-icon">←</span>
                <span>Back</span>
            </button>

        </header>
    `;

    const backButton =
        document.getElementById("detailBackButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {
                window.history.back();
            }
        );

    }
}


function escapeDetailHeaderHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}