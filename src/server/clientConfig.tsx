const API_ROUTE = import.meta.env.VITE_API_ROUTE;
const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

import * as client from "./client";
// client = lazy(() => import("./client"));

console.log("clientConfig.tsx HOST:", HOST);

try {
    client.client.setConfig({
        baseURL: `http://${HOST}:${PORT}${API_ROUTE}`,
        // withCredentials: true,
    });
} catch {
    console.log("clientConfig.tsx caught error");
}

export default client;
