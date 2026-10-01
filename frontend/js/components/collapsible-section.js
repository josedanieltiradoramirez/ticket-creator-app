// ============================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================

function renderCollapsibleSection({
    containerId,
    title,
    content,
    expanded = true,
    headerActions = ""
}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(
            `Collapsible section container "${containerId}" not found.`
        );

        return;
    }


    container.innerHTML = `
        <section class="collapsible-section">

            <div
                class="collapsible-section-header"
                role="button"
                tabindex="0"
                aria-expanded="${expanded}"
            >

                <div class="collapsible-section-title-wrapper">

                    <span class="collapsible-section-icon">
                        ${expanded ? "▼" : "▶"}
                    </span>

                    <h2 class="collapsible-section-title">
                        ${escapeCollapsibleHtml(title)}
                    </h2>

                </div>


                ${
                    headerActions
                        ? `
                            <div class="collapsible-section-header-actions">
                                ${headerActions}
                            </div>
                        `
                        : ""
                }

            </div>


            <div
                class="collapsible-section-content ${
                    expanded
                        ? "collapsible-section-expanded"
                        : "collapsible-section-collapsed"
                }"
            >
                ${content}
            </div>

        </section>
    `;


    const header =
        container.querySelector(
            ".collapsible-section-header"
        );


    const icon =
        container.querySelector(
            ".collapsible-section-icon"
        );


    const sectionContent =
        container.querySelector(
            ".collapsible-section-content"
        );


    function toggleSection() {

        const isExpanded =
            header.getAttribute(
                "aria-expanded"
            ) === "true";


        const newExpandedState =
            !isExpanded;


        header.setAttribute(
            "aria-expanded",
            String(newExpandedState)
        );


        icon.textContent =
            newExpandedState
                ? "▼"
                : "▶";


        sectionContent.classList.toggle(
            "collapsible-section-expanded",
            newExpandedState
        );


        sectionContent.classList.toggle(
            "collapsible-section-collapsed",
            !newExpandedState
        );
    }


    header.addEventListener(
        "click",
        (event) => {

            /*
             * If the user clicked a button inside the header,
             * do not collapse/expand the section.
             */

            if (
                event.target.closest(
                    ".collapsible-section-header-actions"
                )
            ) {
                return;
            }


            toggleSection();
        }
    );


    header.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                toggleSection();
            }
        }
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeCollapsibleHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}