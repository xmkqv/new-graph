import {
    Accessor,
    createContext,
    createEffect,
    createSignal,
    JSX,
    onMount,
    useContext,
} from "solid-js";
import { createMemo } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

import type { Modifier } from "~/store";
import { nodes } from "~/store";
import { rectToStyle } from "~/utils/rect";

import { getTile, type Tile } from "./tree/tile/Tile";
import TreeElement, { TreeProps } from "./tree/Tree";

type Directive<T> = (el: HTMLElement, accessor: Accessor<T>) => void;

type FluxProps = TreeProps & {
    children?: JSX.Element;
    [key: `use:${string}`]: Directive<any> | undefined;
};

interface Flux {
    nexusId: string;
    nodeIds: string[];
    selectedIds: string[];
    selectedId: string;
    nNode: number;
}

function FluxElement(props: FluxProps) {
    // nexus
    const { nodeId } = props.query;

    const [flux, setFlux] = createStore<Flux>({
        nexusId: nodeId,
        nodeIds: [],
        selectedIds: [],
        selectedId: nodeId,
        nNode: 0,
    });

    createEffect(() =>
        setFlux("selectedId", flux.selectedIds[0] || flux.nexusId)
    );

    const node = getTile(props);

    const [ref, setRef] = createSignal<HTMLElement | undefined>(undefined);

    createEffect(() => {
        const nNode = flux.nodeIds.length;
        console.log("Flux Effect, nNode", nNode, flux.nodeIds[nNode - 1]);
        setFlux("nNode", nNode);

        // scroll to bottom on new message
        // timeout added to allow for initial render
        if (nNode > 0)
            setTimeout(() => {
                if (ref) {
                    ref()?.scrollTo({
                        top: ref()?.scrollHeight,
                        behavior: "smooth",
                    });
                }
            }, 100);
    });

    const style = createMemo(() => rectToStyle(node.rect()));

    console.log("Flux Render");
    return (
        <QxContext.Provider value={{ flux, setFlux, node }}>
            <div class="flux-container" style={style()}>
                <div ref={setRef} class="flux">
                    <TreeElement {...props} />
                </div>
                {props.children}
            </div>
        </QxContext.Provider>
    );
}

const chatModifier: Modifier = (nodeId, classes, style) => {
    /* top-left | top-right | bottom-right | bottom-left */

    const author = nodes.find((node) => node.id === nodeId)?.author;
    const isUser = author === "user";

    classes = classes || "";
    style = style || {};

    const _classes = createMemo(() => {
        return classes + " " + (isUser ? "ml-8 shadow-lg" : "mr-8 shadow-lg");
    });

    const _style = createMemo(() => {
        return {
            ...style,
            "border-radius": isUser ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0",
            border: isUser ? "0.5px solid #29dd00" : "0.5px solid #0044ff",
        };
    });

    return { classes: _classes, style: _style };
};

type ChatProps = {
    ctxIds?: Accessor<string[]>;
};

function ChatElement(props: ChatProps) {
    const qx = useQx();
    if (!qx) return;

    const INIT_CHAT_W = 400;
    const INIT_FLUX_H = 700;
    const INIT_CHAT_H = INIT_FLUX_H;

    const height = qx.node.rect()?.height || INIT_CHAT_W;

    function SubChat() {
        const qx = useQx();
        if (!qx) return;

        onMount(() => {
            console.log("SubChat", qx.flux.nodeIds.length);
        });

        return <></>;
    }

    return (
        <FluxElement
            query={{
                nodeId: qx.flux.nexusId,
                depth: 1,
                modifier: chatModifier,
                linkTypes: ["memos"],
                nodeTypes: ["memo"],
                direction: "ad",
            }}
            options={{
                rect: {
                    left: -INIT_CHAT_W,
                    top: 0,
                    width: INIT_CHAT_W,
                    height,
                },
            }}
        >
            <SubChat />
        </FluxElement>
    );
}

type QxContext = {
    flux: Flux;
    setFlux: SetStoreFunction<Flux>;
    node: Tile;
    sendMemo?: (element: HTMLElement, memo: any) => void;
};

const QxContext = createContext<QxContext>();

const useQx = () => useContext(QxContext);

export type { Flux };

export { type QxContext, useQx };

export default FluxElement;

export { ChatElement };
