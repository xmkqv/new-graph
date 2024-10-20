import { RecordId, Surreal } from "surrealdb";

const ANON = "qx";
const ANON_PASS = "qx";

const HOSTNAME = "wss://db-polished-cloud-1232.fly.dev/rpc";

const NAMESPACE = "qx";
const DATABASE = "qx";
const ACCESS_METHOD = "user";

let db = new Surreal();

await db.connect(HOSTNAME);

// await db.query('delete node')
// db.invalidate();

type SignIn = {
    namespace: string;
    database: string;
    access: string;
    variables: {
        username: string;
        password: string;
    };
};

const signinParams: SignIn = {
    namespace: NAMESPACE,
    database: DATABASE,
    access: ACCESS_METHOD,

    variables: {
        username: ANON,
        password: ANON_PASS,
    },
};

await db.signin(signinParams);

export default db;

export { ACCESS_METHOD, DATABASE, NAMESPACE, RecordId };
