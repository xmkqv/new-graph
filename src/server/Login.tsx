import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import invariant from "tiny-invariant";

import { FLUX_ROUTE } from "../constants";
import db, { ACCESS_METHOD, DATABASE, NAMESPACE } from "./db";
import { setUsername } from "./user";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsernameInput] = createSignal("");
    const [password, setPasswordInput] = createSignal("");
    const [signup, setSignup] = createSignal(false);

    function trySignin() {
        const signinParams = {
            namespace: NAMESPACE,
            database: DATABASE,
            access: ACCESS_METHOD,

            variables: {
                // booya
                username: username(),
                password: password(),
            },
        };
        console.log("Trying to signin", signinParams);
        db.signin(signinParams)
            .then((token) => {
                // db.use({ namespace: NAMESPACE, database: DATABASE });
                if (!token) {
                    setSignup(true);
                } else {
                    console.log("Logged in", db);
                    setUsername(username());
                    // db.info() // selects everything from the $auth table
                    navigate(FLUX_ROUTE);
                }
            })
            .catch((err) => {
                console.error("Failed to signin", err);
                trySignup();
            });
    }

    function trySignup() {
        db.signup({
            namespace: NAMESPACE,
            database: DATABASE,
            access: ACCESS_METHOD,
            variables: {
                username: username(),
                password: password(),
            },
        }).then((token) => {
            invariant(token, "Failed to signup");
            console.log("Signed up", db);
            trySignin();
        });
    }

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    trySignin();
                }}
            >
                <input
                    type="text"
                    placeholder="username"
                    value={username()}
                    onInput={(e) => setUsernameInput(e.currentTarget.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password()}
                    onInput={(e) => setPasswordInput(e.currentTarget.value)}
                />
                <button type="submit">Login</button>
            </form>
            <Show when={signup()}>
                <button onClick={trySignup}>Signup?</button>
            </Show>
        </div>
    );
};

export default Login;
