let locationId = null;
let currentLocation = null;
let warehouseManagementSystems = [];

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const params =
            new URLSearchParams(
                window.location.search
            );

        locationId =
            Number(
                params.get("id")
            );

        if (!locationId) {
            showErrorMessage(
                "Invalid location ID."
            );

            window.location.href =
                "locations.html";

            return;
        }

        await loadLocation();
    }
);

// ============================================================
// LOAD LOCATION
// ============================================================

async function loadLocation() {
    try {
        currentLocation =
            await getLocation(
                locationId
            );

        warehouseManagementSystems =
            await getWarehouseManagementSystems();

        renderLocation();
    } catch (error) {
        console.error(
            "Error loading location:",
            error
        );

        showErrorMessage(
            "Error loading location."
        );

        window.location.href =
            "locations.html";
    }
}

// ============================================================
// RENDER LOCATION
// ============================================================

function renderLocation() {
    document.title =
        `${currentLocation.name} - Location`;

    renderLocationHeader();
    renderLocationBasicInformation();
}

// ============================================================
// DETAIL HEADER
// ============================================================

function renderLocationHeader() {
    renderDetailHeader({
        containerId: "detailHeader",
        type: "Location",
        title: currentLocation.name,
        description: "",
        actions: {
            back: true,
            edit: false
        },
        onBack: () => {
            window.location.href =
                "locations.html";
        }
    });
}

// ============================================================
// BASIC INFORMATION
// ============================================================

function renderLocationBasicInformation() {
    renderBasicInformationComponent({
        containerId: "basicInformation",
        data: currentLocation,
        fields: [
            {
                key: "id",
                label: "ID",
                type: "text",
                readonly: true
            },
            {
                key: "name",
                label: "Name",
                type: "text"
            },
            {
                key: "city",
                label: "City",
                type: "text"
            },
            {
                key: "state",
                label: "State",
                type: "text"
            },
            {
                key: "code",
                label: "Code",
                type: "text"
            },
            {
                key: "is_active",
                label: "Status",
                type: "boolean"
            },
            {
                key: "warehouse_management_system_id",
                label: "Warehouse Management System",
                type: "select",
                options: [
                    {
                        value: "",
                        label: "None"
                    },
                    ...warehouseManagementSystems.map(
                        wms => ({
                            value: wms.id,
                            label: wms.name
                        })
                    )
                ]
            }
        ],
        expanded: true,
        onSave: async (updatedData) => {
            const data = {
                name: updatedData.name,
                city: updatedData.city,
                state: updatedData.state,
                code: updatedData.code,
                is_active: updatedData.is_active,
                warehouse_management_system_id:
                    updatedData
                        .warehouse_management_system_id === ""
                        ? null
                        : Number(
                            updatedData
                                .warehouse_management_system_id
                        )
            };

            const updatedLocation =
                await updateLocation(
                    locationId,
                    data
                );

            Object.assign(
                currentLocation,
                updatedLocation || data
            );

            renderLocationHeader();

            showSuccessMessage(
                "Location updated successfully."
            );
        }
    });
}
