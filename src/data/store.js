import random from "@huth/random"
import { useState } from "react"
import { Box3, Sphere, Vector3 } from "three"
import create from "zustand"
import { clamp } from "../utils"

const WorldMode = {
    ASTEROID: "as",
    SPACE: "space",
}

const BlockType = {
    ASTEROID_START: "asteroid-start",
    ASTEROID_MEDIUM_BLOCK: "asteroid-medium-block"
}



const store = create(() => ({
    player: {
        position: [0, 15, -40],
        health: 100
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
        mode: "asteroid",
        modeCount: 0,
        turrets: [],
        turretIndex: 0,
        tanks: [],
        tankIndex: 0,
        blocks: [ 
            {
                type: "asteroid-start",
                z: 0,
                depth: 15,
                id: random.id()
            },
            {
                type: "asteroid-wall",
                z: 15,
                depth: 0,
                id: random.id()
            }, 
            {
                type: "asteroid-medium-block",
                z: 15,
                depth: 80,
                id: random.id()
            },
            {
                type: "asteroid-medium-block",
                z: 95,
                depth: 80,
                id: random.id()
            }
        ]
    }
}))

function getBlock(blocks) {
    let lastBlock = blocks[blocks.length - 1]
    let type = random.pick(
        "asteroid-medium-block",
        "asteroid-medium-block",
        "asteroid-medium-block",
        "asteroid-wall"
    )

    if (type === "asteroid-wall" && lastBlock.type !== "asteroid-wall") {
        return {
            type: "asteroid-wall",
            depth: 0
        }
    } else {
        return {
            type: "asteroid-medium-block",
            depth: 80,
        }
    }
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


export function generateWorld(viewportDiagonal) {
    let { world, player } = store.getState()
    let lastBlock = world.blocks[world.blocks.length - 1]
    let firstBlock = world.blocks[0]
    let bufferFront = viewportDiagonal * .9
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

export function createTurret(x, y, z) {
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

export function createTank(x, y, z) {
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

export function hitPlayer(power = .2) {
    store.setState({
        player: {
            ...store.getState().player,
            health: clamp(store.getState().player.health - power, 0, 1),
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

    /*
    if (health === 0) {
        store.setState({
            obstacles: store.getState().obstacles.filter(i => i.id !== id)
        })
    } else {
        */
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

export function removeObstacle(id) {
    store.setState({
        obstacles: store.getState().obstacles.filter(i => i.id !== id)
    })
}

export function createObstacle({
    width,
    height,
    depth,
    position,
    radius,
    health = Infinity
}) {
    let container
    let id = random.id()

    if (radius) {
        container = new Sphere(radius)
    } else {
        container = new Box3().setFromCenterAndSize(new Vector3(position[0], position[1] + height / 2, position[2]), new Vector3(width, height, depth))
    }

    store.setState({
        obstacles: [
            ...store.getState().obstacles,
            {
                width,
                height,
                depth,
                position,
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