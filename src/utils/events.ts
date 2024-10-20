type NodeEvent = {
    ref: HTMLElement;
    nodeId: string;
    data: string;
    isMeta: boolean;
    isQxBar: boolean;
};

function parseNodeEvent(e: KeyboardEvent): NodeEvent | undefined {
    function isTextElement(el: HTMLElement) {
        const CONTENT_EDITABLE_CLASS = "contenteditable";
        const isContentEditable = el.classList.contains(CONTENT_EDITABLE_CLASS);
        const isTextarea = el.tagName === "TEXTAREA";
        return isContentEditable || isTextarea;
    }

    const target = e.target as HTMLElement;
    const dataset = target.dataset;
    const nodeId = dataset["nodeid"];
    const data = target.textContent;
    if (nodeId === undefined) return;
    if (data === null) {
        console.warn("No data", target);
        return;
    }
    return {
        ref: target,
        nodeId,
        data,
        isMeta: e.metaKey || e.ctrlKey,
        isQxBar: target.classList.contains("qx-bar"),
    };
}
