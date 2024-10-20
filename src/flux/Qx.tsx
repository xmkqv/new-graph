import {
    Accessor,
    createEffect,
    createSignal,
    Match,
    Setter,
    Show,
    Switch,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { Motion, Presence } from "solid-motionone";

import viewbox from "../graph/Viewbox";
import { addLink, newNode } from "../store";
import { useHold } from "../utils/hold";
import { Rect } from "../utils/rect";
import { createToggle, Toggle } from "../utils/toggle";
import { Control } from "./Control";
import Menu, { newMenu } from "./Menu";

type QxProps = {
    id: Accessor<string>;
    controls?: Accessor<Control[]>;
    rect?: Accessor<Rect> | Accessor<Rect | undefined>;
    setRect?: Setter<Rect | undefined>;
    minimized: Toggle;
    showQx?: Accessor<boolean>;
};

function Qx(props: QxProps) {
    const showBar = createToggle(false);
    const showQx = props.showQx || (() => true);

    const menu = newMenu([props.controls?.() || []]);

    const [moved, setMoved] = createSignal(false);

    const hold = useHold(() => props.minimized.get(), moved);

    const handleMouseDown = (e: MouseEvent) => {
        // console.log("mousedown node", e);
        e.preventDefault();
        e.stopPropagation();

        setMoved(false);
        // hold.start(e);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        // console.log("mousemove node", e);
        e.preventDefault();
        e.stopPropagation();

        const zoom = unwrap(viewbox)().zoom;
        const dx = Math.round(e.movementX / zoom);
        const dy = Math.round(e.movementY / zoom);

        if (dx == 0 && dy == 0) return;

        setMoved(true);
        // hold.end();

        if (!props.setRect) return;

        props.setRect((r) => {
            if (!r) return r;
            return {
                ...r,
                left: Math.round(r.left + dx),
                top: Math.round(r.top + dy),
            };
        });

        // resize
        //     setRect((r) => ({
        //         ...r,
        //         width: Math.max(200, r.width + dx),
        //         height: Math.max(200, r.height + dy),
        //     }));
    };

    const handleMouseUp = (e: MouseEvent) => {
        // console.log("mouseup", e);
        e.preventDefault();
        e.stopPropagation();

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (moved()) return;

        showBar.toggle();

        const wasHeld = hold.end();
        if (wasHeld) return;
    };

    function handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();
        if (e.metaKey || e.ctrlKey) {
            console.log("meta qx key", key, menu.state());
            e.preventDefault();
            e.stopPropagation();

            if (key === "/") {
                console.log("ctrl key", key);
                menu.next();
            } else if (key === "enter") {
                //@ts-ignore
                const text = e.target?.innerText;
                if (!text) throw new Error("no text");
                const memo = newNode({
                    type: "memo",
                    data: text,
                });
                addLink(props.id(), {
                    type: "memos",
                    direction: "ad",
                    id: memo.id,
                });
                // set the text to empty
                //@ts-ignore
                e.target.innerText = "";
            }
        }
    }

    const [ref, setRef] = createSignal<HTMLElement | null>(null);

    createEffect(() => {
        const r = ref();
        if (!r) return;
        if (showBar.get()) {
            r.focus();
        }
    });

    return (
        <Presence exitBeforeEnter>
            <Motion
                class="qx"
                // @ts-ignore
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{
                    duration: 0.4,
                    easing: "ease-in-out",
                }}
            >
                <Show when={showQx()}>
                    <QxDot hold={hold} handleMouseDown={handleMouseDown} />

                    <Show when={showBar.get()}>
                        <div class="qx-bar" onKeyDown={handleKeyDown}>
                            <Switch>
                                <Match when={menu.state() === "off"}>
                                    <div
                                        ref={setRef}
                                        class="contenteditable"
                                        contenteditable
                                    />
                                </Match>
                                <Match when={menu.state() === "on"}>
                                    <Menu {...menu} />
                                </Match>
                            </Switch>
                        </div>
                    </Show>
                </Show>
            </Motion>
        </Presence>
    );
}

type QxDotProps = {
    hold?: ReturnType<typeof useHold>;
    handleMouseDown?: (e: MouseEvent) => void;
};

function QxDot(props: QxDotProps) {
    return (
        <div
            class="qx-dot iridescent"
            onMouseDown={props.handleMouseDown}
            style={{
                "--holding": props.hold?.holding() || 0,
            }}
        />
    );
}

export default Qx;
