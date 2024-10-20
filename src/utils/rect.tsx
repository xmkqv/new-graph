import { JSX } from "solid-js";

type Drect = { dx?: number; dy?: number; dw?: number; dh?: number };

type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
};

const isZeroRect = (rect: Rect) =>
    rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0;

function mergeRect(r0: Rect, r1: Rect): Rect {
    // if they don't touch, it aint no merge, so first get the merge type
    const fr0 = {
        ...r0,
        right: r0.left + r0.width,
        bottom: r0.top + r0.height,
    };
    const fr1 = {
        ...r1,
        right: r1.left + r1.width,
        bottom: r1.top + r1.height,
    };

    if (fr0.right === fr1.left) {
        // merge right
        return {
            left: r0.left,
            top: Math.min(r0.top, r1.top),
            width: r0.width + r1.width,
            height: Math.max(r0.height, r1.height),
        };
    } else if (fr0.left === fr1.right) {
        // merge left
        return {
            left: r1.left,
            top: Math.min(r0.top, r1.top),
            width: r0.width + r1.width,
            height: Math.max(r0.height, r1.height),
        };
    } else if (fr0.bottom === fr1.top) {
        // merge bottom
        return {
            left: Math.min(r0.left, r1.left),
            top: r0.top,
            width: Math.max(r0.width, r1.width),
            height: r0.height + r1.height,
        };
    } else if (fr0.top === fr1.bottom) {
        // merge top
        return {
            left: Math.min(r0.left, r1.left),
            top: r1.top,
            width: Math.max(r0.width, r1.width),
            height: r0.height + r1.height,
        };
    } else {
        console.log(fr0, fr1);
        throw new Error("no merge");
    }
}

type Grid = Record<string, Rect>;

function createGrid(
    width: number,
    height: number,
    ncol: number,
    nrow: number
): Grid {
    const grid: Grid = {};
    const dx = Math.round(width / ncol);
    const dy = Math.round(height / nrow);
    for (let i = 0; i < nrow; i++) {
        for (let j = 0; j < ncol; j++) {
            grid[`${i}-${j}`] = {
                left: j * dx,
                top: i * dy,
                width: dx,
                height: dy,
            };
        }
    }
    return grid;
}

function newRect({ left, top, width, height }: Rect): Rect {
    return {
        left: Math.round(left),
        top: Math.round(top),
        width: Math.round(width),
        height: Math.round(height),
    };
}

const rectToStyle = (rect: Rect | undefined): JSX.CSSProperties => {
    if (!rect) return {};
    rect = newRect(rect);
    return {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };
};

type Xy = { x: number; y: number };

type Rectangle = { x: number; y: number; w: number; h: number };

function isBetween(x: number, center: number, width: number) {
    return x > center - width / 2 && x < center + width / 2;
}

function Bbox({ x, y, w, h }: Rectangle) {
    const bbox = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
    return bbox.map((n) => Math.round(n)) as [number, number, number, number];
}

function getCenterRect(wh: { width: number; height: number }): Rect {
    const WINDOW_CENTER = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    };
    return {
        left: WINDOW_CENTER.x - wh.width / 2,
        top: WINDOW_CENTER.y - wh.height / 2,
        width: wh.width,
        height: wh.height,
    };
}

export type { Drect, Grid, Rect, Rectangle, Xy };

export {
    Bbox,
    createGrid,
    getCenterRect,
    isBetween,
    isZeroRect,
    mergeRect,
    newRect,
    rectToStyle,
};
