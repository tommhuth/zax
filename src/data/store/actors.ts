import random from "@huth/random"
import { bulletSize, store } from "../store"
import { Plane, Turret } from "../types"
import { Box3, Vector3 } from "three"
import { Tuple3 } from "../../types"
import { OBB } from "three/examples/jsm/math/OBB"
import { updateWorld } from "./utils"

export function createBullet({
    position = [0, 0, 0],
    rotation,
    owner,
    size = bulletSize,
    speed = 10,
    damage,
    color = "#fff",
}) { 
    let id = random.id()
    let obb = new OBB(new Vector3(...position), new Vector3(...size.map(i => i / 2)))
    let aabb = new Box3().setFromCenterAndSize(new Vector3(...position), new Vector3(0, 0, 0))
    let { instances } = store.getState()

    updateWorld({
        bullets: [
            {
                position: new Vector3(...position),
                id,
                obb,
                damage,
                mounted: false,
                index: instances.line.index.next(),
                aabb,
                color,
                size: [size[0], size[1], size[2]],
                speed,
                owner,
                rotation,
            },
            ...store.getState().world.bullets,
        ]
    })
}

export function removeBullet(...ids: string[]) {
    updateWorld({
        bullets: store.getState().world.bullets.filter(i => !ids.includes(i.id))
    })
}


export function damageTurret(id: string, damage: number) {
    let turrets = store.getState().world.turrets
    let turret = turrets.find(i => i.id === id) as Turret
    let health = Math.max(turret.health - damage, 0)
    let score = store.getState().player.score

    if (!turret) {
        return
    }

    store.setState({
        player: {
            ...store.getState().player,
            score: score + (health === 0 ? 1000 : 100)
        },
        world: {
            ...store.getState().world,
            turrets: [
                ...turrets.filter(i => i.id !== id),
                {
                    ...turret,
                    health: Math.max(turret.health - damage, 0)
                }
            ]
        }
    })

}

export function damageRocket(id: string, damage: number) {
    let rockets = store.getState().world.rockets
    let rocket = rockets.find(i => i.id === id) as Plane
    let health = Math.max(rocket.health - damage, 0)
    let score = store.getState().player.score

    if (!rocket) {
        return
    }

    store.setState({
        player: {
            ...store.getState().player,
            score: score + (health === 0 ? 1000 : 100)
        },
        world: {
            ...store.getState().world,
            rockets: [
                ...rockets.filter(i => i.id !== id),
                {
                    ...rocket,
                    health,
                }
            ]
        }
    })

}

export function damagePlane(id: string, damage: number) {
    let planes = store.getState().world.planes
    let plane = planes.find(i => i.id === id) as Plane
    let health = Math.max(plane.health - damage, 0)
    let score = store.getState().player.score

    if (!plane) {
        return
    }

    store.setState({
        player: {
            ...store.getState().player,
            score: score + (health === 0 ? 1000 : 100)
        },
        world: {
            ...store.getState().world,
            planes: [
                ...planes.filter(i => i.id !== id),
                {
                    ...plane,
                    health,
                }
            ]
        }
    })

}

export function removeTurret(id: string) {
    let { world: { grid, turrets } } = store.getState()
    let turret = turrets.find(i => i.id === id)

    if (turret) {
        updateWorld({
            turrets: turrets.filter(i => i.id !== id)
        })
        grid.remove(turret.client)
    }
}

export function removePlane(id: string) {
    let { world: { grid, planes } } = store.getState()
    let plane = planes.find(i => i.id === id)

    if (plane) {
        updateWorld({
            planes: planes.filter(i => i.id !== id)
        })
        grid.remove(plane.client)
    }
}


export function createTurret(
    fireFrequency = random.integer(1500, 2200),
    [x = 0, y = 0, z = -10] = [],
) {
    let id = random.id()
    let size = [1.65, 1.5, 1.65] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, turrets } = store.getState().world
    let client = grid.newClient(
        position.toArray(),
        [...size],
        { type: "turret", id, size, position }
    )
    let rotation = random.pick(Math.PI * 2, Math.PI * .5, Math.PI, Math.PI * 1.5)

    updateWorld({
        turrets: [
            {
                position,
                fireFrequency,
                size,
                health: 70,
                rotation,
                id,
                aabb,
                client,
            },
            ...turrets,
        ]
    })

    return id
}

export function createPlane(
    [x, y, z] = [0, 0, -10],
    speed = random.float(4, 5),
    fireFrequency = 850,
) {
    let id = random.id()
    let size = [1, 1.5, 2] as Tuple3
    let position = new Vector3(x, y, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, planes } = store.getState().world
    let client = grid.newClient(
        position.toArray(),
        [size[0], size[1], size[2]],
        { type: "plane", id, size, position }
    )

    updateWorld({
        planes: [
            {
                position,
                size,
                health: 20,
                fireFrequency,
                id,
                speed,
                aabb,
                client,
            },
            ...planes,
        ]
    })

    return id
}

export function removeRocket(id: string) {
    let { grid, rockets } = store.getState().world
    let rocket = rockets.find(i => i.id === id)

    if (rocket) {
        updateWorld({
            rockets: rockets.filter(i => i.id !== id)
        })
        grid.remove(rocket.client)
    }
}

export function createRocket(
    [x = 0, y = 0, z = 0] = [],
    speed = random.float(1.5, 3),
    health = 35,
) {
    let id = random.id()
    let size = [.75, 3, .75] as Tuple3
    let position = new Vector3(x, y - size[1], z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, rockets } = store.getState().world
    let client = grid.newClient(
        position.toArray(),
        [...size],
        { type: "rocket", id, size, position }
    )

    updateWorld({
        rockets: [
            ...rockets,
            {
                id,
                position,
                aabb,
                client,
                size,
                health,
                speed,
            }
        ]
    })

    return id
}