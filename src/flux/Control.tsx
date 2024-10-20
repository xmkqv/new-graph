import { IconTypes } from "solid-icons";
import * as Hi from "solid-icons/hi";
import { createSignal, onMount } from "solid-js";

import tippy from "tippy.js";

import Menu from "./Menu";

import "tippy.js/dist/tippy.css";

type Breadcrumbs = Control[][];

type Scope = {
    selectedId: string | undefined;
    nexusId: string | undefined;
    selectedIds: string[];
};

type ClickProps = {
    menu: Menu;
    scope: Scope;
};

type DefaultControl = {
    button: {
        onClick: (click: ClickProps) => void;
    };
    buttons: {
        names: string[];
        onClick: (click: ClickProps, name: string, index: number) => void;
    };
    selection: {
        names: string[];
    };
};

type ControlType = keyof DefaultControl;

type Control = {
    type: ControlType;
    name: string;
    icon?: IconTypes;
    control: DefaultControl[keyof DefaultControl];
};

type ControlProps = Control & { menu: Menu };

function ControlElement(props: ControlProps) {
    console.log("ControlElement Init", props);
    let ref: HTMLElement | null = null;

    const [hovered, setHovered] = createSignal(false);

    const scope = {
        selectedId: "",
        nexusId: "",
        selectedIds: [],
    };

    const commonClasses = `control ${props.type} ${hovered() ? "hovered" : ""}`;

    const iconProps = {
        size: "1.5em",
        color: "currentColor",
        title: props.name,
        style: { cursor: "pointer" },
    };

    const Icon = props.icon ? (
        props.icon(iconProps)
    ) : (
        <Hi.HiSolidQuestionMarkCircle {...iconProps} />
    );

    onMount(() => {
        if (ref) {
            tippy(ref, {
                content: props.name,
                animation: "fade",
            });
        }
    });

    if (props.type === "button") {
        const control = props.control as DefaultControl["button"];
        return (
            <button
                ref={(r) => (ref = r)}
                class={commonClasses}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                // onClick={(e) => props.onClick(clickProps)}
                onClick={() =>
                    control.onClick({
                        menu: props.menu,
                        scope,
                    })
                }
            >
                {Icon}
            </button>
        );
    } else if (props.type === "selection") {
        const control = props.control as DefaultControl["selection"];
        return (
            <div
                ref={(r) => (ref = r)}
                class={commonClasses}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {Icon}
                <span class="text">{props.name}</span>
            </div>
        );
    }
}

export default ControlElement;

export type { Breadcrumbs, Control, ControlType };
