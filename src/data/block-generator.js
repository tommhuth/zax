import random from "@huth/random"

let index = 0
const BlockType = {
    ASTEROID_START: "asteroid-start",
    ASTEROID_END: "asteroid-end",
    ASTEROID_WALL: "asteroid-wall",
    ASTEROID_FORCEFIELD: "asteroid-forcefield",
    ASTEROID_MEDIUM_BLOCK: "asteroid-medium-block",
    ASTEROID_MEDIUM_BLOCK2: "asteroid-medium-block2",
    SPACE: "space",
    SPACE_START: "space-start",
    SPACE_MID: "space-mid",
    SPACE_MID2: "space-mid2",
    SPACE_END: "space-end",
}
const map = [
    [BlockType.ASTEROID_START],
    [BlockType.ASTEROID_FORCEFIELD],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_WALL],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [
        BlockType.ASTEROID_MEDIUM_BLOCK,
        BlockType.ASTEROID_MEDIUM_BLOCK2,
    ],
    [BlockType.ASTEROID_WALL],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_WALL],
    [BlockType.ASTEROID_MEDIUM_BLOCK2],
    [
        BlockType.ASTEROID_MEDIUM_BLOCK,
        BlockType.ASTEROID_WALL,
    ],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_FORCEFIELD],
    [BlockType.ASTEROID_END],
    [BlockType.SPACE_START],
    [BlockType.SPACE_MID],
    [BlockType.SPACE_MID2],
    [BlockType.SPACE_MID, BlockType.SPACE_MID2],
    [BlockType.SPACE_MID],
    [BlockType.SPACE_MID, BlockType.SPACE_MID2],
    [BlockType.SPACE_MID],
    [BlockType.SPACE_MID, BlockType.SPACE_MID2],
    [BlockType.SPACE_MID2],
    [BlockType.SPACE_MID, BlockType.SPACE_MID2],
    [BlockType.SPACE_MID2],
    [BlockType.SPACE_MID],
    [BlockType.SPACE_END],
]

function makeBlock(type) {
    switch (type) {
        case BlockType.SPACE_START:
            return {
                depth: 100,
                type
            }
        case BlockType.SPACE_MID:
            return {
                depth: 40,
                type
            }
        case BlockType.SPACE_MID2:
            return {
                depth: 20,
                type
            }
        case BlockType.SPACE_END:
            return {
                depth: 100,
                type
            }
        case BlockType.ASTEROID_FORCEFIELD:
            return {
                depth: 0,
                type
            }
        case BlockType.ASTEROID_WALL:
            return {
                depth: 0,
                type
            }
        case BlockType.ASTEROID_MEDIUM_BLOCK:
        case BlockType.ASTEROID_MEDIUM_BLOCK2:
            return {
                depth: 65,
                hasFighter: index > 3,
                type
            }
        case BlockType.ASTEROID_START:
        case BlockType.ASTEROID_END:
            return {
                depth: 27,
                type
            }
    }
}

function getBlock() {
    index = index < map.length - 1 ? index + 1 : 0

    return makeBlock(random.pick(...map[index]))
}


export { BlockType, getBlock }