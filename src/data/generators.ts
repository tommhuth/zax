import random from "@huth/random"
import { Vector3 } from "three"
import { Tuple2, Tuple3 } from "../types"
import makeCycler from "./cycler"
import Grid from "./Grid"
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
        planes: [],
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
    let grid = new Grid<null>([3, 4], [0, 0, startZ], depth)

    return {
        turrets: new Array(2).fill(null).map(() => {
            let [position] = grid.add([1, 1], null)

            return {
                id: random.id(),
                position,
            }
        }),
        barrels: new Array(2).fill(null).map(i => {
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
        type: WorldPartType.DEFAULT,
    }
}

export function makeBuildingsLow(previous: BaseWorldPart): WorldPartBuildingsLow {
    let depth = 20
    let startZ = previous.position.z - depth
    let grid = new Grid<null>([3, 4], [0, 0, startZ], depth)

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
        barrels: new Array(1).fill(null).map(i => {
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














interface Client<T = any> {
    position: Tuple3
    size: Tuple3
    data: T
    min: Tuple3
    max: Tuple3
}

export class SpatialHashGrid3D<T = any> {
    private grid = new Map<string, Client<T>[]>()
    private cellSize: [number, number, number]

    constructor(cellSize: [number, number, number]) {
        this.cellSize = cellSize
    }

    private getCellIndex(x: number, y: number, z: number): Tuple3 {
        return [
            Math.floor(x / this.cellSize[0]),
            Math.floor(y / this.cellSize[1]),
            Math.floor(z / this.cellSize[2])
        ]
    }

    private getCellBounds(position: Tuple3, size: Tuple3): [min: Tuple3, max: Tuple3] {
        return [
            this.getCellIndex(position[0] - size[0] / 2, position[1] - size[1] / 2, position[2] - size[2] / 2),
            this.getCellIndex(position[0] + size[0] / 2, position[1] + size[1] / 2, position[2] + size[2] / 2),
        ]
    }

    private getHashKey(ix: number, iy: number, iz: number): string {
        return `${ix},${iy},${iz}`
    }

    private insert(client: Client<T>) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        client.min = min
        client.max = max

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        cell.push(client)
                    } else {
                        this.grid.set(key, [client])
                    }
                }
            }
        }
    }

    public findNear(position: Tuple3, size: Tuple3) {
        let [min, max] = this.getCellBounds(position, size)
        let result: Client<T>[] = []

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        result.push(...cell)
                    }
                }
            }
        }

        return result
    }

    public makeClient(position: Tuple3, size: Tuple3, data: T) {
        let client = {
            position,
            size,
            data,
            min: [0, 0, 0] as Tuple3,
            max: [0, 0, 0] as Tuple3,
        }

        this.insert(client)

        return client
    }

    public remove(client: Client<T>) {
        for (let x = client.min[0]; x <= client.max[0]; x++) {
            for (let y = client.min[1]; y <= client.max[1]; y++) {
                for (let z = client.min[2]; z <= client.max[2]; z++) {
                    let key = this.getHashKey(x, y, z)
                    let cell = this.grid.get(key)

                    if (cell) {
                        let cellUpdated = cell.filter(i => i !== client)

                        cellUpdated.length === 0 ? this.grid.delete(key) : this.grid.set(key, cellUpdated)
                    }
                }
            }
        }
    }

    public update(client: Client<T>) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        if (
            client.max[0] !== max[0]
            || client.max[1] !== max[1]
            || client.max[2] !== max[2]
            || client.min[0] !== min[0]
            || client.min[1] !== min[1]
            || client.min[2] !== min[2]
        ) {
            this.remove(client)
            this.insert(client)
        }
    }
}

let g = new SpatialHashGrid3D([5, 3, 5])

g.makeClient([2, 1, 2], [1, 1, 1], { id: 1 })

let c2 = g.makeClient([0, 0, 0], [1, 1, 1], { id: 2 })

console.log(g)

c2.position = [2, 1, 2]

g.update(c2)

console.log(g)
// g.getClient([1,0,0], [2,1,2], {id: 2})


console.log(g.findNear([2, 0, 2], [1, 2, 1]))