import { createEffect, createMemo, createSignal } from "solid-js";

import { defaultLink, Edge, nodes } from "../store";
import { getPathD } from "../utils/path";

const LINK_CLASS = "link";

function qxLink(props: Edge) {
    const [d, setD] = createSignal("");

    const sXy = createMemo(() => {
        const n = nodes.find((n) => n.id === props.ad);
        if (!n) return { x: 0, y: 0, z: 0 };
        return { x: n.x, y: n.y };
    });

    const tXy = createMemo(() => {
        const n = nodes.find((n) => n.id === props.ab);
        if (!n) return { x: 0, y: 0, z: 0 };
        return { x: n.x, y: n.y };
    });

    createEffect(() => {
        const { x: sX, y: sY } = sXy();
        const { x: tX, y: tY } = tXy();
        const d = getPathD(sX, sY, tX, tY);
        setD(d);
    });

    const style = createMemo(() => defaultLink[props.type].style);

    console.log("Render Link", props);
    return <path class={LINK_CLASS} style={style()} d={d()} />;
}

export default qxLink;

export { LINK_CLASS };
