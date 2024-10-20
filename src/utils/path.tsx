/* (alias) cubicBezier(
    mX1: number, // this is the x coordinate of the first control point
    mY1: number, // this is the y coordinate of the first control point
    mX2: number, // this is the x coordinate of the second control point
    mY2: number // this is the y coordinate of the second control point
  ): (t: number) => number
  */
// ???

// [motion-one examples](https://motion.dev/docs/examples)
// https://cubic-bezier.com/#.22,1.23,.82,.62

export const CUBIC_PATH_PATTERN =
    /M (-?\d+) (-?\d+) C (-?\d+) (-?\d+), (-?\d+) (-?\d+), (-?\d+) (-?\d+)/;

function getPathD(x0: number, y0: number, x1: number, y1: number) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const c0 = Math.round(x0 + (x1 - x0) / 2);
    const c1 = Math.round(y0);

    const c2 = Math.round(x1 - (x1 - x0) / 2);
    const c3 = Math.round(y1);

    const d = `M ${x0} ${y0} C ${c0} ${c1}, ${c2} ${c3}, ${x1} ${y1}`;
    return d;
}

function newPath(x0: number, y0: number, x1: number, y1: number) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = getPathD(x0, y0, x1, y1);
    path.setAttribute("d", d);
    return path;
}

export { getPathD, newPath };
