// ============================================================
// MODAL COMPONENT
// ============================================================

function renderModal({
    containerId,
    title,
    content,
    onClose
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Modal container "${containerId}" not found.`
        );

        return;
    }


    container.innerHTML = `
        <div class="modal-content">

            <div class="modal-header">

                <h3>
                    ${escapeModalHtml(title)}
                </h3>

                <button
                    type="button"
                    class="modal-close"
                    data-modal-close
                >
                    ×
                </button>

            </div>


            <div class="modal-body">

                ${content}

            </div>

        </div>
    `;


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

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}