export default {
    REGISTER_SERVICEWORKER: process.env.REGISTER_SERVICEWORKER === "true",
    DEBUG: window.location.search.includes("debug"),
    WORLD_WIDTH: 40
}