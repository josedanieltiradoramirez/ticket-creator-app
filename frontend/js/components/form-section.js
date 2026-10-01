// ============================================================
// FORM SECTION COMPONENT
// ============================================================

function renderFormSection({
    containerId,
    form,
    onChange,
    expanded = true
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Form section container "${containerId}" not found.`
        );

        return;
    }


    // ============================================================
    // CONTENT
    // ============================================================

    const content = `
        <div class="form-section-content">

            ${
                form
                    ? `
                        <div class="form-section-row">

                            <div class="form-section-label">
                                Form
                            </div>

                            <div class="form-section-value">
                                ${escapeFormHtml(
                                    form.name || "-"
                                )}
                            </div>

                        </div>


                        <div class="form-section-row">

                            <div class="form-section-label">
                                Description
                            </div>

                            <div class="form-section-value">
                                ${escapeFormHtml(
                                    form.description || "-"
                                )}
                            </div>

                        </div>
                    `
                    : `
                        <div class="form-section-empty">
                            No form assigned.
                        </div>
                    `
            }

        </div>
    `;


    // ============================================================
    // HEADER BUTTON
    // ============================================================

    const headerButton = `
        <button
            type="button"
            id="formSectionChangeButton"
        >
            ${form ? "Change Form" : "Add Form"}
        </button>
    `;


    // ============================================================
    // COLLAPSIBLE SECTION
    // ============================================================

    renderCollapsibleSection({
        containerId: containerId,

        title: "Form",

        content: content,

        expanded: expanded,

        headerActions: headerButton
    });


    // ============================================================
    // CHANGE / ADD FORM BUTTON
    // ============================================================

    const changeButton =
        document.getElementById(
            "formSectionChangeButton"
        );


    if (changeButton && onChange) {

        changeButton.addEventListener(
            "click",
            (event) => {

                /*
                 * Prevent the header click from
                 * collapsing/expanding the section.
                 */

                event.stopPropagation();

                onChange();

            }
        );

    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeFormHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}