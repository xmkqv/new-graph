import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import ControlElement, { Control } from "./Control";

interface Menu {
    state: () => "on" | "off";
    add: (controls: Control[]) => void;
    del: (index: number) => void;
    next: () => void;
    prev: () => void;
    curr: () => Control[];
    nActiveControl: () => number;
}

function newMenu(controls: Control[][]): Menu {
    const [menus, setMenus] = createSignal(controls);
    const [index, setIndex] = createSignal(0);
    const curr = createMemo(() => menus()[index()]);
    const nActiveControl = createMemo(() => curr().length);

    const next = () => {
        console.log("next", menus().length, index());
        setIndex((prev) => {
            const newIndex = Math.min(menus().length - 1, prev + 1);
            setState("on");
            return newIndex;
        });
    };
    const prev = () => {
        console.log("prev", menus(), index(), curr(), state());
        setIndex((prev) => {
            if (prev === 0) setState("off");
            return Math.max(0, prev - 1);
        });
    };
    const add = (controls: Control[]) => {
        console.log("add", controls);
        setMenus((prev) => [...prev, controls]);
    };

    const del = (index: number) => {
        if (index === -1) return setMenus((prev) => prev.slice(0, -1));
        setMenus((prev) => prev.filter((_, i) => i !== index));
    };

    const [state, setState] = createSignal<"on" | "off">("off");

    onMount(() => {
        console.log("Menu Init", menus(), index(), curr(), state());
    });

    return {
        state,
        add,
        del,
        next,
        prev,
        curr,
        nActiveControl,
    };
}

function Menu(props: Menu) {
    return (
        <div class="flex flex-col">
            <Show when={props.nActiveControl() !== 0}>
                <div class={"menu-grid"}>
                    <For each={props.curr()}>
                        {(c) =>
                            ControlElement({
                                ...c,
                                menu: props,
                            })
                        }
                    </For>
                </div>
            </Show>
            <div
                class="back-button"
                style={{
                    width: props.nActiveControl() === 0 ? "100%" : "auto",
                }}
                onclick={() => props.prev()}
            >
                <span class="back-arrow">&#x276E;</span>
            </div>
        </div>
    );
}

export default Menu;

export { newMenu };

export type { Menu };
