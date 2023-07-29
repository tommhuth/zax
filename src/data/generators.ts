import random from "@huth/random"
import { Vector3 } from "three" 
import { Tuple2 } from "../types"
import makeCycler from "./cycler" 
import { WorldPart, WorldPartDefault, WorldPartBuildingsLow, WorldPartBuildingsGap, WorldPartType } from "./types"

export type BaseWorldPart = { size: Tuple2, position: Vector3 }

export function makeBuildingsGap(previous: BaseWorldPart): WorldPartBuildingsGap {
    let depth = 10
    let width = 10
    let startZ = previous.position.z - depth  

    return {
        id: random.id(),
        size: [width, depth] as Tuple2,
        position: new Vector3(0, 0, startZ),
        color: Math.random() * 0xffffff,
        type: WorldPartType.BUILDINGS_GAP, 
    }
}

export function makeDefault(previous: BaseWorldPart): WorldPartDefault {
    let depth = 20
    let startZ = previous.position.z - depth 

    return {  
        id: random.id(),
        size: [10, depth] as Tuple2,
        position: new Vector3(0, 0, startZ),
        color: Math.random() * 0xffffff,
        type: WorldPartType.DEFAULT,
    }
}

export function makeBuildingsLow(previous: BaseWorldPart): WorldPartBuildingsLow {
    let depth = 20
    let startZ = previous.position.z - depth 

    return {  
        id: random.id(),
        size: [10, depth] as Tuple2,
        position: new Vector3(0, 0, startZ),
        color: Math.random() * 0xffffff,
        type: WorldPartType.BUILDINGS_LOW,
    }
}

const types = makeCycler(Object.values(WorldPartType))

export function getNextWorldPart(previous: WorldPart): WorldPart {
    let type = types.next()
    let generators: Record<WorldPartType, (prev: WorldPart) => WorldPart> = {
        [WorldPartType.DEFAULT]: makeDefault,
        [WorldPartType.BUILDINGS_GAP]: makeBuildingsGap,
        [WorldPartType.BUILDINGS_LOW]: makeBuildingsLow,
    }

    return generators[type](previous)
}
 