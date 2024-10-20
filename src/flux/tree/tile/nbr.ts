import { createMemo, createSignal } from "solid-js";

import type { CreateProps, Link, LinkType } from "~/store";
import { addLink, createNode, defaultNode, findNode } from "~/store";
import { Rect } from "~/utils/rect";
import { createToggle } from "~/utils/toggle";

import { TreeProps } from "../Tree";

const getNbr = (props: TreeProps | string) => {
    if (typeof props === "string") {
        const nodeId = props;
        return getNbr({ query: { nodeId, depth: 0 } });
    }

    const query = props.query || {};

    // const qx = useQx();
    // const accessibleNodeIds = createMemo(() =>
    //     qx ? qx.flux.nodeIds : nodeIds()
    // );

    // node
    const nodeId = query.nodeId;
    const node = createMemo(() => findNode(nodeId));
    const type = createMemo(() => node().type);
    const data = createMemo(() => node().data);

    const links = createMemo(() => {
        const { linkTypes, nodeTypes, direction, depth } = query || {};
        if (depth === 0) return [];

        let links = node().links;
        if (direction) {
            links = links.filter((link) => link.direction === direction);
        }
        if (linkTypes) {
            links = links.filter((link) => linkTypes.includes(link.type));
        }
        if (nodeTypes) {
            links = links.filter((link) => {
                const targetType = findNode(link.id).type;
                if (nodeTypes.includes(targetType)) return true;
            });
        }
        return links;
    });

    const defaults = createMemo(() => defaultNode[type()]);
    const controls = createMemo(() => defaults().controls || []);

    // node properties
    const hovered = createToggle(false);
    const minimized = createToggle(false);
    const [ref, setRef] = createSignal<HTMLElement | undefined>(undefined);
    const [rect, setRect] = createSignal<Rect | undefined>(props.options?.rect);
    const [nbrs, setNbrs] = createSignal<Nbr[]>([]);

    const link = (newLink: Link<LinkType>) => addLink(nodeId, newLink);

    const create = (props: CreateProps) => createNode(nodeId, props);

    return {
        id: nodeId,
        node,
        type,
        data,
        links,
        controls,
        // properties
        ref,
        setRef,
        minimized,
        hovered,
        rect,
        setRect,
        // branch
        nbrs,
        setNbrs,
        // methods
        link,
        create,
    };
};

interface Nbr extends ReturnType<typeof getNbr> {}

export type { Nbr };

export { getNbr };
