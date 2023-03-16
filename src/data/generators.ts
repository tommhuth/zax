import random from "@huth/random"
import { Vector3 } from "three"
import { WORLD_TOP_EDGE } from "../components/world/World"
import { Tuple2, Tuple3 } from "../types"
import makeCycler from "./cycler"
import PlacementGrid from "./PlacementGrid"
import { WorldPart, WorldPartDefault, WorldPartBuildingsLow, WorldPartBuildingsGap, WorldPartType } from "./types"

export type BaseWorldPart = { size: Tuple2, position: Vector3 }


export function makeBuildingsGap(previous: BaseWorldPart): WorldPartBuildingsGap {
    let depth = 10
    let width = 10
    let startZ = previous.position.z - depth
    let thirdHeight = random.integer(2, 3)

    return {
        id: random.id(),
        size: [width, depth] as Tuple2,
        position: new Vector3(0, 0, startZ),
        color: Math.random() * 0xffffff,
        type: WorldPartType.BUILDINGS_GAP,
        planes: new Array(random.integer(1, 2)).fill(null).map((i, index, list) => {
            return {
                id: random.id(),
                position: [
                    index * 3 - list.length * 3 * .5 + 3 * .5,
                    WORLD_TOP_EDGE,
                    startZ - index * 4 - random.integer(-2, -4)
                ]
            }
        }),
        buildings: [
            ...new Array(2).fill(null).map((i, index) => {
                let height = random.pick(4.5, 6)
                let width = 15
                let buildingPosition = [
                    (width / 2 + 4) * (index === 1 ? 1 : -1),
                    height / 2,
                    startZ + depth / 2 + random.pick(-2, 2)
                ]

                return {
                    id: random.id(),
                    position: buildingPosition as Tuple3,
                    size: [
                        width,
                        height,
                        random.integer(4, 5.5)
                    ] as Tuple3
                }
            }),
            {
                id: random.id(),
                position: [
                    (width / 2 + 4) * random.pick(-1, 1),
                    thirdHeight / 2,
                    startZ + width * .5
                ],
                size: [
                    random.integer(5, 7),
                    thirdHeight,
                    width
                ] as Tuple3
            }
        ],
    }
}

export function makeDefault(previous: BaseWorldPart): WorldPartDefault {
    let depth = 20
    let startZ = previous.position.z - depth
    let grid = new PlacementGrid<null>([3, 4], [0, 0, startZ], depth)

    return {
        turrets: new Array(2).fill(null).map(() => {
            let [position] = grid.add([1, 1], null)

            return {
                id: random.id(),
                position,
            }
        }),
        barrels: new Array(2).fill(null).map(() => {
            let [position] = grid.add([1, 1], null)

            return {
                id: random.id(),
                position,
            }
        }),
        planes: new Array(3).fill(null).map((i, index, list) => {
            return {
                id: random.id(),
                position: [
                    index * 3 - list.length * 3 * .5 + 3 * .5,
                    WORLD_TOP_EDGE,
                    startZ - index * 4 - random.integer(-2, -4)
                ]
            }
        }),
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
    let grid = new PlacementGrid<null>([3, 4], [0, 0, startZ], depth)

    return {
        turrets: new Array(1).fill(null).map(() => {
            let [position] = grid.add([1, 1], null)

            return {
                id: random.id(),
                position,
            }
        }),
        buildings: [[1, 2], [1, 1], [2, 1]].map(i => {
            let [position, size] = grid.add(i as Tuple2, null)

            return {
                id: random.id(),
                position,
                size: [size[0], 4, size[1]]
            }
        }),
        barrels: new Array(1).fill(null).map(() => {
            let [position] = grid.add([1, 1], null)

            return {
                id: random.id(),
                position,
            }
        }),
        planes: [],
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