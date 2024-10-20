// src/hooks/useHold.ts
import { Accessor, createSignal } from "solid-js";

export function useHold(
    onHoldComplete: () => void,
    moved: Accessor<boolean>,
    holdDuration: number = 750,
    intervalDelay: number = 50
) {
    const [holding, setHolding] = createSignal<number | undefined>(undefined);

    let holdInterval: number | undefined;
    let holdStartTime: number | undefined;
    let lastMousePosition: { x: number; y: number } | undefined;

    const start = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        holdStartTime = performance.now();
        lastMousePosition = { x: e.clientX, y: e.clientY };

        setHolding(0); // Start loading

        holdInterval = window.setInterval(() => {
            const elapsed = performance.now() - (holdStartTime || 0);
            const progress = Math.min(elapsed / holdDuration, 1);
            setHolding(progress);

            if (moved()) {
                return end();
            }

            if (progress >= 1) {
                end(); // Ensure the interval is cleared
                return onHoldComplete(); // Execute the callback
            }
        }, intervalDelay);
    };

    function end() {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = undefined;
        }
        const completed =
            holdDuration <= performance.now() - (holdStartTime || 0);
        holdStartTime = undefined;
        setHolding(undefined); // Reset loading signal
        return completed;
    }

    return {
        holding,
        start,
        end,
    };
}
