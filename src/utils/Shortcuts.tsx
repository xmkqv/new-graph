type ShortcutCallback = (e: KeyboardEvent) => void;

/*
  Ctrl: Detected by event.ctrlKey.
  Shift: Detected by event.shiftKey.
  Alt: Detected by event.altKey.
  Meta: Detected by event.metaKey.
  Key: Detected by event.key.
  Space: Detected by event.code.
  
  // other
  - backspace: Backspace
  - tab: Tab

  there is no guarantee that a browser will allow a default action to be overridden

  - known cases:
    - meta+n

| Action | Shortcut |
| --- | --- |
| swap view | meta + tab |
| toggle qx | space |
*/

function isEscape(e: KeyboardEvent): boolean {
    return e.key === "Escape";
}

function isShortcut(e: KeyboardEvent): boolean {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || isEscape(e)) {
        return true;
    }
    return false;
}

class ShortcutManager {
    private shortcuts: Map<string, ShortcutCallback>;

    constructor() {
        this.shortcuts = new Map<string, ShortcutCallback>();
        this.handleKeydown = this.handleKeydown.bind(this); // wtf
        document.addEventListener("keydown", this.handleKeydown);
    }

    register(
        combo: string,
        callback: ShortcutCallback,
        options?: { override: boolean }
    ): void {
        const shortcut = combo.toLowerCase();
        if (options?.override) {
            this.unregisterShortcut(shortcut);
        } else if (this.shortcuts.has(shortcut)) {
            return console.log(
                "Shortcut already registered, ignoring:",
                shortcut
            );
        }
        this.shortcuts.set(shortcut, callback);
    }

    unregisterShortcut(combo: string) {
        const shortcut = combo.toLowerCase();
        this.shortcuts.delete(shortcut);
    }

    private handleKeydown(event: KeyboardEvent) {
        // console.log("handleKeydown", event);
        if (!isShortcut(event)) return;
        const keyCombo = this.getKeyCombo(event);
        const callback = this.shortcuts.get(keyCombo);
        if (callback) {
            console.log("Shortcut detected:", keyCombo, callback);
            event.preventDefault();
            event.stopPropagation();
            callback(event);
        }
    }

    private getKeyCombo(event: KeyboardEvent): string {
        if (!event.key) return "";

        const keys: string[] = [];

        if (event.ctrlKey) keys.push("meta");
        else if (event.shiftKey) keys.push("shift");
        else if (event.altKey) keys.push("alt");
        else if (event.metaKey) keys.push("meta");

        keys.push(event.key);
        const shortcut = keys.join("+").toLowerCase();
        return shortcut;
    }

    /**
     * Removes all registered shortcuts and event listeners.
     */
    destroy(): void {
        this.shortcuts.clear();
        document.removeEventListener("keydown", this.handleKeydown);
    }
}

const shortcuts = new ShortcutManager();

export default shortcuts;

const EDITOR_SHORTCUT = "meta+e";
const CHAT_SHORTCUT = "meta+c";
const CLEAR_SELECTEDIDS_SHORTCUT = "escape";
const DEL_SELECTEDIDS_SHORTCUT = "meta+backspace";

export {
    CHAT_SHORTCUT,
    CLEAR_SELECTEDIDS_SHORTCUT,
    DEL_SELECTEDIDS_SHORTCUT,
    EDITOR_SHORTCUT,
};
