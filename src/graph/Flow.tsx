import { Accessor, createMemo, For } from "solid-js";

import { useQx } from "~/flux/Flux";
import { Edge, linksToEdges, nodes } from "~/store";

import qxLink from "./Link";
import qxNode from "./Node";
import SelectionBox from "./SelectionBox";
import { handleWheel, viewboxToStyle } from "./Viewbox";

import "./flow.css";

type FlowProps = {
    nexusId: Accessor<string | undefined>;
};

function Graph() {
    const qx = useQx();
    if (!qx) return null;

    console.log("Graph Render", qx);

    let ref: SVGSVGElement | undefined = undefined;

    const edges = createMemo(() => {
        const flowNodes = nodes.filter((n) => qx.flux.nodeIds.includes(n.id));
        const edges = [] as Edge[];
        for (const node of flowNodes) {
            edges.push(...linksToEdges(node));
        }
        return edges;
    });

    return (
        <>
            <svg
                ref={ref!}
                class="flow"
                onWheel={handleWheel}
                viewBox={viewboxToStyle()}
            >
                <For each={edges()}>{qxLink}</For>
                <For each={qx.flux.nodeIds}>{(id) => qxNode({ id })}</For>
            </svg>
            <div>
                <SelectionBox canvasRef={ref} />
            </div>
        </>
    );
}

{
    /* <NumericList values={numericValues} /> */
}
export default Graph;

export type { Graph, FlowProps as GraphProps };
