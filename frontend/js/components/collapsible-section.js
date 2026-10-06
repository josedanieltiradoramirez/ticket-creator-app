function renderCollapsibleSection({
    containerId,
    title,
    content,
    expanded = true,
    headerActions = ""
}) {
    const container =
        document.getElementById(containerId);

    if (!container) {
        console.error(
            `Collapsible section container "${containerId}" not found.`
        );

        return;
    }

    /*
     * ============================================================
     * PRESERVE CURRENT STATE
     * ============================================================
     *
     * If this section has already been rendered, preserve its
     * current expanded/collapsed state.
     *
     * This allows any component that uses this function to be
     * re-rendered without losing the user's current state.
     *
     * First render:
     *     uses the "expanded" argument.
     *
     * Subsequent renders:
     *     uses the existing aria-expanded state.
     */

    let currentExpanded = expanded;

    const existingHeader =
        container.querySelector(
            ".collapsible-section-header"
        );

    if (existingHeader) {
        currentExpanded =
            existingHeader.getAttribute(
                "aria-expanded"
            ) === "true";
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    container.innerHTML = `
        <section class="collapsible-section">

            <div
                class="collapsible-section-header"
                role="button"
                tabindex="0"
                aria-expanded="${currentExpanded}"
            >

                <div class="collapsible-section-title-wrapper">

                    <span class="collapsible-section-icon">
                        ${currentExpanded ? "▼" : "▶"}
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
                class="
                    collapsible-section-content
                    ${
                        currentExpanded
                            ? "collapsible-section-expanded"
                            : "collapsible-section-collapsed"
                    }
                "
            >
                ${content}
            </div>

        </section>
    `;

    /*
     * ============================================================
     * ELEMENTS
     * ============================================================
     */

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

    if (
        !header ||
        !icon ||
        !sectionContent
    ) {
        return;
    }

    /*
     * ============================================================
     * TOGGLE
     * ============================================================
     */

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

    /*
     * ============================================================
     * MOUSE / KEYBOARD EVENTS
     * ============================================================
     */

    header.addEventListener(
        "click",
        (event) => {

            /*
             * Buttons inside the header must not
             * toggle the collapsible section.
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


/*
 * ============================================================
 * HTML ESCAPE
 * ============================================================
 */

function escapeCollapsibleHtml(value) {
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