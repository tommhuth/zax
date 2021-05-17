export default {
    REGISTER_SERVICEWORKER: process.env.REGISTER_SERVICEWORKER === "true",
    DEBUG: window.location.search.includes("debug"),
    WORLD_WIDTH: 40,
    PLAYER_LEFT_EDGE: 9,
    PLAYER_RIGHT_EDGE: -16,
    PLAYER_UPPER_EDGE: 16,
    PLAYER_LOWER_EDGE: 3,
    WARP_Y: 5
}