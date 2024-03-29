import { Frustum, Object3D, Vector3 } from "three"
import create from "zustand"
import { Tuple3 } from "../types"
import { 
    Barrel, Building, Bullet, Explosion, Instance, Particle, 
    Plane, RepeaterMesh, Rocket, Shimmer, Turret, WorldPart 
} from "./types"
import { makeDefault } from "./generators"
import { SpatialHashGrid3D } from "./SpatialHashGrid3D"

export let isSmallScreen = window.matchMedia("(max-height: 400px)").matches || window.matchMedia("(max-width: 800px)").matches
export const pixelSize = isSmallScreen ? 4 : 5
export const dpr = 1 / pixelSize
export const bulletSize: Tuple3 = [.2, .2, 1.5]

export interface Store {
    world: {
        parts: WorldPart[]
        frustum: Frustum
        grid: SpatialHashGrid3D
        bullets: Bullet[]
        turrets: Turret[]
        barrels: Barrel[]
        rockets: Rocket[]
        planes: Plane[]
        buildings: Building[]
    }
    effects: {
        particles: Particle[]
        shimmer: Shimmer[]
        explosions: Explosion[]
    }
    instances: Record<string, Instance>
    repeaters: Record<string, RepeaterMesh>
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

const store = create<Store>(() => ({
    world: {
        grid: new SpatialHashGrid3D([4, 3, 4]),
        frustum: new Frustum(),
        parts: [
            makeDefault({ position: new Vector3(0, 0, 20), size: [10, 20] }),
        ],
        buildings: [],
        planes: [],
        turrets: [],
        barrels: [],
        bullets: [],
        rockets: [],
    },
    effects: {
        explosions: [],
        particles: [],
        shimmer: [],
    },
    instances: {},
    repeaters: {},
    player: {
        speed: 0,
        cameraShake: 0,
        health: 100,
        score: 0,
        object: null, 
        lastImpactLocation: [0, -10, 0],
        weapon: {
            fireFrequency: 150,
            damage: 35,
            color: "yellow",
            speed: 40,
            bulletSize: [.125, .125, 1.25]
        }, 
    }
}))
const useStore = store

export { store, useStore }