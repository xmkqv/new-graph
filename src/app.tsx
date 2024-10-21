import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import Nav from "~/components/Nav";

import "./app.css";

/*
- [ ] https://yuku.takahashi.coffee/textcomplete/

# autosizing

- autosize(document.querySelectorAll("text-cell"));
*/

const INIT_FLUX_H = 700;
const INIT_FLUX_W = 500;

// Set the distance at which you want to trigger hover
const proximityThreshold = 200;

export default function App() {
    // Handle mouse move globally

    return (
        <Router
            root={(props) => (
                <>
                    <Nav />
                    <Suspense>{props.children}</Suspense>
                </>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
