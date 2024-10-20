import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";

import invariant from "tiny-invariant";

interface Viewbox {
    x: number;
    y: number;
    z: number;
    w: number;
    h: number;
    zoom: number;
}

const w = Math.round(window.innerWidth);
const h = Math.round(window.innerHeight);
invariant(w && h, `viewport invalid window ${w} ${h}`);

const [_viewbox, setViewbox] = createSignal<Viewbox>({
    x: 0,
    y: 0,
    z: 0,
    w: w,
    h: h,
    zoom: 1,
});

const viewbox = () => {
    const { x, y, w, h, z, zoom } = _viewbox();
    return {
        x: Math.round(x),
        y: Math.round(y),
        z: Math.round(z),
        w: Math.round(w),
        h: Math.round(h),
        zoom,
    };
};

const viewboxStyle = () => {
    const vp = unwrap(viewbox)();
    const minX = vp.x - vp.w / 2;
    const minY = vp.y - vp.h / 2;
    return [minX, minY, vp.w, vp.h].join(" ");
};

const clientXyToViewboxXy = (clientXy: { x: number; y: number }) => {
    // console.log("viewbox", this);
    const vp = unwrap(viewbox)();
    const { x, y } = clientXy;

    return {
        x: Math.round(vp.x + x * vp.zoom),
        y: Math.round(vp.y + y * vp.zoom),
    };
};

const handleWheel = (e: Event) => {
    if (!e || !(e instanceof WheelEvent)) throw new Error("Invalid event");
    e.preventDefault();
    e.stopPropagation();

    if (e.metaKey) {
        setViewbox((v) => {
            /*
      Initial viewBox:  0 0 100 100
      Zoom X2:          25 25 50 50
      Zoom X4:          37.5 37.5 25 25
      */
            const deltaZoom = e.deltaY / 1000;
            const scale = 1 + deltaZoom;

            const newZoom = v.zoom / scale;
            const newW = v.w * scale;
            const newH = v.h * scale;
            // ! removed /2 when changing to left/top x/y system
            // const newX = v.x - (newW - v.w);
            // const newY = v.y - (newH - v.h);

            return {
                ...v,
                // x: newX,
                // y: newY,
                w: newW,
                h: newH,
                zoom: newZoom,
            };
        });
    } else {
        setViewbox((v) => {
            const dx = e.deltaX / v.zoom;
            const dy = e.deltaY / v.zoom;
            const newX = Math.round(v.x + dx);
            const newY = Math.round(v.y - dy);

            return {
                ...v,
                x: newX,
                y: newY,
            };
        });
    }
};

export default viewbox;

export {
    clientXyToViewboxXy,
    handleWheel,
    setViewbox,
    type Viewbox,
    viewboxStyle as viewboxToStyle,
};
