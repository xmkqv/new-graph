import { createSignal } from "solid-js";

import { setNodes } from "~/store";

import { Tile } from "./Tile";

function Sec(props: Tile) {
    // https://yuku.takahashi.coffee/textcomplete/
    const [content, setContent] = createSignal(props.data() || "");
    const placeholder = "A new idea...";

    function handleChange(e: InputEvent) {
        const target = e.target as HTMLElement;
        const value = target.textContent || "";
        if (value === null) {
            console.warn("value is null", {
                e,
                id: props.id,
                data: props.data(),
            });
            throw new Error("value is null");
        }
        setContent(value);
        setNodes((n) => n.id === props.id, "data", value);
    }

    function handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();
        if (e.metaKey || e.ctrlKey) {
            if (key === "enter") {
                e.preventDefault();
                e.stopPropagation();
                // get the caret, split the text, leave the first part, create a new node with the second part

                const text = content();
                // get the caret position

                props.create({
                    partialNode: {
                        type: "sec",
                        data: text,
                    },
                    partialLinks: [
                        {
                            type: "parent",
                            direction: "ab",
                        },
                    ],
                });
            }
        }
    }

    return (
        <div
            data-nodeId={props.id}
            class="contenteditable"
            contenteditable
            onInput={handleChange}
            textContent={content() || placeholder}
            classList={{ "has-placeholder": content() === "" }}
            onFocus={(e) => {
                if (content() === "") {
                    (e.target as HTMLElement).textContent = "";
                }
            }}
            onBlur={(e) => {
                if (content() === "") {
                    (e.target as HTMLElement).textContent = placeholder;
                }
            }}
        />
    );
}

export default Sec;
