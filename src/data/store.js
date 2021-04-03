import random from "@huth/random"
import { useState } from "react"
import { Box3, Sphere, Vector3 } from "three"
import create from "zustand"
import { clamp } from "../utils"


const BlockType = {
    ASTEROID_START: "asteroid-start",
    ASTEROID_END: "asteroid-end",
    ASTEROID_FORCEFIELD: "asteroid-forcefield",
    ASTEROID_MEDIUM_BLOCK: "asteroid-medium-block",
    SPACE: "space"
}

export { BlockType }

let i = 2
const map = [
    [BlockType.SPACE],
    [BlockType.ASTEROID_START],
    [BlockType.ASTEROID_FORCEFIELD],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_MEDIUM_BLOCK],
    [BlockType.ASTEROID_FORCEFIELD],
    [BlockType.ASTEROID_END],
]


const store = create(() => ({
    player: {
        position: [0, 15, -40],
        health: 1000,
        warp: false,
    },
    stats: {},
    bullets: {
        indexes: new Array(75).fill().map((i, index) => index),
        list: []
    },
    fighters: {
        indexes: new Array(40).fill().map((i, index) => index),
        list: []
    },
    particles: {
        indexes: new Array(400).fill().map((i, index) => index),
        list: []
    },
    obstacles: [],
    world: {
        stageCount: 0, 
        modeCount: 0,
        turrets: [],
        turretIndex: 0,
        tanks: [],
        tankIndex: 0,
        blocks: [
            {
                type: BlockType.SPACE,
                z: 0,
                depth: 600,
                id: random.id()
            },
            {
                type: BlockType.ASTEROID_START,
                z: 600,
                depth: 27,
                id: random.id()
            },
        ]
    }
}))

function makeBlock(type) {
    switch (type) {
        case BlockType.ASTEROID_FORCEFIELD:
            return {
                depth: 0,
                type
            }
        case BlockType.SPACE:
            return {
                depth: 600,
                type
            }
        case BlockType.ASTEROID_MEDIUM_BLOCK:
            return {
                depth: 65,
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
    let type = random.pick(...map[i])

    i = i < map.length - 1 ? i + 1 : 0

    return makeBlock(type)
}

function addBlock() {
    let { world } = store.getState()
    let lastBlock = world.blocks[world.blocks.length - 1]
    let block = getBlock(world.blocks)
    let nextBlock = {
        x: 0,
        y: 0,
        z: lastBlock.z + lastBlock.depth,
        id: random.id(),
        ...block
    }

    store.setState({
        world: {
            ...store.getState().world,
            blocks: [
                ...store.getState().world.blocks,
                nextBlock
            ]
        }
    })

    return nextBlock
}

export function updateStats(stats) {
    store.setState({
        stats: {
            ...store.getState().stats,
            ...stats
        }
    })
}

export function setWarp(status) {
    store.setState({
        player: {
            ...store.getState().player,
            warp: status
        }
    })
}


export function generateWorld(viewportDiagonal) {
    let { world, player } = store.getState()
    let lastBlock = world.blocks[world.blocks.length - 1]
    let firstBlock = world.blocks[0]
    let bufferFront = viewportDiagonal * 1
    let bufferBack = viewportDiagonal * .6
    let z = player.position[2]

    while (lastBlock.z + lastBlock.depth - z < bufferFront) {
        lastBlock = addBlock()
    }

    if (firstBlock.z + firstBlock.depth + bufferBack < player.position[2]) {
        store.setState({
            world: {
                ...world,
                blocks: world.blocks.slice(1)
            }
        })
    }

}

export function createTurret(x, y, z, health) {
    let index = (store.getState().world.turretIndex + 1) % 75
    let id = random.id()

    store.setState({
        world: {
            ...store.getState().world,
            turretIndex: index,
            turrets: [
                ...store.getState().world.turrets,
                {
                    x,
                    y,
                    z,
                    health,
                    id,
                    index,
                    position: new Vector3(x, y, z),
                }
            ]
        }
    })

    return id
}

export function removeTurret(id) {
    store.setState({
        world: {
            ...store.getState().world,
            turrets: store.getState().world.turrets.filter(i => i.id !== id)
        }
    })
}

export function createTank(x, y, z, health) {
    let index = (store.getState().world.tankIndex + 1) % 75
    let id = random.id()

    store.setState({
        world: {
            ...store.getState().world,
            tankIndex: index,
            tanks: [
                ...store.getState().world.tanks,
                {
                    x,
                    y,
                    z,
                    id,
                    health,
                    index,
                    position: new Vector3(x, y, z),
                }
            ]
        }
    })

    return id
}

export function removeTank(id) {
    store.setState({
        world: {
            ...store.getState().world,
            tanks: store.getState().world.tanks.filter(i => i.id !== id)
        }
    })
}

export function createFighter(x = random.integer(-10, 10), y = 5, z = store.getState().player.position[2] + 45) {
    if (store.getState().fighters.list.length > 110) {
        return
    }

    let index = store.getState().fighters.indexes[0]
    let id = random.id()

    store.setState({
        fighters: {
            ...store.getState().fighters,
            indexes: store.getState().fighters.indexes.filter(i => i !== index),
            list: [
                ...store.getState().fighters.list,
                {
                    x,
                    y,
                    z,
                    id,
                    index,
                    position: new Vector3(x, y, z),
                    straight: random.boolean()
                }
            ]
        }
    })

    return id
}

export function createBullet(x, y, z, owner) {
    let index = store.getState().bullets.indexes[0]

    store.setState({
        bullets: {
            ...store.getState().bullets,
            indexes: store.getState().bullets.indexes.filter(i => i !== index),
            list: [
                ...store.getState().bullets.list,
                {
                    x,
                    y,
                    z,
                    id: random.id(),
                    index,
                    speed: .85,
                    position: new Vector3(x, y, z),
                    owner
                }
            ]
        }

    })
}

export function removeBullet(id, index) {
    store.setState({
        bullets: {
            ...store.getState().bullets,
            list: store.getState().bullets.list.filter(i => i.id !== id),
            indexes: [
                ...store.getState().bullets.indexes,
                index
            ]
        }
    })
}

export function createParticle(origin, velocity, radius = random.float(.125, .45)) {
    let index = store.getState().particles.indexes[0]

    store.setState({
        particles: {
            ...store.getState().particles,
            indexes: store.getState().particles.indexes.filter(i => i !== index),
            list: [
                ...store.getState().particles.list,
                {
                    id: random.id(),
                    index, origin,
                    velocity,
                    radius,
                    position: new Vector3(...origin),
                }
            ]
        }

    })
}

export function removeParticle(id, index) {
    store.setState({
        particles: {
            ...store.getState().particles,
            list: store.getState().particles.list.filter(i => i.id !== id),
            indexes: [
                ...store.getState().particles.indexes,
                index
            ]
        }
    })
}


export function removeFighter(id, index) {
    store.setState({
        fighters: {
            ...store.getState().fighters,
            list: store.getState().fighters.list.filter(i => i.id !== id),
            indexes: [
                ...store.getState().fighters.indexes,
                index
            ]
        }
    })
}

export function hitPlayer(power = 20) {
    store.setState({
        player: {
            ...store.getState().player,
            health: clamp(store.getState().player.health - power, 0, 100),
        }
    })
}

export function setPlayerPosition(position) {
    store.setState({
        player: {
            ...store.getState().player,
            position
        }
    })
}

export function hitObstacle(id, power) {
    let obstacle = store.getState().obstacles.find(i => i.id === id)
    let health = clamp(obstacle.health - power, 0, Infinity)

    store.setState({
        obstacles: [
            ...store.getState().obstacles.filter(i => i.id !== id),
            {
                ...obstacle,
                health
            }
        ]
    })
}

export function removeObstacle(...id) {
    store.setState({
        obstacles: store.getState().obstacles.filter(i => !id.includes(i.id))
    })
}

export function createObstacle({
    width,
    height,
    depth,
    radius,
    x, y, z,
    health = Infinity
}) {
    let container
    let id = random.id()

    if (radius) {
        container = new Sphere(new Vector3(x, y, z), radius)
    } else {
        container = new Box3().setFromCenterAndSize(
            new Vector3(x, y + height / 2, z),
            new Vector3(width, height, depth)
        )
    }

    store.setState({
        obstacles: [
            ...store.getState().obstacles,
            {
                width,
                height,
                depth,
                position: [x, y, z],
                health,
                container,
                radius,
                id
            }
        ]
    })

    return id
}


export default store