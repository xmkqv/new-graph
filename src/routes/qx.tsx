import { createSignal, onMount, Show } from "solid-js";

import TreeElement from "~/flux/Flux";
import { getNbr } from "~/flux/tree/tile/nbr";
import { addRndNodes, newNode, pickRndNode } from "~/store";
import { getCenterRect } from "~/utils/rect";

/*
- [ ] https://yuku.takahashi.coffee/textcomplete/

# autosizing

- autosize(document.querySelectorAll("text-cell"));
*/

function App() {
    const [nodeId, setNodeId] = createSignal<string | undefined>(undefined);

    onMount(() => {
        console.log("app mounted");

        addRndNodes(20, { nRndLink: 3 });

        const node = pickRndNode();
        const qxNode = getNbr({
            query: { nodeId: node.id },
        });
        if (!qxNode) throw new Error("no qxNode");

        const memos = Array.from({ length: 10 }, (_, i) =>
            newNode({ type: "memo" })
        );
        memos.forEach((memo) => {
            qxNode.link({ id: memo.id, type: "memos", direction: "ad" });
        });

        const INIT_FLUX_H = 700;
        const INIT_FLUX_W = 500;
        const INIT_FLUX_RECT = getCenterRect({
            width: INIT_FLUX_W,
            height: INIT_FLUX_H,
        });

        const initNode = {
            id: qxNode.id,
            rect: INIT_FLUX_RECT,
        };

        initNode.rect["left"] += 300;

        setNodeId(qxNode.id);
    });
    return (
        <Show when={nodeId()}>
            {(_nodeId) => (
                <TreeElement
                    query={{
                        nodeId: _nodeId(),
                        view: "thread",
                        direction: "ad",
                    }}
                />
            )}
        </Show>
    );
}

export default App;
