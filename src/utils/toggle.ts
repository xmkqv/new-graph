import { Accessor, createEffect, createSignal, Setter } from "solid-js";

type Toggle = {
    get: Accessor<boolean>;
    set: Setter<boolean>;
    toggle: (force?: boolean) => void;
    ref: Accessor<HTMLElement | null>;
    setRef: Setter<HTMLElement | null>;
};

type ToggleOptions = {
    focusOnTrue?: boolean;
};

const createToggle = (init?: boolean, toggleOptions?: ToggleOptions) => {
    const [ref, setRef] = createSignal<HTMLElement | null>(null);
    const [state, setState] = createSignal(init || false);

    const toggle = (force?: boolean) => {
        setState((prev) => (force !== undefined ? force : !prev));
    };

    createEffect(() => {
        if (toggleOptions?.focusOnTrue && ref()) {
            if (state()) {
                ref()?.focus();
            }
        }
    });

    return {
        get: state,
        set: setState,
        toggle,
        ref,
        setRef,
    };
};

export { createToggle, type Toggle };
