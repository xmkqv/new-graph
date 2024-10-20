function generateUniqueId() {
    return Math.random().toString(36).substring(2, 9);
}

export { generateUniqueId };
