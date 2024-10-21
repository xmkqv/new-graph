import { A } from "@solidjs/router";

import Counter from "~/components/Counter";

export default function Home() {
    return (
        <main class="text-center mx-auto text-gray-700 p-4">
            <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
                Hello world!
            </h1>
            <Counter />

            <p class="my-4">
                <span>Home</span>
                {" - "}
                <A href="/about" class="text-sky-600 hover:underline">
                    About
                </A>{" "}
                <A href="/qx" class="text-sky-600 hover:underline">
                    qx
                </A>
                <A href="/beadExample" class="text-sky-600 hover:underline">
                    Bead
                </A>
            </p>
        </main>
    );
}
