import { Show } from "solid-js";
import { createSignal, onMount } from "solid-js";

import Bead from "~/components/Bead";
import Mouse from "~/components/Mouse";
import FluxElement from "~/flux/Flux";
import { getTile } from "~/flux/tree/tile/Tile";
import { addRndNodes, newNode, pickRndNode } from "~/store";
import { getCenterRect, Rect } from "~/utils/rect";

/*
- [ ] https://yuku.takahashi.coffee/textcomplete/

# autosizing

- autosize(document.querySelectorAll("text-cell"));
*/

function App() {
    const [nodeId, setNodeId] = createSignal<string | undefined>(undefined);
    const [rect, setRect] = createSignal<Rect | undefined>(undefined);

    onMount(() => {
        console.log("app mounted");

        addRndNodes(20, { nRndLink: 3 });

        const node = pickRndNode();
        const tile = getTile({
            query: { nodeId: node.id },
        });
        if (!tile) throw new Error("no qxNode");

        const memos = Array.from({ length: 10 }, (_, i) =>
            newNode({ type: "memo" })
        );
        memos.forEach((memo) => {
            tile.link({ id: memo.id, type: "memos", direction: "ad" });
        });

        const INIT_FLUX_RECT = getCenterRect({
            width: 500,
            height: 700,
        });

        setRect(INIT_FLUX_RECT);
        setNodeId(tile.id);
    });

    return (
        <div>
            <Show when={nodeId()}>
                {(_nodeId) => (
                    <FluxElement
                        query={{
                            nodeId: _nodeId(),
                            view: "thread",
                            direction: "ad",
                        }}
                        options={{
                            rect: rect(),
                        }}
                    />
                )}
            </Show>
            <Mouse />
            <Bead />
        </div>
    );
}

export default App;
