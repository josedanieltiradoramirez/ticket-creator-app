// Shared top navigation for every detail page.
const navigationItems = [
    ["ticketsButton", "Tickets", "index.html"],
    ["toolsButton", "Tools", "tools.html"],
    ["locationsButton", "Locations", "locations.html"],
    ["queuesButton", "Queues", "queues.html"],
    ["wmsButton", "WMS", "warehouse-management-systems.html"],
    ["issueTypesButton", "Issue Types", "issue-types.html"],
    ["formsButton", "Forms", "forms.html"],
    ["troubleshootingTemplatesButton", "Troubleshooting Templates", "troubleshooting-templates.html"],
    ["knowledgeBaseButton", "Knowledge Base", "knowledge-base.html"],
    ["knowledgeBaseNotesButton", "Knowledge Base Notes", "knowledge-base-notes.html"]
];

const navigationContainer = document.getElementById("siteNavigation");

if (navigationContainer) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "css/navigation.css";
    document.head.appendChild(stylesheet);

    navigationContainer.innerHTML = `
        <header class="site-header">
            <h1>Ticket Creator</h1>
            <nav class="site-navigation" aria-label="Main navigation"></nav>
        </header>
    `;

    const navigation = navigationContainer.querySelector("nav");

    navigationItems.forEach(([id, label, url]) => {
        const button = document.createElement("button");
        button.id = id;
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => {
            window.location.href = url;
        });
        navigation.appendChild(button);
    });
}
