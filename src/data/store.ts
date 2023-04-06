import { Box3, Frustum, InstancedMesh, Matrix3, Object3D, Vector3 } from "three"
import create from "zustand"
import random from "@huth/random"
import { Tuple2, Tuple3 } from "../types"
import { OBB } from "three/examples/jsm/math/OBB"
import Counter from "./Counter"
import { Barrel, Building, Bullet, Instance, Particle, Plane, RepeaterMesh, Turret, WorldPart } from "./types"
import { getNextWorldPart, makeDefault } from "./generators"
import { SpatialHashGrid3D } from "./SpatialHashGrid3D"

export let isSmallScreen = window.matchMedia("(max-height: 400px)").matches || window.matchMedia("(max-width: 800px)").matches
let frc = isSmallScreen ? 4 : 7

export const dpr = 1 / frc

export const bulletSize: Tuple3 = [.2, .2, 1.5]

interface Fireball {
    isPrimary?: boolean
    position: Tuple3
    index: number
    startRadius: number
    maxRadius: number
    lifetime: number
    time: number
    id: string
}

interface Explosion {
    position: Tuple3
    id: string
    fireballs: Fireball[]
}

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
    planes: Plane[]
    particles: Particle[]
    explosions: Explosion[],
    player: {
        speed: number
        cameraShake: number
        health: number
        score: number
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

let c = new Counter(100)

export function removeExplosion(id: string) {
    store.setState({
        explosions: store.getState().explosions.filter(i => i.id !== id)
    })
}

export function createExplosion(position: Tuple3, count = 12, radius = .75) {
    let baseLifetime = random.integer(90, 120)

    radius += random.float(-.1, .1)

    store.setState({
        explosions: [
            {
                position,
                id: random.id(),
                fireballs: [
                    {
                        id: random.id(),
                        index: c.next(),
                        position,
                        startRadius: radius * .33,
                        maxRadius: radius,
                        time: 0,
                        lifetime: baseLifetime
                    },
                    ...new Array(count).fill(null).map((i, index, list) => {
                        let startRadius = (index / list.length) * (radius * 1.5 - radius * .25) + radius * .25

                        return {
                            index: c.next(),
                            position: [
                                random.pick(-radius, radius) + position[0],
                                random.float(0, radius * 3) + position[1],
                                random.pick(-radius, radius) + position[2]
                            ] as Tuple3,
                            startRadius,
                            id: random.id(),
                            maxRadius: startRadius * 2.5,
                            time: random.integer(-10, 0),
                            lifetime: random.integer(baseLifetime * .25, baseLifetime * .65)
                        }
                    })
                ],
            },
            ...store.getState().explosions,
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
    planes: [],
    turrets: [],
    barrels: [],
    bullets: [],
    particles: [],
    player: {
        speed: 8,
        cameraShake: 0,
        health: 100,
        score: 0,
        object: null,
        position: new Vector3(),
        weapon: {
            fireFrequency: 200,
            damage: 35,
            color: "yellow",
            speed: 40,
            bulletSize: [.125, .125, 1.25]
        },
        weaponHeat: 0
    }
}))
const useStore = store

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
    fireFrequency = random.integer(1300, 2000),
    [x = 0, y = 0, z = -10] = [],
) {
    let id = random.id()
    let size = [1, 2, 1] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { world, turrets } = store.getState()
    let client = world.grid.newClient(
        position.toArray(),
        [...size],
        { type: "turret", id, size, position }
    )

    store.setState({
        turrets: [
            {
                position,
                fireFrequency,
                size,
                health: 70,
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
    size = [2, 1.75, 2],
    health = 25,
}: CreateBarrelParams) {
    let id = random.id()
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
    speed = [0, 0, 0],
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
                speed: speed as Tuple3,
                owner,
                rotation,
            },
            ...store.getState().bullets,
        ]
    })
}

interface CreateParticlesParams {
    gravity?: Tuple3
    position: Tuple3
    normal: Tuple3
    offset?: [x: Tuple2, y: Tuple2, z: Tuple2]
    speed?: Tuple2
    variance?: [x: Tuple2, y: Tuple2, z: Tuple2]
    count?: Tuple2
    restitution?: Tuple2
    friction?: Tuple2
    radius?: Tuple2
    color?: string
    name?: string
}

export function createParticles({
    name = "sphere",
    position = [0, 0, 0], // base position
    offset = [[-1, 1], [-1, 1], [-1, 1]],// additional  position offset
    normal = [0, 1, 0], // particle direction
    speed = [10, 20], // main normal speed
    variance = [[0, 0], [0, 0], [0, 0]], // additional speed 
    count = [2, 3],
    friction = [.9, .98],
    gravity = [0, -50, 0],
    restitution = [.3, .5],
    color = "#FFFFFF",
    radius = [.15, .25],
}: CreateParticlesParams) {
    let instance = store.getState().instances[name]
    let particles: Particle[] = new Array(random.integer(...count)).fill(null).map((i, index, list) => {
        return {
            id: random.id(),
            instance,
            mounted: false,
            index: instance.index.next(),
            position: new Vector3(...position.map((i, index) => i + random.float(...offset[index]))),
            acceleration: new Vector3(...gravity),
            velocity: new Vector3(
                normal[0] * random.float(...speed) + random.float(...variance[0]),
                normal[1] * random.float(...speed) + random.float(...variance[1]),
                normal[2] * random.float(...speed) + random.float(...variance[2]),
            ),
            rotation: random.float(0, Math.PI * 2),
            restitution: random.float(...restitution),
            friction: random.float(...friction),
            radius: radius[0] + (radius[1] - radius[0]) * (index / (list.length - 1)),
            color,
            lifetime: 0,
            maxLifetime: 90,
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