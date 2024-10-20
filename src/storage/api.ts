export function createPersistentStorage(keyPrefix: string) {
    const subscribers = new Map<string, Function[]>();

    const storage = {
        get<T>(key: string): T | undefined {
            const item = window.localStorage.getItem(`${keyPrefix}-${key}`);
            return item ? JSON.parse(item) : undefined;
        },
        set<T>(key: string, value: T): void {
            window.localStorage.setItem(
                `${keyPrefix}-${key}`,
                JSON.stringify(value)
            );
            this.notifySubscribers(key, value);
        },
        remove(key: string): void {
            window.localStorage.removeItem(`${keyPrefix}-${key}`);
            this.notifySubscribers(key, undefined);
        },
        subscribe(callback: (newValue: any) => void) {
            const key = "listenerKey";
            if (!subscribers.has(key)) {
                subscribers.set(key, []);
            }
            subscribers.get(key)!.push(callback);
        },
        notifySubscribers(key: string, newValue: any) {
            const keyListeners = subscribers.get(key) || [];
            for (const callback of keyListeners) {
                callback(newValue);
            }
        },
    };

    return storage;
}
