type BorderType = "top" | "right" | "bottom" | "left";

function getResizeCursor(types: BorderType[]) {
    // Sort the types to handle combinations consistently
    const borders = types.sort();

    // Corner cases (diagonal resize cursors)
    if (borders.includes("top") && borders.includes("left")) {
        return "nwse-resize"; // Top-left corner
    }
    if (borders.includes("top") && borders.includes("right")) {
        return "nesw-resize"; // Top-right corner
    }
    if (borders.includes("bottom") && borders.includes("left")) {
        return "nesw-resize"; // Bottom-left corner
    }
    if (borders.includes("bottom") && borders.includes("right")) {
        return "nwse-resize"; // Bottom-right corner
    }

    // Opposite edges (if both vertical or both horizontal edges are active)
    if (borders.includes("top") && borders.includes("bottom")) {
        return "ns-resize"; // Vertical resize
    }
    if (borders.includes("left") && borders.includes("right")) {
        return "ew-resize"; // Horizontal resize
    }

    // Single edge cases
    if (borders.includes("top")) {
        return "ns-resize";
    }
    if (borders.includes("bottom")) {
        return "ns-resize";
    }
    if (borders.includes("left")) {
        return "ew-resize";
    }
    if (borders.includes("right")) {
        return "ew-resize";
    }

    // Default cursor if no edges are active
    return "default";
}

export { getResizeCursor };
