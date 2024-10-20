import {
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
    Show,
} from "solid-js";

import { useQx } from "~/flux/Flux";
import { Bbox } from "~/server/client";
import { nodes, setNodes } from "~/store";
import { toPx } from "~/utils/convert";

function clientXyToCanvasXy(x: number, y: number, canvas: SVGSVGElement) {
    const ctm = canvas.getScreenCTM();
    const xy0 = new DOMPoint(x, y);
    const canvasXy = xy0.matrixTransform(ctm?.inverse());
    return canvasXy;
}

function getNodesInBox(box: Bbox) {
    return nodes.filter((node) => {
        const { x, y } = node;
        return x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h;
    });
}

function SelectionBox({ canvasRef }: { canvasRef: SVGSVGElement | undefined }) {
    //
    // - client x & y are # of pixels from top left viewport
    const [visible, setVisible] = createSignal(false);

    const [x0, setX0] = createSignal(0);
    const [y0, setY0] = createSignal(0);
    const [x1, setX1] = createSignal(0);
    const [y1, setY1] = createSignal(0);

    const minX = createMemo(() => Math.min(x0(), x1()));
    const minY = createMemo(() => Math.min(y0(), y1()));
    const width = createMemo(() => Math.abs(x1() - x0()));
    const height = createMemo(() => Math.abs(y1() - y0()));

    const [widthPx, setWidthPx] = createSignal<string | undefined>(undefined);
    const [heightPx, setHeightPx] = createSignal<string | undefined>(undefined);
    const [leftPx, setLeftPx] = createSignal<string | undefined>(undefined);
    const [topPx, setTopPx] = createSignal<string | undefined>(undefined);

    const [inBoxNodeIds, setInBoxNodeIds] = createSignal<string[]>([]);

    const qx = useQx();
    if (!qx) {
        console.warn("SelectionBox needs qx");
        return null;
    }

    createEffect(() => {
        const wPx = toPx(width());
        const hPx = toPx(height());
        const lPx = toPx(minX());
        const tPx = toPx(minY());

        requestAnimationFrame(() => {
            setWidthPx(wPx);
            setHeightPx(hPx);
            setLeftPx(lPx);
            setTopPx(tPx);
        });
    });

    function handleMouseDown(e: MouseEvent) {
        if (e.target !== canvasRef) return;

        e.stopPropagation();
        e.preventDefault();

        const { x, y } = { x: e.clientX, y: e.clientY };
        setX0(x);
        setY0(y);
        setX1(x);
        setY1(y);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        setX1(e.clientX);
        setY1(e.clientY);

        // get the bounds of the selection box on the canvas
        // these are client coordinates, so they need to be converted to canvas coordinates
        if (!canvasRef) return;

        if (!visible()) setVisible(true);

        const { x, y } = clientXyToCanvasXy(minX(), minY(), canvasRef) || {
            x: 0,
            y: 0,
        };

        const ids = getNodesInBox({ x, y, w: width(), h: height() }).map(
            (n) => n.id
        );

        setInBoxNodeIds((prev) => {
            if (ids.length === 0) return [];
            const allEqual = ids.every((id, i) => id === prev[i]);
            if (allEqual) return prev;
            return ids;
        });
    }

    function handleMouseUp(e: MouseEvent | KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        setVisible(false);

        setX0(0);
        setY0(0);
        setX1(0);
        setY1(0);

        // unselect all nodes, then select the ones in the box

        // can include this line to prevent unselecting on click
        // if (inBoxNodeIds().length === 0) return;

        const sids = inBoxNodeIds();
        console.log("selection box selectedIds", sids);

        if (sids.length !== 0) {
            qx?.flux.selectedIds.forEach((id) => {
                setNodes((n) => n.id === id, { selected: false });
            });
            sids.forEach((id) => {
                setNodes((n) => n.id === id, { selected: true });
            });
        }

        setInBoxNodeIds([]);

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }

    onMount(() => {
        document.addEventListener("mousedown", handleMouseDown);
    });

    onCleanup(() => {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    });

    return (
        <Show when={visible()}>
            <div
                style={{
                    position: "absolute",
                    left: leftPx(),
                    top: topPx(),
                    width: widthPx(),
                    height: heightPx(),
                    "background-color": "rgba(131, 128, 128, 0.719)",
                    "box-shadow": "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                    "z-index": 1000000,
                }}
                onMouseMove={handleMouseMove}
            />
        </Show>
    );
}

export default SelectionBox;

export { getNodesInBox };

// function highlight(ids: string[]) {
//   const updates = ids.map((id) => ({ id, highlight: true }));
//   Nd.set(updates);
// }

// function unhighlight(ids: string[]) {
//   const updates = ids.map((id) => ({ id, highlight: false }));
//   Nd.set(updates);
// }
// const ids = unwrap(insideBoxIds)();
// console.log("selection box selectedIds", ids);

// ids.forEach((id) => {
//     setNodes(
//         (n) => n.id === id,
//         produce((n) => {
//             n.selected = true;
//         })
//     );
// });

// const [insideBoxIds, setInsideBoxIds] = createSignal<string[]>([]);

// listeners from this drag

// setInsideBoxIds([]);

// const { x, y } = clientXyToCanvasXy(e.clientX, e.clientY, canvasRef);

// const point = canvasRef.getCTM()?.inverse().transformPoint({
//     x: e.clientX,
//     y: e.clientY,
// });
// if (!point) return;
// const { x, y } = point;
