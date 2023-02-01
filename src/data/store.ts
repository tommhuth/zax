import { Box3, Group, InstancedMesh, Object3D, Vector2, Vector3 } from "three"
import create from "zustand"
import random from "@huth/random"
import SpatialHashGrid, { Client } from "./SpatialHashGrid"
import { Tuple2, Tuple3 } from "../types"
import { OBB } from "three/examples/jsm/math/OBB"
import { Weapon, weapons } from "./weapons"

export default class Counter {
    public current = 0
    private max = 0

    constructor(max: number) {
        this.max = max
    }

    reset() {
        this.current = 0
    }

    next() {
        this.current = (this.current + 1) % this.max

        return this.current
    }
}

interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: Counter;
}


export interface Building {
    id: string
    size: Tuple3
    position: Vector3
    client: Client
    color: number
    aabb: Box3
}

export interface Turret {
    id: string
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    health: number
    fireFrequency: number
}

export interface Plane {
    id: string
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    health: number
    fireFrequency: number
    speed: number
}

export interface WorldPart {
    id: string
    size: Tuple2
    position: Vector3
    color: number
}


export enum Owner {
    PLAYER = "player",
    ENEMY = "enemy",
}

export interface Bullet {
    id: string
    position: Vector3
    speed: Tuple3
    index: number
    rotation: number
    mounted: boolean
    size: Tuple3
    obb: OBB
    aabb: Box3
    color: string
    damage: number
    owner: Owner
}

export interface Particle {
    velocity: Vector3
    position: Vector3
    acceleration: Vector3
    friction: number
    mounted: boolean
    restitution: number
    instance: Instance
    radius: number
    rotation: number
    index: number
    color: string
    id: string
}

export interface RepeaterMesh {
    meshes: Object3D[]
    index: Counter
}

export interface Message {
    text: string
    lifetime: number
    id: string
}

interface Store {
    world: {
        parts: WorldPart[]
        grid: SpatialHashGrid
    }
    messages: Message[]
    buildings: Building[]
    instances: Record<string, Instance>
    repeaters: Record<string, RepeaterMesh>
    bullets: Bullet[]
    turrets: Turret[]
    planes: Plane[]
    particles: Particle[]
    player: {
        speed: number
        unitsPerPixel: number
        cameraShake: number
        health: number
        score: number
        position: Vector3
        activeWeapon: Weapon
        weaponHeat: number
        object: Object3D | null
    }
}

const store = create<Store>(() => ({
    messages: [],
    world: {
        grid: new SpatialHashGrid([[-20, -30], [20, 30]], [4, 4]),
        parts: [
            {
                id: random.id(),
                size: [30, 20],
                position: new Vector3(0, 0, -20),
                color: Math.random() * 0xffffff,
            },
            {
                id: random.id(),
                size: [30, 20],
                position: new Vector3(0, 0, 0),
                color: Math.random() * 0xffffff,
            },
        ]
    },
    instances: {},
    repeaters: {},
    buildings: [],
    planes: [],
    turrets: [],
    bullets: [],
    particles: [],
    player: {
        speed: 0,
        unitsPerPixel: 1,
        cameraShake: 0,
        health: 100,
        score: 0,
        object: null,
        position: new Vector3(),
        activeWeapon: weapons[0],
        weaponHeat: 0
    }
}))
const useStore = store


export function setPlayerSpeed(speed: number, unitsPerPixel: number) {
    store.setState({
        player: {
            ...store.getState().player,
            speed,
            unitsPerPixel
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

export function setWeapon(weapon: Weapon) {
    store.setState({
        player: {
            ...store.getState().player,
            activeWeapon: weapon,
            weaponHeat: 0,
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

export function setWeaponHeat(weaponHeat: number) {
    store.setState({
        player: {
            ...store.getState().player,
            weaponHeat: Math.max(weaponHeat, 0),
        }
    })
}

export function damagePlayer(damage: number) {
    let player = store.getState().player

    store.setState({
        player: {
            ...player,
            health: Math.max(player.health - damage, -Infinity),
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
    fireFrequency = 450,
    [x = 0, y = 0, z = -10] = [],
) {
    let id = random.id()
    let size = [1, 2, 1] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { world, turrets } = store.getState()
    let client = world.grid.newClient(
        [position[0], position[2]],
        [size[0], size[2]],
        { type: "turret", id, size, position }
    )

    store.setState({
        turrets: [
            {
                position,
                fireFrequency,
                size,
                health: 100,
                id,
                aabb,
                client,
            },
            ...turrets,
        ]
    })
}

export function createPlane(
    [x, y, z] = [0, 0, -10],
    speed = 1,
    fireFrequency = 850,
) {
    let id = random.id()
    let size = [1, .5, 2] as Tuple3
    let position = new Vector3(x, y, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { world, planes } = store.getState()
    let client = world.grid.newClient(
        [position[0], position[2]],
        [size[0], size[2]],
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
    [x = 0, y = 0, z = -10] = [],
) {
    let id = random.id()
    let position = new Vector3(x, y, z)
    let box = new Box3().setFromCenterAndSize(position.clone(), new Vector3(...size))
    let { world, buildings } = store.getState()
    let client = world.grid.newClient(
        [position[0], position[2]],
        [size[0], size[2]],
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
}


export function createBullet({
    position = [0, 0, 0],
    rotation,
    owner,
    size = [.125, .125, 1.25],
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
                size: [size[0] * 1.5, size[1] * 1.5, size[2]],
                speed: speed as Tuple3,
                owner,
                rotation,
            },
            ...store.getState().bullets,
        ]
    })
}

interface CreateParticlesParams {
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
    offset = [[-.25, .25], [-.25, .25], [-.25, .25]],// additional  position offset
    normal = [0, 0, 1], // particle direction
    speed = [-1, 1], // main normal speed
    variance = [[0, 0], [0, 0], [0, 0]], // additional speed offset
    count = [1, 4],
    friction = [.9, .98],
    restitution = [.3, .75],
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
            acceleration: new Vector3(0, -1, 0),
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
    let plane = planes.find(i => i.id === id) as Plane

    store.setState({
        planes: planes.filter(i => i.id !== id)
    })
    world.grid.remove(plane.client)
}

export function removeBullet(...ids: string[]) {
    store.setState({
        bullets: store.getState().bullets.filter(i => !ids.includes(i.id))
    })
}

export function damageTurret(id: string, damage: number) {
    let turret = store.getState().turrets.find(i => i.id === id) as Turret

    if (!turret) {
        return
    }

    store.setState({
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

    if (!plane) {
        return
    }

    store.setState({
        planes: [
            ...store.getState().planes.filter(i => i.id !== id),
            {
                ...plane,
                health: Math.max(plane.health - damage, 0)
            }
        ]
    })

}

export function removeTurret(id: string) {
    let { turrets, world } = store.getState()
    let turret = turrets.find(i => i.id === id) as Turret

    store.setState({
        turrets: turrets.filter(i => i.id !== id)
    })
    world.grid.remove(turret.client)
}

export function removeBuilding(id: string) {
    let { world, buildings } = store.getState()
    let building = buildings.find(i => i.id === id) as Building

    store.setState({
        buildings: buildings.filter(i => i.id !== id)
    })
    world.grid.remove(building.client)
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

export function addWorldPart() {
    let world = store.getState().world
    let lastPart = world.parts[0]

    store.setState({
        world: {
            ...world,
            parts: [
                {
                    position: new Vector3(0, 0, lastPart.position.z - lastPart.size[1]),
                    id: random.id(),
                    size: [30, 20],
                    color: Math.random() * 0xffffff,
                },
                ...world.parts,
            ],
        }
    })
}

export { store, useStore }