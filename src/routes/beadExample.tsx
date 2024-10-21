import {
    createEffect,
    createMemo,
    createSelector,
    createSignal,
    For,
    JSX,
    onCleanup,
    onMount,
    Show,
} from "solid-js";

import { getTile } from "~/flux/tree/tile/Tile";
import { addRndNodes, nodes } from "~/store";
import { rectToStyle } from "~/utils/rect";

const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
const [closestNodeId, setClosestNodeId] = createSignal();

// Set the distance at which you want to trigger hover
const proximityThreshold = 200;

const App = () => {
    // Handle mouse move globally
    const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    createEffect(() => {
        // ensure that the closest node is updated
        const xy = mousePos();
        const closeNodes = nodes.filter(
            (node) =>
                Math.hypot(node.x - xy.x, node.y - xy.y) < proximityThreshold
        );

        let minDistance = Infinity;
        let closestNode = undefined;
        for (const node of closeNodes) {
            const distance = Math.hypot(node.x - xy.x, node.y - xy.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        }

        setClosestNodeId(closestNode?.id);
    });

    const selectClosest = createSelector(() => closestNodeId());

    onMount(() => {
        addRndNodes(4, { nRndLink: 3 });

        window.addEventListener("mousemove", handleMouseMove);
        onCleanup(() => {
            window.removeEventListener("mousemove", handleMouseMove);
        });
    });

    return (
        <div>
            <For each={nodes}>
                {(node) => (
                    <NodeComponent
                        id={node.id}
                        isClosest={selectClosest(node.id)}
                    />
                )}
            </For>
        </div>
    );
};

interface NodeComponentProps {
    id: string;
    isClosest: boolean;
}

// const element = document.getElementById("myElement");
// const closest = element.closest(".container");
// irst, you need to get the current cursor position

// document.onmousemove = e => {
//     cursorX = e.clientX;
//     cursorY = e.clientY;
// };
// cursorX and cursorY are global variables already declared in your program

// Now you need to get the nearest element to those coordinates

// document.elementFromPoint(cursorX, cursorY)

const NodeComponent = (props: NodeComponentProps) => {
    const [ref, setRef] = createSignal<HTMLElement | undefined>(undefined);
    const tile = getTile({ query: { nodeId: props.id } });

    const styles = createMemo(
        (): JSX.CSSProperties => ({
            position: "fixed",
            "border-radius": "50%",
            background: props.isClosest ? "lightblue" : "grey", // Change background when hovered
            ...rectToStyle(tile.rect()),
        })
    );

    // Compute the closest point on the bounding box's edge
    const edgePoint = createMemo(() => {
        const rect = tile.rect();
        const mouse = mousePos();

        const right = rect.left + rect.width;
        const bottom = rect.top + rect.height;
        // Calculate the center of the node
        const nodeCenter = {
            x: (rect.left + right) / 2,
            y: (rect.top + bottom) / 2,
        };

        // Vector from center of node to mouse position
        const dx = mouse.x - nodeCenter.x;
        const dy = mouse.y - nodeCenter.y;

        // Determine scaling factor to project the mouse position onto the edge
        const scaleX = rect.width / 2 / Math.abs(dx);
        const scaleY = rect.height / 2 / Math.abs(dy);

        // Use the smaller scale to ensure the point lies on the edge
        const scale = Math.min(scaleX, scaleY);

        return {
            x: nodeCenter.x + dx * scale,
            y: nodeCenter.y + dy * scale,
        };
    });

    return (
        <div ref={setRef} style={styles()} class="bead-node">
            {/* Content of the node */}

            <Show when={props.isClosest}>
                <div
                    style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        "border-radius": "50%",
                        background: "red",
                        transition:
                            "transform 0.2s linear, opacity 0.2s linear",
                        transform: `translate(${
                            edgePoint().x - tile.rect().left
                        }px, ${edgePoint().y - tile.rect().top}px)`,
                        opacity: props.isClosest ? 1 : 0,
                    }}
                />
            </Show>
        </div>
    );
};

export default App;
