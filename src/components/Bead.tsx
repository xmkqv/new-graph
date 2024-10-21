import { createEffect, createMemo, createSignal, Show } from "solid-js";

// import { debounce, set } from 'lodash';
import { mousePos } from "./Mouse";

import "./bead.css";

function getRingPoint(
    xy: { x: number; y: number },
    angle: number,
    radius: number
) {
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    return { x: xy.x + dx, y: xy.y + dy };
}

function getTiles(point: { x: number; y: number }) {
    const elements = document.elementsFromPoint(point.x, point.y);
    return elements.filter((e) => e.classList.contains("tile"));
}

const Bead = () => {
    const [hoveredElement, setHoveredElement] = createSignal<Element>();
    const [elementRect, setElementRect] = createSignal<DOMRect | undefined>(
        undefined
    );

    const RING_RADIUS = 150;
    let lastQueryTime = performance.now();

    createEffect(() => {
        const pos = mousePos();
        const now = performance.now();
        if (now - lastQueryTime < 100) {
            return;
        }
        lastQueryTime = now;

        const hoveredTile = getTiles(pos)[0];

        if (hoveredTile) {
            setHoveredElement(hoveredTile);
            setElementRect(hoveredTile.getBoundingClientRect());
            return;
        }

        const proximityPoints = [
            getRingPoint(pos, 0, RING_RADIUS),
            getRingPoint(pos, Math.PI / 2, RING_RADIUS),
            getRingPoint(pos, Math.PI, RING_RADIUS),
            getRingPoint(pos, (3 * Math.PI) / 2, RING_RADIUS),
        ];

        const proximityTiles = proximityPoints
            .flatMap((point) => ({
                dist: Math.hypot(point.x - pos.x, point.y - pos.y),
                tiles: getTiles(point),
            }))
            .filter((t) => t.tiles.length !== 0);

        if (proximityTiles.length === 0) {
            setHoveredElement(undefined);
            setElementRect(undefined);
            return;
        }

        const closestTiles = proximityTiles.reduce((a, b) =>
            a.dist < b.dist ? a : b
        );

        const firstClosestTile = closestTiles.tiles[0];

        setHoveredElement(firstClosestTile);
        setElementRect(firstClosestTile.getBoundingClientRect());
    });

    const pos = createMemo(() => {
        // solve for y = mx + b the linear system of equations for all four sides
        const xy = mousePos();

        const rect = elementRect();
        if (!rect) {
            setHoveredElement(undefined);
            return;
        }

        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;

        const rectX = rect.left + halfWidth;
        const rectY = rect.top + halfHeight;

        const dx = xy.x - rectX;
        const dy = xy.y - rectY;
        const vecSlope = dy / dx;
        const vecYIntercept = rectY - vecSlope * rectX;

        const rectLines = [
            { y: rect.top },
            { y: rect.bottom },
            { x: rect.left },
            { x: rect.right },
        ];

        const intersections = rectLines.map(({ x: lineX, y: lineY }) => {
            let intersectionX, intersectionY;
            if (lineY === undefined) {
                // left or right side
                intersectionX = lineX;
                intersectionY = vecSlope * lineX + vecYIntercept;
                if (intersectionY < rect.top || intersectionY > rect.bottom) {
                    return { x: undefined, y: undefined, dist: Infinity };
                }
            } else if (lineX === undefined) {
                // top or bottom side
                intersectionY = lineY;
                intersectionX = (lineY - vecYIntercept) / vecSlope;
                if (intersectionX < rect.left || intersectionX > rect.right) {
                    return { x: undefined, y: undefined, dist: Infinity };
                }
            } else {
                throw new Error("Invalid line");
            }
            const dist = Math.hypot(xy.x - intersectionX, xy.y - intersectionY);
            return {
                x: Math.round(intersectionX),
                y: Math.round(intersectionY),
                dist,
            };
        });

        const { x: left, y: top } = intersections.reduce((a, b) =>
            a.dist < b.dist ? a : b
        );

        const pos = { left: `${left}px`, top: `${top}px` };
        return pos;
    });

    return (
        <Show when={hoveredElement() && pos() && elementRect()}>
            {<div class="bead" style={pos()} />}
        </Show>
    );
};

export default Bead;
