import { JSX } from "solid-js";

import { rectToStyle } from "~/utils/rect";

type ProximityHoverProps = {
    setIsHovered: (isHovered: boolean) => void;
};

function ProximityHover(props: ProximityHoverProps) {
    // make this 2x of the parent container

    return (
        <div
            style={{
                width: "200%",
                height: "200%",
                opacity: 0,
                position: "absolute",
                // border: "1px solid red",
            }}
            onMouseEnter={() => props.setIsHovered(true)}
            onMouseLeave={() => props.setIsHovered(false)}
        ></div>
    );
}

const App = () => {
    const rect: JSX.CSSProperties = rectToStyle({
        left: 400,
        top: 400,
        width: 100,
        height: 100,
    });
    return (
        <div style={{ ...rect, position: "fixed", border: "1px solid blue" }}>
            App
            <div>Other</div>
        </div>
    );
};

export default App;
