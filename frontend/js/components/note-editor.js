// ============================================================
// NOTE EDITOR COMPONENT
// ============================================================

function renderNoteEditor({
    containerId,
    content = "",
    onSave = null
}) {
    const container =
        document.getElementById(containerId);

    if (!container) {
        console.error(
            `Note editor container "${containerId}" not found.`
        );
        return;
    }

    const currentContent =
        String(content ?? "");

    container.innerHTML = `
        <section class="note-editor-section">

            <div class="note-editor-header">

                <div class="note-editor-title-wrapper">
                    <h2 class="note-editor-title">
                        Content
                    </h2>
                </div>

                <div class="note-editor-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        id="noteEditorEditButton"
                    >
                        Edit
                    </button>

                </div>

            </div>

            <div class="note-editor-content">

                <div
                    id="noteEditorRead"
                    class="note-editor-read"
                >${escapeNoteEditorHtml(
                    currentContent || "-"
                )}</div>

                <textarea
                    id="noteEditorTextarea"
                    class="note-editor-textarea hidden"
                    aria-label="Knowledge Base Note content"
                ></textarea>

                <div
                    id="noteEditorEditActions"
                    class="note-editor-edit-actions hidden"
                >

                    <button
                        type="button"
                        class="secondary-button"
                        id="noteEditorCancelButton"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="primary-button"
                        id="noteEditorSaveButton"
                    >
                        Save
                    </button>

                </div>

            </div>

        </section>
    `;

    const editButton =
        document.getElementById(
            "noteEditorEditButton"
        );

    const cancelButton =
        document.getElementById(
            "noteEditorCancelButton"
        );

    const saveButton =
        document.getElementById(
            "noteEditorSaveButton"
        );

    const readArea =
        document.getElementById(
            "noteEditorRead"
        );

    const textarea =
        document.getElementById(
            "noteEditorTextarea"
        );

    const editActions =
        document.getElementById(
            "noteEditorEditActions"
        );

    let savedContent =
        currentContent;

    // ========================================================
    // OPEN EDITOR
    // ========================================================

    function openEditor() {
        textarea.value =
            savedContent;

        readArea.classList.add(
            "hidden"
        );

        textarea.classList.remove(
            "hidden"
        );

        editButton.classList.add(
            "hidden"
        );

        editActions.classList.remove(
            "hidden"
        );

        textarea.focus();
    }

    // ========================================================
    // CLOSE EDITOR
    // ========================================================

    function closeEditor() {
        textarea.value =
            savedContent;

        textarea.classList.add(
            "hidden"
        );

        readArea.classList.remove(
            "hidden"
        );

        editActions.classList.add(
            "hidden"
        );

        editButton.classList.remove(
            "hidden"
        );
    }

    // ========================================================
    // EVENTS
    // ========================================================

    editButton.addEventListener(
        "click",
        openEditor
    );

    cancelButton.addEventListener(
        "click",
        closeEditor
    );

    saveButton.addEventListener(
        "click",
        async () => {

            const newContent =
                textarea.value.trim();

            if (!newContent) {
                showErrorMessage(
                    "Note content cannot be empty."
                );
                return;
            }

            saveButton.disabled =
                true;

            try {

                if (onSave) {
                    await onSave(
                        newContent
                    );
                }

                savedContent =
                    newContent;

                readArea.textContent =
                    savedContent;

                closeEditor();

            } catch (error) {

                console.error(
                    "Error saving note content:",
                    error
                );

                showErrorMessage(
                    "Error updating note content."
                );

            } finally {

                saveButton.disabled =
                    false;
            }
        }
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeNoteEditorHtml(value) {
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