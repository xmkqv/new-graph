import { For, onMount } from "solid-js";
import { createMemo } from "solid-js";

import type { Query } from "~/store";
import { backupModifier } from "~/store";
import { Rect } from "~/utils/rect";

import FluxElement, { ChatElement, useQx } from "../Flux";
import TileElement, { getTile, Tile } from "./tile/Tile";

type TreeOptions = {
    fork?: { scope: "flux" | "global" };
    rect?: Rect;
};

type TreeProps = {
    query: Query;
    options?: TreeOptions;
    prev?: Tile;
};

function TreeElement(props: TreeProps) {
    // flux
    const qx = useQx();

    if (!qx)
        return (
            <FluxElement {...props}>
                <ChatElement />
            </FluxElement>
        );

    const branch = getTile(props);

    if (qx.flux.nodeIds.includes(branch.id)) return;
    else qx.setFlux("nodeIds", qx.flux.nodeIds.length, branch.id);

    onMount(() => {
        console.log("QxNodeElement Mount", branch.id);
    });

    const nextIds = createMemo(() => branch.links().map((link) => link.id));

    if (props.prev) {
        console.log("Flux setting prev nbr", branch.id);
        props.prev.setNbrs((prev) => [...prev, branch]);
    }

    /* 
    - handle unique hover with nested divs
    - tile detects if any nbr is hovered
    - if tile is hovered and no nbr is hovered, show qx
    */

    // const showQx: ShowQx = (_qxNode) =>
    //     _qxNode.hovered.get() &&
    //     _qxNode?.nbrs().every((nbr) => !nbr.hovered.get());

    const styles = (props.query?.modifier || backupModifier)(branch.id, "tile");

    const newQuery = {
        ...props.query,
        depth: props.query?.depth ? props.query.depth - 1 : undefined,
    };

    return (
        <div class="tree">
            <div
                class={styles.classes()}
                style={styles.style()}
                onmouseenter={() => branch.hovered.toggle(true)}
                onmouseleave={() => branch.hovered.toggle(false)}
            >
                <TileElement query={props.query} />
                <For each={nextIds()} fallback={null}>
                    {(id) => (
                        <TreeElement
                            query={{ ...props.query, nodeId: id }}
                            prev={props.prev}
                        />
                    )}
                </For>
            </div>
        </div>
    );
}

export default TreeElement;

export type { TreeProps };

/* comparison
- is 1 more efficient than 2?

# 1 

const node = createMemo(() => findNode(id));
const type = createMemo(() => node().type);

return (
    <div>{type()}</div>
)

# 2

const node = createMemo(() => findNode(id));

return (
    <div>{node().type}</div>
)
*/
