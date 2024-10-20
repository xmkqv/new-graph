const USERNAME_NAME = "username";

type User = {
    id: string;
    name: string;
    pass: string;
};

function getUsername(defaultUsername: string = "anon"): string {
    const username = window.localStorage.getItem(USERNAME_NAME);
    if (username) return username;
    console.warn("no username found in local storage");
    return defaultUsername;
}

function setUsername(user: string) {
    window.localStorage.setItem(USERNAME_NAME, user);
}

export { getUsername, setUsername, type User };
