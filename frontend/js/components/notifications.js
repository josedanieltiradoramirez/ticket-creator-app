// ============================================================
// NOTIFICATIONS COMPONENT
// ============================================================

function showNotification({
    message,
    type = "info",
    duration = 3000
}) {

    let container =
        document.getElementById(
            "notificationContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "notificationContainer";

        document.body.appendChild(
            container
        );

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        `notification notification-${type}`;


    notification.innerHTML = `

        <span
            class="notification-icon"
        >
            ${getNotificationIcon(type)}
        </span>

        <span
            class="notification-message"
        >
            ${escapeNotificationHtml(message)}
        </span>

        <button
            type="button"
            class="notification-close"
            aria-label="Close notification"
        >
            ×
        </button>

    `;


    container.appendChild(
        notification
    );


    requestAnimationFrame(() => {

        notification.classList.add(
            "notification-visible"
        );

    });


    const closeButton =
        notification.querySelector(
            ".notification-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                removeNotification(
                    notification
                );

            }
        );

    }


    if (duration > 0) {

        setTimeout(() => {

            removeNotification(
                notification
            );

        }, duration);

    }

}


// ============================================================
// SUCCESS
// ============================================================

function showSuccessMessage(
    message
) {

    showNotification({

        message:
            message,

        type:
            "success",

        duration:
            3000

    });

}


// ============================================================
// ERROR
// ============================================================

function showErrorMessage(
    message
) {

    showNotification({

        message:
            message,

        type:
            "error",

        duration:
            4000

    });

}


// ============================================================
// WARNING
// ============================================================

function showWarningMessage(
    message
) {

    showNotification({

        message:
            message,

        type:
            "warning",

        duration:
            3500

    });

}


// ============================================================
// INFO
// ============================================================

function showInfoMessage(
    message
) {

    showNotification({

        message:
            message,

        type:
            "info",

        duration:
            3000

    });

}


// ============================================================
// REMOVE NOTIFICATION
// ============================================================

function removeNotification(
    notification
) {

    if (!notification) {
        return;
    }


    notification.classList.remove(
        "notification-visible"
    );


    setTimeout(() => {

        notification.remove();

    }, 180);

}


// ============================================================
// NOTIFICATION ICON
// ============================================================

function getNotificationIcon(
    type
) {

    switch (type) {

        case "success":
            return "✓";

        case "error":
            return "!";

        case "warning":
            return "⚠";

        case "info":
        default:
            return "i";

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeNotificationHtml(
    value
) {

    return String(
        value ?? ""
    )
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