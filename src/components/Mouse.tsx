import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

import "./mouse.css";

const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });

function Mouse() {
    const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    onMount(() => {
        window.addEventListener("mousemove", handleMouseMove);
        onCleanup(() => {
            window.removeEventListener("mousemove", handleMouseMove);
        });
    });

    const pos = createMemo(() => {
        const x = Math.round(mousePos().x);
        const y = Math.round(mousePos().y);
        return {
            left: `${x}px`,
            top: `${y}px`,
        };
    });

    const transformPos = createMemo(() => {
        const x = Math.round(mousePos().x);
        const y = Math.round(mousePos().y);
        return {
            transform: `translate(${x}px, ${y}px)`,
        };
    });

    return (
        // <div
        //     style={{
        //         position: "absolute",
        //         width: "100px",
        //         height: "100px",
        //         transform: "translate(-50%)",
        //         border: "1px solid red",
        //         ...pos(),
        //     }}
        // >
        {
            /* <div class="mouse" style={pos()} />
            <div class="mouse bg-blue" style={transformPos()} /> */
        }
        // </div>
    );
}

export default Mouse;

export { mousePos };
