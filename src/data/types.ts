import { Box3, InstancedMesh, Object3D, Vector3 } from "three"
import { OBB } from "three/examples/jsm/math/OBB"
import { Tuple2, Tuple3 } from "../types"
import Counter from "./Counter"
import { Client } from "./SpatialHashGrid"

export interface Instance {
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

export interface Barrel {
    id: string
    position: Vector3
    size: Tuple3
    client: Client
    aabb: Box3
    obb: OBB
    index: number
    rotation: number
    health: number
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

export enum WorldPartType {
    DEFAULT = "default",
    BUILDINGS_GAP = "gapbuildings",
    BUILDINGS_LOW = "lowbuildings"
}

export interface WorldPart {
    id: string
    size: Tuple2
    position: Vector3
    color: number
    type: WorldPartType
}

export interface SpawnedBuilding {
    position: Tuple3
    size: Tuple3
    id: string
}

export interface SpawnedPlane {
    position: Tuple3
    id: string
    speed: number
    fireFrequency: number
}

export interface SpawnedTurret {
    position: Tuple3
    id: string
}

export interface SpawnedBarrel {
    position: Tuple3
    id: string
}

export interface WorldPartBuildingsGap extends WorldPart {
    buildings: SpawnedBuilding[]
    planes: SpawnedPlane[]
    type: WorldPartType.BUILDINGS_GAP
}

export interface WorldPartDefault extends WorldPart {
    turrets: SpawnedTurret[]
    barrels: SpawnedBarrel[]
    planes: SpawnedPlane[]
    type: WorldPartType.DEFAULT
}

export interface WorldPartBuildingsLow extends WorldPart {
    turrets: SpawnedTurret[]
    barrels: SpawnedBarrel[]
    buildings: SpawnedBuilding[]
    planes: SpawnedPlane[]
    type: WorldPartType.BUILDINGS_LOW
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
    lifetime: number
    maxLifetime: number
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