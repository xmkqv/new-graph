import { createMemo } from "solid-js";
import { produce, unwrap } from "solid-js/store";

import { nodes, setNodes } from "../store";
import { type Node, type NodeType, USER_AUTHOR } from "../store";
import viewbox from "./Viewbox";

type NodeElementProps = {
    id: string;
};

function qxNode(props: NodeElementProps) {
    const node = nodes.find((n) => n.id === props.id);

    function onMouseDown(e: MouseEvent) {
        e.preventDefault();
        let itMoved = false;
        const { zoom } = unwrap(viewbox)();

        function onMouseMove(e: MouseEvent) {
            itMoved = true;
            setNodes(
                (n) => n.id === props.id,
                produce((n) => {
                    n.x += Math.round(e.movementX / zoom);
                    n.y += Math.round(e.movementY / zoom);
                })
            );
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            if (!itMoved) {
                console.log("qxNode toggle selected", props.id);
                setNodes(
                    (n) => n.id === props.id,
                    "selected",
                    (selected) => (selected ? false : true)
                );
            }
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    const classes = createMemo(
        () => "node" + (node?.selected ? " selected" : "")
    );
    console.log("Node render", props);
    return (
        <circle
            id={props.id}
            class={classes()}
            cx={node?.x}
            cy={node?.y}
            r="10"
            onMouseDown={onMouseDown}
        />
    );
}

// async function getNodes(ids: string[]) {
//     // getNode only allows one id, getNodes (O(n2) -> O(n))
//     const founds = [];
//     for (const id of ids) {
//         let found = store.getNode(id);
//         if (!found) {
//             // const matches = await db.getNodes({ id });
//             // found = matches[0];
//             if (!found) {
//                 throw new Error("Node not found");
//             }
//             store.addNode(found);
//         }
//         founds.push(found);
//     }
//     return founds;
// }

// function updateNodes(
//     updates: any[]
//     // debounceStore: boolean = false,
//     // debounceDb: boolean = false
// ) {
//     store.setNodes(updates);
//     updates.forEach((update) => {
//         if (update.skipDb) return;
//         // db.setNode(update);
//     });
// }

// const setDebounced = debounce((updates: any[]) => {
//     setNodes(updates);
// }, 500);

// function addNode(node: Node, fluxId?: string): Node {
//     console.log("addNode", node, fluxId);
//     const newNode = store.addNode(node);
//     // db.addNode(node);
//     // selectedFluxId defaults to user flux
//     const flux = useFlux(fluxId || selectedFluxId());
//     if (!flux) {
//         console.warn("no flux", { fluxId, selectedFluxId: selectedFluxId() });
//         throw new Error("no flux");
//     }
//     flux.add(node.id, 0);
//     return newNode;
// }

// function delNode(...ids: string[]) {
//     console.log("del", ids);
//     ids.forEach((id) => {
//         store.delNodes(id);
//         // db.delNodes(id);
//         const delTheseLinks = links.filter(
//             (link) => link.source === id || link.target === id
//         );
//         delLinks(...delTheseLinks.map((link) => link.id));
//     });
// }

// type CreateNodeOptions = {
//     fakeData?: boolean;
//     url?: string;
//     fluxId?: string;
// };

// function newNode(
//     partialNode: Partial<Node>,
//     options?: CreateNodeOptions
// ): Node {
//     // remove all undefined values
//     // the problem was partial inputs that were undefined, eg editor creating a node with an undefined name
//     // - [ ] add name to node pattern
//     Object.keys(partialNode).forEach((key) => {
//         if (partialNode[key] === undefined) {
//             delete partialNode[key];
//         }
//     });

//     let id = generateUniqueId();
//     const { fakeData, url, fluxId } = options || {};
//     const { x: vpx, y: vpy, w, h } = unwrap(viewbox)();
//     invariant(
//         !Number.isNaN(vpx) &&
//             !Number.isNaN(vpy) &&
//             !Number.isNaN(w) &&
//             !Number.isNaN(h),
//         "viewbox is nan"
//     );

//     const randX = randInt(-w / 2, w / 2) + vpx;
//     const randY = randInt(-h / 2, h / 2) + vpy;
//     const xy = {
//         x: Math.round(partialNode.x || randX),
//         y: Math.round(partialNode.y || randY),
//     };
//     // invariant(!Number.isNaN(x) && !Number.isNaN(y));

//     let data = "";
//     let name = "";
//     if (fakeData) {
//         data = "data for " + id + " type " + partialNode.type;
//         name = "name " + id + partialNode.type;
//     }

//     const defaultNode = {
//         id,
//         // height and width can likely be ANNIHILATED lol
//         h: 100,
//         w: 200,
//         data,
//         name,
//         author: USER_AUTHOR,
//         visible: true,
//         selected: false,
//         embedding: undefined,
//         summary: undefined,
//         ephemeral: undefined,
//         threads: [],
//     };

//     // to text = pattern + name + '\n' + data

//     let node = {
//         type: "sec" as NodeType,
//         ...defaultNode,
//         // id should override the default id, why does it not?
//         ...partialNode,
//         // ! must be a spread operator to overwrite the other spreads
//         ...xy,
//     };

//     invariant(!Number.isNaN(node.x) && !Number.isNaN(node.y), "xy are nan");

//     const newNode = addNode(node, fluxId);

//     if (url) {
//         // - [ ] web url
//         loadFile(url).then((file) => {
//             console.log("loaded file", file, node, id);
//             setNodes(
//                 (o) => o.id === id,
//                 produce((n) => {
//                     n.type = file.type;
//                     n.data = file.data;
//                     n.name = file.name;
//                 })
//             );
//         });
//     }

//     console.log("newNode", newNode);
//     return newNode;
// }

export default qxNode;

export {
    // addNode,
    // delNode,
    // getNodes,
    // newNode,
    // nodes,
    // setDebounced,
    // setNodes,
    // store,
    // updateNodes,
    USER_AUTHOR,
};

export type { Node, NodeElementProps, NodeType };
