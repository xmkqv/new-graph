import { Accessor, createMemo, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { FRAME_DURATION } from "~/constants";
import { Control } from "~/flux/Control";
import { layout as LayoutType } from "~/server/client";
import { rndInt } from "~/utils/math";
import { prettyJsonTable } from "~/utils/prettyJson";
import { PartialExcept } from "~/utils/types";

/*
- need rect at top level
- top level needs a store
- should provide context that can be used by children

# pro panel
- rects: so can change rects relative to each other
- view: tiles need to be responsive to view

# pro tile
- tile creates a newTile signal
- adds to branch
- renders children
*/
// Node will be the data type,

// randEl 159
// between5and100 188002
// 1mil: 13.687ms

const USER_AUTHOR = "user";

type Default = { style?: JSX.CSSProperties; className?: string };

type NodeClassType =
    | "text-cell"
    | "heading"
    | "list-item"
    | "blockquote"
    | "code"
    | "bold"
    | "paragraph";

type TileType = "table" | "plot";

type DefaultNode = Default & {
    tileTypes?: TileType[];
    classes?: NodeClassType[];
    controls?: Control[];
};

const baseNode: DefaultNode = {
    style: {},
    classes: [],
    controls: [],
};

const defaultNode: Record<string, DefaultNode> = {
    sec: {
        style: { stroke: "rgb(0, 38, 255)" },
    },
    memo: { style: { stroke: "#f39c12" } },
    item: { style: { stroke: "#ff0000" } },
    user: { style: { stroke: "#02ff9e" } },
    csv: {
        style: { stroke: "#bf00ff" },
        tileTypes: ["table", "plot"],
    },
};

// add the base node to each node
Object.keys(defaultNode).forEach((key) => {
    defaultNode[key] = { ...baseNode, ...defaultNode[key] };
});

type NodeType = keyof typeof defaultNode;
const NODETYPES = Object.keys(defaultNode) as NodeType[];
const isNodeType = (type: any) => NODETYPES.includes(type);

type DefaultLink = Default & {};

const defaultTree: Record<string, DefaultLink> = {
    memos: { style: { stroke: "#50096f16" } },
    doc: { style: { stroke: "#50096fad" } },
    dir: { style: { stroke: "#50096fad" } },
};

type TreeType = keyof typeof defaultTree;
const TREETYPES = Object.keys(defaultTree) as TreeType[];
const isTreeType = (type: any) => TREETYPES.includes(type);

const defaultLink: Record<string, DefaultLink> = {
    ...defaultTree,
    any: { style: { stroke: "#50096fad" } },
    parent: { style: { stroke: "#50096fad" } },
    stem: { style: { stroke: "#50096fad" } },
};

type LinkType = keyof typeof defaultLink;
const LINKTYPES = Object.keys(defaultLink) as LinkType[];
const isLinkType = (type: any) => LINKTYPES.includes(type);

type Direction = "ad" | "ab";
const DIRECTIONS: Direction[] = ["ad", "ab"];

type Link<T extends LinkType> = {
    id: string;
    type: T;
    level?: number;
    direction: Direction;
};

/* views
- panel
    - squarified tiles
    - swap
- thread
    - vertically stacked tiles
    - swap
    - level
    - modifiers
- flow
    - freeform tiles
- graph
    - nodes + links
*/

type View = "thread" | "panel" | "flow" | "graph";
const VIEWS = ["thread", "panel", "flow", "graph"] as View[];

type Modifier = (
    nodeId: string,
    classes?: string,
    style?: JSX.CSSProperties
) => { classes: Accessor<string>; style: Accessor<JSX.CSSProperties> };

const backupModifier: Modifier = (nodeId, classes, style) => {
    return {
        classes: () => classes || "",
        style: () => style || {},
    };
};

export { backupModifier, type Modifier };

type Query = {
    nodeId: string;
    linkTypes?: LinkType[];
    nodeTypes?: NodeType[];
    direction?: Direction;
    view?: View;
    depth?: number;
    modifier?: Modifier;
};

/* views
- panel
    - squarified tiles
    - swap
- thread
    - vertically stacked tiles
    - swap
    - level
    - modifiers
- flow
    - freeform tiles
- graph
    - nodes + links
*/

interface Node<T extends NodeType> {
    id: string;
    type: T;
    data: string;
    name: string;
    author: string;

    x: number;
    y: number;

    // these must be referenced in the shared state, so that changes across the app are reflected
    selected: boolean;
    visible: boolean;

    embedding?: string;
    summary?: string;
    contentHash?: string;
    ephemeral?: boolean;

    links: Link<LinkType>[];
}

type Update = PartialExcept<Node<NodeType>, "id"> & {};

type Flow = {
    nodeIds: string[];
    // waves: Wave<NodeType>[];
    // links: Link[];
    layout: LayoutType;
    w: number;
    h: number;
    x: number;
    y: number;
};

/*
- parent creates a list of viable links
- parent creates a list of tiles corresponding to the links
- tiles are a signal {id, rect, setRect, minimized, branch}
- branch is a list of tile signals
- and so forth
- children add themselves to parent signal

use a portal to render the nodes
<Portal mount={document.getElementById("modal")}>
<div>My Content</div>
</Portal>
*/

const [nodes, setNodes] = createStore<Node<NodeType>[]>([]);

const nodeIds = createMemo(() => nodes.map((node) => node.id));
const nNode = createMemo(() => nodes.length);

const pickRndNodeIdx = () => Math.max(rndInt(0, nodes.length - 1), 0);

const pickRndNode = () => {
    if (nNode() === 0) console.log("pickRndNode", { nNode: nNode(), nodes });
    const idx = pickRndNodeIdx();
    const node = nodes[idx];
    if (node) return node;
    console.warn("pickRndNode", { idx, nNode: nNode(), nodes });
    throw new Error("node not found");
};

const addNode = (node: Node<NodeType>) =>
    setNodes((prev) => {
        if (prev.find((n) => n.id === node.id)) return prev;
        return [...prev, node];
    });

const matchLink = (linkA: Link<LinkType>, linkB: Link<LinkType>) =>
    linkA.id === linkB.id &&
    linkA.type === linkB.type &&
    linkA.direction === linkB.direction;

function _addLink(nodeId: string, link: Link<LinkType>) {
    setNodes(
        (n) => n.id === nodeId,
        "links",
        produce((links) => {
            if (links.some((existingLink) => matchLink(existingLink, link)))
                return links;
            links.push(link);
        })
    );
}

function addLink(nodeId: string, link: Link<LinkType>) {
    if (nodeId === link.id) throw new Error("node cannot link to itself");
    if (link.direction === "ad" && link.type === "memos") {
        const node = findNode(link.id);
        if (node.type !== "memo") {
            console.warn("must be memo", { nodeId, link, node });
            throw new Error("must be memo");
        }
    }
    _addLink(nodeId, link);
    const counterDirection = link.direction === "ad" ? "ab" : "ad";
    const counterLink: Link<LinkType> = {
        id: nodeId,
        type: link.type,
        direction: counterDirection,
    };
    _addLink(link.id, counterLink);
    console.log("addLink", { link, counterLink });
}

type CreateProps = {
    partialNode: PartialNode;
    partialLinks: Omit<Link<LinkType>, "id">[];
    options?: NewNodeOptions;
};

function createNode(nexusId: string, props: CreateProps) {
    const node = newNode(props.partialNode, props.options);
    const links = props.partialLinks.map((link) => ({ ...link, id: node.id }));
    links.forEach((link) => addLink(nexusId, link));
    return node;
}

const rndLinkType = () =>
    LINKTYPES[Math.floor(Math.random() * LINKTYPES.length)];

function rndLink(): Link<LinkType> {
    const id = nodeIds()[pickRndNodeIdx()];
    const type = rndLinkType();
    const direction = DIRECTIONS[Math.floor(Math.random() * 2)];
    return { id, type, direction };
}

function _newNodeDefaults() {
    const id = Math.random().toString(36).substring(7);

    const typeIdx = rndInt(0, NODETYPES.length - 1);
    const type = NODETYPES[typeIdx];

    const name = Math.random().toString(36).substring(7);
    const author = ["user", "assistant"][rndInt(0, 1)];
    const x = Math.floor(Math.random() * 1000);
    const y = Math.floor(Math.random() * 1000);
    const selected = false;
    const visible = false;

    return { id, type, name, author, x, y, selected, visible };
}

type NewNodeOptions = {
    nRndLink?: number;
};

type PartialNode = Partial<Node<NodeType>>;

function newNode(props: PartialNode, options?: NewNodeOptions): Node<NodeType> {
    const partialNode = {
        ..._newNodeDefaults(),
        ...props,
    };

    // links with filter

    let links: Link<LinkType>[] = [];
    const { nRndLink } = options || {};

    if (nRndLink) {
        links = partialNode.links || [];
        for (let i = 0; i < nRndLink; i++) {
            const link = rndLink();
            if (link.id === partialNode.id) continue;
            if (!link.id) continue;
            if (links.some((l) => matchLink(l, link))) continue;
            if (link.type === "memos") {
                if (link.direction === "ad") {
                    const target = nodes.find((n) => n.id === link.id);
                    if (target?.type !== "memo") continue;
                } else if (link.direction === "ab") {
                    if (partialNode.type !== "memo") continue;
                } else {
                    throw new Error("invalid direction");
                }
            }
            links.push(link);
        }
    }

    console.log("newLinks", links);
    const finalNode = {
        ...partialNode,
        links,
        data: prettyJsonTable({
            id: partialNode.id,
            type: partialNode.type,
            nLink: links.length,
            author: partialNode.author,
        }),
    };

    addNode(finalNode);
    console.log("newNode added", finalNode);
    return finalNode;
}

const addRndNodes = (n: number, options?: NewNodeOptions) =>
    Array.from({ length: n }, () => newNode({}, options));

const findNode = (id: string) => {
    const node = nodes.find((node) => node.id === id);
    if (node) return node;
    console.warn(id, nodeIds());
    throw new Error("node not found");
};

/*
    Tile
*/

type Edge = {
    ad: string;
    ab: string;
    type: LinkType;
    level: number;
};

const linksToEdges = ({ id, links }: Pick<Node<NodeType>, "id" | "links">) => {
    const ad = links.filter((link) => link.direction === "ad");
    const ab = links.filter((link) => link.direction === "ab");

    const adEdges = ad.map((link) => ({
        ad: id,
        ab: link.id,
        type: link.type,
        level: link.level || 0,
    }));
    const abEdges = ab.map((link) => ({
        ad: link.id,
        ab: id,
        type: link.type,
        level: -(link.level || 0),
    }));
    if (ad.length !== adEdges.length || ab.length !== abEdges.length) {
        console.log("linksToEdges", { ad, ab, adEdges, abEdges });
        throw new Error("linksToEdges failed");
    }
    return adEdges.concat(abEdges);
};

const setBatchBuffer = new Map<string, Update[]>();

let intervalId: NodeJS.Timeout | null = null;

function startBatching() {
    if (intervalId !== null) throw new Error("already batching");
    intervalId = setInterval(
        () => requestAnimationFrame(setBatchFrame),
        FRAME_DURATION
    );
}

function stopBatching() {
    if (intervalId === null) throw new Error("not batching");
    clearInterval(intervalId);
    intervalId = null;
}

function setNodesBatched(updates: Update[]) {
    /*
    add updates to the buffer
    if the buffer is empty, start batching
  */
    // log("setNodesBatched", updates);
    updates.forEach((node) => {
        const nodeBuffer = setBatchBuffer.get(node.id);
        if (nodeBuffer === undefined) {
            setBatchBuffer.set(node.id, [node]);
        } else {
            nodeBuffer.push(node);
        }
    });

    if (intervalId === null) startBatching();
}

function setBatchFrame() {
    /*
    take 1 update per node, apply it
    if there are no more updates for a node, remove it from the buffer
    if there are no more nodes in the buffer, stop batching
  */
    setBatchBuffer.forEach((nodeBuffer, nodeId) => {
        const update = nodeBuffer.shift();
        if (update) {
            setNodes(
                (n) => n.id === nodeId,
                produce((n) => {
                    Object.entries(update).forEach(([key, value]) => {
                        if (value !== undefined) {
                            // @ts-ignore
                            n[key] = value;
                        }
                    });
                })
            );
        } else {
            setBatchBuffer.delete(nodeId);
        }
    });

    if (setBatchBuffer.size === 0) stopBatching();
}

export {
    addLink,
    addNode,
    addRndNodes,
    createNode,
    defaultLink,
    defaultNode,
    findNode,
    linksToEdges,
    newNode,
    nodes,
    pickRndNode,
    prettyJsonTable,
    setNodes,
    setNodesBatched,
    USER_AUTHOR,
};

export type {
    CreateProps,
    Direction,
    Edge,
    Flow,
    LayoutType,
    Link,
    LinkType,
    Node,
    NodeType,
    Query,
    Update,
};
