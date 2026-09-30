// ============================================================
// FORM SECTION COMPONENT
// ============================================================

function renderFormSection({
    containerId,
    form,
    onChange
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Form section container "${containerId}" not found.`
        );

        return;
    }


    container.innerHTML = `
        <section class="form-section">

            <div class="form-section-header">

                <h2>
                    Form
                </h2>

                <button
                    type="button"
                    class="form-section-change-button"
                    id="formSectionChangeButton"
                >
                    ${form ? "Change Form" : "Add Form"}
                </button>

            </div>


            ${
                form
                    ? `
                        <div class="form-section-content">

                            <div class="form-section-row">

                                <div class="form-section-label">
                                    Form
                                </div>

                                <div class="form-section-value">
                                    ${escapeFormHtml(form.name || "-")}
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

                        </div>
                    `
                    : `
                        <div class="form-section-empty">
                            No form assigned.
                        </div>
                    `
            }

        </section>
    `;


    const changeButton =
        document.getElementById(
            "formSectionChangeButton"
        );


    if (changeButton && onChange) {

        changeButton.addEventListener(
            "click",
            () => {
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