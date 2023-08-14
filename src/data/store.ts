import { Box3, Frustum, InstancedMesh, Matrix3, Object3D, Vector3 } from "three"
import create from "zustand"
import random from "@huth/random"
import { Tuple2, Tuple3 } from "../types"
import { OBB } from "three/examples/jsm/math/OBB"
import Counter from "./Counter"
import { Barrel, Building, Bullet, Explosion, Instance, Particle, Plane, RepeaterMesh, Rocket, Shimmer, Turret, WorldPart } from "./types"
import { getNextWorldPart, makeDefault } from "./generators"
import { SpatialHashGrid3D } from "./SpatialHashGrid3D"

export let isSmallScreen = window.matchMedia("(max-height: 400px)").matches || window.matchMedia("(max-width: 800px)").matches
export const pixelSize = isSmallScreen ? 4 : 6
export const dpr = 1 / pixelSize
export const bulletSize: Tuple3 = [.2, .2, 1.5]


interface Store {
    world: {
        parts: WorldPart[]
        frustum: Frustum
        grid: SpatialHashGrid3D
    }
    buildings: Building[]
    instances: Record<string, Instance>
    repeaters: Record<string, RepeaterMesh>
    bullets: Bullet[]
    turrets: Turret[]
    barrels: Barrel[]
    rockets: Rocket[]
    shimmer: Shimmer[]
    planes: Plane[]
    particles: Particle[]
    explosions: Explosion[],
    player: {
        speed: number
        cameraShake: number
        health: number
        score: number
        lastImpactLocation: Tuple3
        weapon: {
            fireFrequency: number,
            color: string,
            speed: number
            damage: number
            bulletSize: Tuple3
        }
        object: Object3D | null
    }
}


export function removeExplosion(id: string | string[]) {
    store.setState({
        explosions: store.getState().explosions.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}

interface CreateExplosionParams {
    position: Tuple3
    count?: number
    radius?: number
    fireballPath?: [start: Tuple3, direction: Tuple3]
    fireballCount?: number
}

export function createExplosion({
    position,
    count = 12,
    radius = .75,
    fireballPath: [fireballStart, fireballDirection] = [[0, 0, 0], [0, 0, 0]],
    fireballCount = 0,
}: CreateExplosionParams) {
    let baseLifetime = random.integer(1600, 1800)
    let instance = useStore.getState().instances.fireball

    radius *= random.float(1, 1.15)

    store.setState({
        explosions: [
            {
                position,
                id: random.id(),
                fireballs: [
                    {
                        id: random.id(),
                        index: instance.index.next(),
                        position,
                        startRadius: radius * .25,
                        maxRadius: radius,
                        time: 0,
                        lifetime: baseLifetime
                    },
                    ...new Array(fireballCount).fill(null).map((i, index) => {
                        let tn = index / (fireballCount - 1)

                        return {
                            index: instance.index.next(),
                            id: random.id(),
                            position: [
                                fireballStart[0] + tn * fireballDirection[0] + random.float(-.25, .25),
                                fireballStart[1] + tn * fireballDirection[1],
                                fireballStart[2] + tn * fireballDirection[2] + random.float(-.25, .25),
                            ] as Tuple3,
                            startRadius: radius * 1.5,
                            maxRadius: radius * 3.5,
                            time: index * -random.integer(75, 100),
                            lifetime: 750 + random.integer(0, 200)
                        }
                    }),
                    ...new Array(count).fill(null).map((i, index, list) => {
                        let startRadius = (index / list.length) * (radius * 1.5 - radius * .25) + radius * .25

                        return {
                            index: instance.index.next(),
                            position: [
                                random.pick(-radius, radius) + position[0],
                                random.float(0, radius * 3) + position[1],
                                random.pick(-radius, radius) + position[2]
                            ] as Tuple3,
                            startRadius,
                            id: random.id(),
                            maxRadius: startRadius * 2.5,
                            time: random.integer(-200, 0),
                            lifetime: random.integer(baseLifetime * .25, baseLifetime * .65)
                        }
                    })
                ],
            },
            ...store.getState().explosions,
        ]
    })
}

export function removeShimmer(id: string | string[]) {
    store.setState({
        shimmer: store.getState().shimmer.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}


interface CreateShimmerParams {
    position: Tuple3
    count?: [min: number, max: number]
    size?: Tuple3
    radius?: [min: number, max: number]
}

export function createShimmer({
    position = [0, 0, 0],
    count = [6, 15],
    size = [4, 4, 4],
    radius = [.05, .2]
}: CreateShimmerParams) { 
    let instance = useStore.getState().instances.shimmer

    store.setState({
        shimmer: [
            ...store.getState().shimmer,
            ...new Array(random.integer(...count)).fill(null).map(() => {
                let offsetPosition = new Vector3(
                    position[0] + random.float(-size[0] / 2, size[0] / 2),
                    position[1] + random.float(-size[1] / 2, size[1] / 2),
                    position[2] + random.float(-size[2] / 2, size[2] / 2),
                ) 
                let speed = offsetPosition.clone()
                    .sub(new Vector3(...position))
                    .normalize()
                    .multiplyScalar(4)

                return {
                    id: random.id(),
                    index: instance.index.next(),
                    gravity: random.float(.1, 1.5),
                    speed: speed.toArray(),
                    time: random.integer(-400, -250),
                    radius: random.float(...radius),
                    lifetime: random.integer(1500, 6000), 
                    friction: random.float(.3, .5),
                    position: new  Vector3(...position),
                }
            })
        ]
    })
}

const store = create<Store>(() => ({
    world: {
        grid: new SpatialHashGrid3D([4, 3, 4]),
        frustum: new Frustum(),
        parts: [
            makeDefault({ position: new Vector3(0, 0, 0), size: [10, 20] }),
        ]
    },
    instances: {},
    repeaters: {},
    buildings: [],
    explosions: [],
    shimmer: [],
    planes: [],
    turrets: [],
    barrels: [],
    bullets: [],
    rockets: [],
    particles: [],
    player: {
        speed: 8,
        cameraShake: 0,
        health: 100,
        score: 0,
        object: null,
        position: new Vector3(),
        lastImpactLocation: [0, -10, 0],
        weapon: {
            fireFrequency: 150,
            damage: 35,
            color: "yellow",
            speed: 40,
            bulletSize: [.125, .125, 1.25]
        },
        weaponHeat: 0
    }
}))
const useStore = store

export function removeByProximity(
    sourceItem: { id: string, position: Vector3 },
    threshold = 2,
    delay = random.integer(150, 200)
) {
    let tid = setTimeout(() => {
        let { turrets, barrels } = store.getState()
        let sourcePosition = sourceItem.position.clone()

        for (let [index, item] of Object.entries([...turrets, ...barrels])) {
            let isTurrent = parseFloat(index) < turrets.length
            let distance = sourcePosition.distanceTo(item.position)

            if (distance < threshold && sourceItem.id !== item.id) {
                if (isTurrent) {
                    damageTurret(item.id, 1000)
                } else {
                    damageBarrel(item.id, 1000)
                }
            }
        }
    }, delay)

    return () => clearTimeout(tid)
}

export function removeRocket(id: string) {
    let { rockets, world } = store.getState()
    let rocket = rockets.find(i => i.id === id)

    if (rocket) {
        store.setState({
            rockets: rockets.filter(i => i.id !== id)
        })
        world.grid.remove(rocket.client)
    }
}

export function createRocket(
    [x = 0, y = 0, z = -10] = [],
    speed = random.float(2.5, 4),
    health = 35,
) {
    let id = random.id()
    let size = [.75, 3, .75] as Tuple3
    let position = new Vector3(x, y - size[1], z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { world, rockets } = store.getState()
    let client = world.grid.newClient(
        position.toArray(),
        [...size],
        { type: "rocket", id, size, position }
    )

    store.setState({
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

export function createWorldPart() {
    let world = store.getState().world
    let lastPart = world.parts[world.parts.length - 1]

    store.setState({
        world: {
            ...world,
            parts: [
                ...world.parts,
                getNextWorldPart(lastPart),
            ],
        }
    })
}

export function setPlayerSpeed(speed: number) {
    store.setState({
        player: {
            ...store.getState().player,
            speed,
        }
    })
}

export function setPlayerObject(object: Object3D) {
    store.setState({
        player: {
            ...store.getState().player,
            object
        }
    })
}

export function increaseScore(amount: number) {
    store.setState({
        player: {
            ...store.getState().player,
            score: store.getState().player.score + amount,
        }
    })
}

export function damagePlayer(damage: number) {
    let player = store.getState().player

    store.setState({
        player: {
            ...player,
            health: Math.max(player.health - damage, 0),
        }
    })
}

export function setCameraShake(cameraShake: number) {
    store.setState({
        player: {
            ...store.getState().player,
            cameraShake,
        }
    })
}

export function setRepeater(name: string, meshes: Object3D[], count: number) {
    store.setState({
        repeaters: {
            ...store.getState().repeaters,
            [name]: {
                meshes,
                index: new Counter(count)
            }
        }
    })
}

export function requestRepeater(name: string) {
    let nextIndex = store.getState().repeaters[name].index.next()
    let mesh = store.getState().repeaters[name].meshes[nextIndex]

    mesh.visible = true

    return mesh
}

export function setInstance(name: string, mesh: InstancedMesh, maxCount: number) {
    store.setState({
        instances: {
            ...store.getState().instances,
            [name]: {
                mesh,
                maxCount,
                index: new Counter(maxCount)
            }
        }
    })
}

export function createTurret(
    fireFrequency = random.integer(1500, 2200),
    [x = 0, y = 0, z = -10] = [],
) {
    let id = random.id()
    let size = [1.65, 1.5, 1.65] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { world, turrets } = store.getState()
    let client = world.grid.newClient(
        position.toArray(),
        [...size],
        { type: "turret", id, size, position }
    )
    let rotation = random.pick(Math.PI * 2, Math.PI * .5, Math.PI, Math.PI * 1.5)


    store.setState({
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
    let { world, planes } = store.getState()
    let client = world.grid.newClient(
        position.toArray(),
        [size[0], size[1], size[2]],
        { type: "plane", id, size, position }
    )

    store.setState({
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

export function createBuilding(
    size: Tuple3 = [1, 1, 1],
    [x = 0, y = 0, z = 0] = [],
) {
    let id = random.id()
    let position = new Vector3(x, y + size[1] / 2, z)
    let box = new Box3().setFromCenterAndSize(new Vector3(x, y + size[1] / 2, z), new Vector3(...size))
    let { world, buildings } = store.getState()
    let client = world.grid.newClient(
        [position.x, position.y + size[1] / 2, position.z],
        [...size],
        { type: "building", id, size, position }
    )

    store.setState({
        buildings: [
            {
                position,
                id,
                size: size as Tuple3,
                aabb: box,
                client,
                color: Math.random() * 0xffffff,
            },
            ...buildings,
        ]
    })

    return id
}

interface CreateBarrelParams {
    position: Tuple3
    size?: Tuple3
    health?: number
    rotation?: number
}

export function createBarrel({
    position: [x = 0, y = 0, z = 0] = [0, 0, 0],
    rotation = 0,
    health = 25,
}: CreateBarrelParams) {
    let id = random.id()
    let size = [2, 1.85, 2] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let obb = new OBB(new Vector3(x, y, z), new Vector3(...size.map(i => i / 2)), new Matrix3().rotate(rotation))
    let aabb = new Box3().setFromCenterAndSize(new Vector3(z, y, z), new Vector3(...size))
    let { instances, world } = store.getState()
    let client = world.grid.newClient(
        position.toArray(),
        [...size],
        { type: "barrel", id, size, position }
    )

    store.setState({
        barrels: [
            {
                position,
                id,
                client,
                obb,
                health,
                index: instances.line.index.next(),
                aabb,
                size,
                rotation,
            },
            ...store.getState().barrels,
        ]
    })

    return id
}

export function damageBarrel(id: string, damage: number) {
    let barrel = store.getState().barrels.find(i => i.id === id) as Barrel

    if (!barrel) {
        return
    }

    store.setState({
        barrels: [
            ...store.getState().barrels.filter(i => i.id !== id),
            {
                ...barrel,
                health: Math.max(barrel.health - damage, 0)
            }
        ]
    })
}

export function removeBarrel(id: string) {
    let { barrels, world } = store.getState()
    let barrel = barrels.find(i => i.id === id) as Barrel

    store.setState({
        barrels: barrels.filter(i => i.id !== id)
    })

    barrel && world.grid.remove(barrel.client)
}

export function createBullet({
    position = [0, 0, 0],
    rotation,
    owner,
    size = bulletSize,
    speed = 10,
    damage,
    color,
}) {
    let id = random.id()
    let obb = new OBB(new Vector3(...position), new Vector3(...size.map(i => i / 2)))
    let aabb = new Box3().setFromCenterAndSize(new Vector3(...position), new Vector3(0, 0, 0))
    let { instances } = store.getState()

    store.setState({
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
            ...store.getState().bullets,
        ]
    })
}

interface CreateParticlesParams {
    gravity?: Tuple3
    position: Tuple3 // base position
    positionOffset?: [x: Tuple2, y: Tuple2, z: Tuple2] // additional position offset
    normal: Tuple3 // main particle direction
    speed?: Tuple2 // speed along normal
    speedOffset?: [x: Tuple2, y: Tuple2, z: Tuple2] // additional speed offset
    normalOffset?: [x: Tuple2, y: Tuple2, z: Tuple2]
    count?: Tuple2 | number
    restitution?: Tuple2
    friction?: Tuple2 | number
    radius?: Tuple2 | number
    color?: string
    name?: string
}

export function createParticles({
    name = "sphere",
    position = [0, 0, 0],
    positionOffset = [[-1, 1], [-1, 1], [-1, 1]],
    normal = [0, 1, 0],
    normalOffset = [[-.2, .2], [-.2, .2], [-.2, .2]],
    speed = [10, 20],
    speedOffset = [[0, 0], [0, 0], [0, 0]],
    count = [2, 3],
    friction = [.9, .98],
    gravity = [0, -50, 0],
    restitution = [.2, .5],
    color = "#FFFFFF",
    radius = [.15, .25],
}: CreateParticlesParams) {
    let instance = store.getState().instances[name]
    let particles: Particle[] = new Array(typeof count === "number" ? count : random.integer(...count)).fill(null).map((i, index, list) => {
        let velocity = new Vector3(
            (normal[0] + random.float(...normalOffset[0])) * random.float(...speed) + random.float(...speedOffset[0]),
            (normal[1] + random.float(...normalOffset[1])) * random.float(...speed) + random.float(...speedOffset[1]),
            (normal[2] + random.float(...normalOffset[2])) * random.float(...speed) + random.float(...speedOffset[2]),
        )

        return {
            id: random.id(),
            instance,
            mounted: false,
            index: instance.index.next(),
            position: new Vector3(...position.map((i, index) => i + random.float(...positionOffset[index]))),
            acceleration: new Vector3(...gravity),
            rotation: new Vector3(
                random.float(0, Math.PI * 2),
                random.float(0, Math.PI * 2),
                random.float(0, Math.PI * 2)
            ),
            velocity,
            restitution: random.float(...restitution),
            friction: typeof friction == "number" ? friction : random.float(...friction),
            radius: typeof radius === "number" ? radius : radius[0] + (radius[1] - radius[0]) * (index / (list.length - 1)),
            color,
            lifetime: 0,
            maxLifetime: velocity.length() * 10,
        }
    })

    store.setState({
        particles: [
            ...store.getState().particles,
            ...particles,
        ]
    })
}

export function removeParticle(id: string | string[]) {
    store.setState({
        particles: store.getState().particles.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}

export function removePlane(id: string) {
    let { planes, world } = store.getState()
    let plane = planes.find(i => i.id === id)

    if (plane) {
        store.setState({
            planes: planes.filter(i => i.id !== id)
        })
        world.grid.remove(plane.client)
    }
}

export function removeBullet(...ids: string[]) {
    store.setState({
        bullets: store.getState().bullets.filter(i => !ids.includes(i.id))
    })
}

export function damageTurret(id: string, damage: number) {
    let turret = store.getState().turrets.find(i => i.id === id) as Turret
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
        turrets: [
            ...store.getState().turrets.filter(i => i.id !== id),
            {
                ...turret,
                health: Math.max(turret.health - damage, 0)
            }
        ]
    })

}

export function setLastImpactLocation(x, y, z) {

    store.setState({
        player: {
            ...store.getState().player,
            lastImpactLocation: [x, y, z]
        },
    })

}

export function damageRocket(id: string, damage: number) {
    let rocket = store.getState().rockets.find(i => i.id === id) as Plane
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
        rockets: [
            ...store.getState().rockets.filter(i => i.id !== id),
            {
                ...rocket,
                health,
            }
        ]
    })

}

export function damagePlane(id: string, damage: number) {
    let plane = store.getState().planes.find(i => i.id === id) as Plane
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
        planes: [
            ...store.getState().planes.filter(i => i.id !== id),
            {
                ...plane,
                health,
            }
        ]
    })

}

export function removeTurret(id: string) {
    let { turrets, world } = store.getState()
    let turret = turrets.find(i => i.id === id)

    if (turret) {
        store.setState({
            turrets: turrets.filter(i => i.id !== id)
        })
        world.grid.remove(turret.client)
    }
}

export function removeBuilding(id: string) {
    let { world, buildings } = store.getState()
    let building = buildings.find(i => i.id === id)

    if (building) {
        store.setState({
            buildings: buildings.filter(i => i.id !== id)
        })
        world.grid.remove(building.client)
    }
}

export function removeWorldPart(id: string) {
    let { world } = store.getState()

    store.setState({
        world: {
            ...world,
            parts: world.parts.filter(i => i.id !== id),
        }
    })
}

export { store, useStore }