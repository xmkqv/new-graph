const CANVAS_ID = "canvas";
const CANVAS_CLASS = "canvas";

const canvas = () => {
    const c = document.getElementById(CANVAS_ID);
    if (!(c instanceof SVGGraphicsElement)) console.log("canvas not ready", c);
    return c as SVGGraphicsElement;
};

function clientXyToCanvasXy(x: number, y: number, canvas: SVGSVGElement) {
    const ctm = canvas.getScreenCTM();
    const xy0 = new DOMPoint(x, y);
    const canvasXy = xy0.matrixTransform(ctm?.inverse());
    return canvasXy;
}

export default canvas;

export { CANVAS_CLASS, CANVAS_ID, clientXyToCanvasXy };
