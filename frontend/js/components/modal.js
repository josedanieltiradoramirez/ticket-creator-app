// ============================================================
// MODAL COMPONENT
// ============================================================

function renderModal({
    containerId,
    title,
    content,
    onClose
}) {
    const container =
        document.getElementById(containerId);

    if (!container) {
        console.error(
            `Modal container "${containerId}" not found.`
        );

        return;
    }

    container.classList.add("modal");
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-modal", "true");

    // ========================================================
    // RENDER
    // ========================================================

    container.innerHTML = `
        <div class="modal-content">

            <div class="modal-header">

                <h3 class="modal-title">
                    ${escapeModalHtml(title)}
                </h3>

                <button
                    type="button"
                    class="modal-close"
                    data-modal-close
                    aria-label="Close dialog"
                >
                    ×
                </button>

            </div>

            <div class="modal-body">

                ${content}

            </div>

        </div>
    `;

    // ========================================================
    // CLOSE BUTTON
    // ========================================================

    const closeButton =
        container.querySelector(
            "[data-modal-close]"
        );

    if (closeButton && onClose) {
        closeButton.addEventListener(
            "click",
            () => {
                onClose();
            }
        );
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeModalHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
