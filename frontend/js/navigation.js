/* ============================================================
   GLOBAL NAVIGATION
   ============================================================ */

const navigationItems = [
    {
        id: "tickets",
        label: "Tickets",
        icon: "T",
        page: "index.html"
    },
    {
        id: "tools",
        label: "Tools",
        icon: "T",
        page: "tools.html"
    },
    {
        id: "locations",
        label: "Locations",
        icon: "L",
        page: "locations.html"
    },
    {
        id: "queues",
        label: "Queues",
        icon: "Q",
        page: "queues.html"
    },
    {
        id: "wms",
        label: "WMS",
        icon: "W",
        page: "warehouse-management-systems.html"
    },
    {
        id: "issue-types",
        label: "Issue Types",
        icon: "I",
        page: "issue-types.html"
    },
    {
        id: "forms",
        label: "Forms",
        icon: "F",
        page: "forms.html"
    },
    {
        id: "troubleshooting-templates",
        label: "Troubleshooting Templates",
        icon: "T",
        page: "troubleshooting-templates.html"
    },
    {
        id: "knowledge-base",
        label: "Knowledge Base",
        icon: "K",
        page: "knowledge-base.html"
    },
    {
        id: "knowledge-base-notes",
        label: "Knowledge Base Notes",
        icon: "N",
        page: "knowledge-base-notes.html"
    }
];


/* ============================================================
   CREATE NAVIGATION
   ============================================================ */

function createNavigation() {

    const navigationContainer =
        document.getElementById("appNavigation");

    if (!navigationContainer) {
        return;
    }


    const sidebar = document.createElement("aside");

    sidebar.className = "app-sidebar";

    sidebar.id = "appSidebar";


    /* ========================================================
       HEADER
       ======================================================== */

    const sidebarHeader =
        document.createElement("div");

    sidebarHeader.className =
        "app-sidebar-header";


    const logo =
        document.createElement("div");

    logo.className =
        "app-sidebar-logo";

    logo.textContent =
        "Ticket Creator";


    const toggleButton =
        document.createElement("button");

    toggleButton.type = "button";

    toggleButton.className =
        "app-sidebar-toggle";

    toggleButton.id =
        "sidebarToggleButton";

    toggleButton.setAttribute(
        "aria-label",
        "Toggle navigation menu"
    );

    toggleButton.setAttribute(
        "title",
        "Toggle navigation menu"
    );

    toggleButton.innerHTML =
        "☰";


    sidebarHeader.appendChild(logo);
    sidebarHeader.appendChild(toggleButton);


    /* ========================================================
       NAVIGATION
       ======================================================== */

    const nav =
        document.createElement("nav");

    nav.className =
        "app-navigation";


    navigationItems.forEach(item => {

        const link =
            document.createElement("a");

        link.className =
            "app-navigation-item";

        link.href =
            item.page;

        link.dataset.navigationId =
            item.id;


        const icon =
            document.createElement("span");

        icon.className =
            "app-navigation-icon";

        icon.textContent =
            item.icon;


        const label =
            document.createElement("span");

        label.className =
            "app-navigation-label";

        label.textContent =
            item.label;


        link.appendChild(icon);
        link.appendChild(label);

        nav.appendChild(link);

    });


    /* ========================================================
       FOOTER
       ======================================================== */

    const footer =
        document.createElement("div");

    footer.className =
        "app-sidebar-footer";


    const logoutButton =
        document.createElement("button");

    logoutButton.type =
        "button";

    logoutButton.className =
        "app-navigation-item app-navigation-logout";

    logoutButton.id =
        "navigationLogoutButton";


    const logoutIcon =
        document.createElement("span");

    logoutIcon.className =
        "app-navigation-icon";

    logoutIcon.textContent =
        "↪";


    const logoutLabel =
        document.createElement("span");

    logoutLabel.className =
        "app-navigation-label";

    logoutLabel.textContent =
        "Logout";


    logoutButton.appendChild(logoutIcon);
    logoutButton.appendChild(logoutLabel);


    footer.appendChild(logoutButton);


    /* ========================================================
       ASSEMBLE SIDEBAR
       ======================================================== */

    sidebar.appendChild(sidebarHeader);
    sidebar.appendChild(nav);
    sidebar.appendChild(footer);


    navigationContainer.appendChild(sidebar);


    setupSidebar();
    setActiveNavigationItem();
}


/* ============================================================
   SIDEBAR BEHAVIOR
   ============================================================ */

function setupSidebar() {

    const sidebar =
        document.getElementById("appSidebar");

    const toggleButton =
        document.getElementById(
            "sidebarToggleButton"
        );


    if (!sidebar || !toggleButton) {
        return;
    }


    const savedState =
        localStorage.getItem(
            "ticketCreatorSidebarCollapsed"
        );


    if (savedState === "true") {

        sidebar.classList.add("collapsed");

    }


    toggleButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "collapsed"
            );


            const isCollapsed =
                sidebar.classList.contains(
                    "collapsed"
                );


            localStorage.setItem(
                "ticketCreatorSidebarCollapsed",
                isCollapsed
            );

        }
    );

}


/* ============================================================
   ACTIVE PAGE
   ============================================================ */

function setActiveNavigationItem() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    navigationItems.forEach(item => {

        const link =
            document.querySelector(
                `[data-navigation-id="${item.id}"]`
            );


        if (!link) {
            return;
        }


        if (
            currentPage === item.page ||
            (
                currentPage === "" &&
                item.page === "index.html"
            )
        ) {

            link.classList.add("active");

        }

    });

}


/* ============================================================
   LOGOUT
   ============================================================ */

function setupNavigationLogout() {

    const logoutButton =
        document.getElementById(
            "navigationLogoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

        }
    );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createNavigation();
        setupNavigationLogout();

    }
);