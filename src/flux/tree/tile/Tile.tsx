import { debounce } from "@solid-primitives/scheduled";
import { Accessor, createEffect, createMemo, Match, Switch } from "solid-js";
import { createSignal } from "solid-js";

import type { CreateProps, Link, LinkType } from "~/store";
import { Query } from "~/store";
import { addLink, createNode, defaultNode, findNode } from "~/store";
import { Rect } from "~/utils/rect";
import { createToggle } from "~/utils/toggle";

import { TreeProps } from "../Tree";
import Sec from "./Sec";

type ShowQx = () => boolean;

type TileProps = {
    children?: any;
    query: Query;
};

function trackComponentRect(ref: Accessor<HTMLElement | undefined>) {
    const [rect, setRect] = createSignal<Rect | undefined>(undefined);

    const debouncedUpdateRect = debounce((e) => {
        const element = ref();
        if (!element) return;
        // console.log("debouncedUpdateRect", element);
        const rect = element.getBoundingClientRect();
        setRect(rect);
    }, 100);

    createEffect(() => {
        const element = ref();
        if (!element) return;
        // console.log("trackComponentRect", element);
        // element.addEventListener("resize", (e) => debouncedUpdateRect(e));
        // element.addEventListener("scroll", (e) => debouncedUpdateRect(e));
        // element.addEventListener("mousemove", (e) => debouncedUpdateRect(e));
        // element.addEventListener("", (e) => debouncedUpdateRect(e));
    });

    return rect;
}

function TileElement(props: TileProps) {
    const [ref, setRef] = createSignal<HTMLElement | undefined>(undefined);
    const rect = trackComponentRect(ref);

    const tile = getTile({ query: props.query });

    const showQx: ShowQx = createMemo(() => {
        return (
            tile.hovered.get() && tile.nbrs().every((nbr) => !nbr.hovered.get())
        );
    });

    return (
        <div ref={setRef} class="tile">
            <div
                onmouseenter={() => tile.hovered.toggle(true)}
                onmouseleave={() => tile.hovered.toggle(false)}
            >
                <Switch fallback={<Sec {...tile} />}>
                    <Match when={tile.type() === "sec"}>
                        <Sec {...tile} />
                    </Match>
                </Switch>
            </div>
        </div>
    );
}

const getTile = (props: TreeProps | string) => {
    if (typeof props === "string") {
        const nodeId = props;
        return getTile({ query: { nodeId, depth: 0 } });
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

    const defaultRadius = 100;
    const defaultRect = {
        left: Math.round(node().x - defaultRadius),
        top: Math.round(node().y - defaultRadius),
        width: defaultRadius * 2,
        height: defaultRadius * 2,
    };
    const _rect = props.options?.rect ? props.options.rect : defaultRect;
    const [rect, setRect] = createSignal<Rect>(_rect);

    const size = createMemo(() => rect().width * rect().height);

    const [nbrs, setNbrs] = createSignal<Tile[]>([]);

    const link = (newLink: Link<LinkType>) => addLink(nodeId, newLink);

    const create = (props: CreateProps) => createNode(nodeId, props);

    return {
        id: nodeId,
        node,
        type,
        data,
        links,
        controls,
        // calculated properties
        size,
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

interface Tile extends ReturnType<typeof getTile> {}

export { getTile };

export default TileElement;

export type { ShowQx, Tile };
