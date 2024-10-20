import { debounce } from "lodash";

import { FRAMES_PER_SECOND } from "../constants";
import { Control } from "../flux/Control";
import { layout as LayoutType, layoutLayoutPost } from "../server/client";
import { findNode, linksToEdges, setNodesBatched } from "../store";
import { newPath } from "../utils/path";
import { getNodesInBox } from "./SelectionBox";
import viewbox from "./Viewbox";

type SetLayout = {
    nids: string[];
    eids: [string, string][];
    layout: LayoutType;
    durationSec: number;
    bbox: { x: number; y: number; w: number; h: number };
};

const LAYOUTS: LayoutType[] = [
    "auto",
    "grid",
    "circle",
    "random",
    "reingold_tilford",
    "reingold_tilford_circular",
    "sugiyama",
    "kamada_kawai",
    // custom
    // "squarify",
];

function layoutControl(layout: LayoutType): Control {
    function onClick() {
        console.log("layoutControl click", { layout });
        // shift center by x and y

        const aspectScale = 0.5;

        const { x, y, w, h } = viewbox(); // x, y are center
        const viewboxNodes = getNodesInBox({
            x: x - w / 2,
            y: y - h / 2,
            w,
            h,
        });
        const nids = viewboxNodes.map((n) => n.id);

        const eids = viewboxNodes
            .flatMap((n) => linksToEdges(n))
            .filter((e) => nids.includes(e.ab) && nids.includes(e.ad))
            .map((e) => [e.ab, e.ad]) as [string, string][];

        const geometry = { x, y, w: w * aspectScale, h: h * aspectScale };

        setLayout({ nids, eids, layout, durationSec: 1.5, bbox: geometry });
    }

    return {
        type: "button",
        name: layout,
        control: {
            onClick,
        },
    };
}

function layoutControls() {
    const controls: Control[] = LAYOUTS.map(layoutControl);
    return controls;
}

function setLayout(props: SetLayout) {
    const nStep = FRAMES_PER_SECOND * props.durationSec;
    const nNode = props.nids.length;

    if (nNode === 0) return console.log("no nodes to layout", props);

    const steps = Array.from({ length: nStep }, (_, i) => i / nStep);

    console.log("layoutLayoutPost", props, { ...props }, viewbox());
    layoutLayoutPost({ body: props })
        .then(({ data }) => {
            if (!data) throw new Error("no data");
            return data;
        })
        .then((nvs) => {
            nvs.forEach(({ id, v: [xNew, yNew] }) => {
                const node = findNode(id);
                const v0 = [node.x, node.y];

                const pathElement = newPath(v0[0], v0[1], xNew, yNew);
                const pathLength = pathElement.getTotalLength();

                // Retrieve coordinates along the path
                const updates = steps.map((t) => {
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return {
                        id,
                        x: Math.round(point.x),
                        y: Math.round(point.y),
                    };
                });
                setNodesBatched(updates);
            });
        })
        .catch((e) => console.error(e, props));
    return;
}

const debouncedSetLayout = debounce(setLayout, 1000, {
    leading: true,
    trailing: true,
});

export { debouncedSetLayout, layoutControls, setLayout };

export type { LayoutType };

// if (graph.layout === "squarify") {
//     const areas = graph.nodes.map((n) => n.w * n.h);
//     squarifySquarifyPost({ body: { areas, bbox } })
//         .then(({ data }) => {
//             if (!data) throw new Error("no data");
//             return data;
//         })
//         .then((squares) => {
//             console.log("squares", squares);
//         });
// } else {
