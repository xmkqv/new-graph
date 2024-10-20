import { describe, expect, it } from "vitest";

import { createPersistentStorage } from "~/storage/api";

describe("Persistent Storage API", () => {
    const storage = createPersistentStorage("testKey");

    it("should set a value in storage", () => {
        storage.set("name", "John Doe");
        expect(storage.get("name")).toBe("John Doe");
    });

    it("should retrieve a value from storage", () => {
        storage.set("age", 30);
        expect(storage.get("age")).toBe(30);
    });

    it("should remove a value from storage", () => {
        storage.set("color", "blue");
        storage.remove("color");
        expect(storage.get("color")).toBeUndefined();
    });

    it("should listen for changes in storage", (done) => {
        const listener = (newValue) => {
            expect(newValue).toBe("red");
            done();
        };

        storage.subscribe(listener);
        storage.set("favoriteColor", "red"); // Should trigger the subscriber
    });
});
