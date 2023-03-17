import random from "@huth/random"
import { Tuple2, Tuple3 } from "../types"

interface PlacementGridParams {
    size: Tuple2
    origin: Tuple3
    depth: number
    cellSize?: number
    gap?: number
}

export default class PlacementGrid {
    private size = [0, 0]
    private grid: boolean[][] = [[]]
    private origin: Tuple3
    private gap: number
    private cellSize: number
    private depth: number

    public get dimensions(): Tuple2 {
        return [
            this.size[0] * this.cellSize + (this.gap * this.size[0] - 1),
            this.size[1] * this.cellSize + (this.gap * this.size[1] - 1)
        ]
    }

    constructor({
        size,
        origin,
        depth,
        cellSize = 2,
        gap = .5
    }: PlacementGridParams) {
        this.size = size
        this.origin = origin
        this.gap = gap
        this.cellSize = cellSize
        this.depth = depth

        for (let x = 0; x < size[0]; x++) {
            this.grid[x] = []

            for (let y = 0; y < size[1]; y++) {
                this.grid[x][y] = false
            }
        }
    }

    private getBounds(position: Tuple2, size: Tuple2): [min: Tuple2, max: Tuple2] {
        let min = [Math.min(position[0], this.size[0] - size[0]), Math.min(position[1], this.size[1] - size[1])]
        let max = [min[0] + size[0], min[1] + size[1]]

        return [min as Tuple2, max as Tuple2]
    }

    private insert(position: Tuple2, size: Tuple2) {
        if (this.canFitAt(position, size)) {
            let [min, max] = this.getBounds(position, size)

            for (let x = min[0]; x < max[0]; x++) {
                for (let y = min[1]; y < max[1]; y++) {
                    this.grid[x][y] = true
                }
            }

            return this.resolveElement([...min] as Tuple2, size)
        } else {
            throw new Error(`Grid occupied at [${position[0]}, ${position[1]}]`)
        }
    }

    [Symbol.iterator]() {
        return this.grid.entries()
    }

    print() {
        let res: any[] = []

        for (let y = 0; y < this.size[1]; y++) {
            res.push(new Array(this.size[0]).fill(null).map((i, index) => this.grid[index][y]))
        }

        console.table(res)
    }

    resolveElement(gridPosition: Tuple2, size: Tuple2): [position: Tuple3, size: Tuple2] {
        let [totalWidth, totalHeight] = this.dimensions
        let elementSize = [
            size[0] * this.cellSize + (this.gap * (size[0] - 1)),
            size[1] * this.cellSize + (this.gap * (size[1] - 1)),
        ] as Tuple2

        return [
            [
                gridPosition[0] * this.cellSize + this.gap * gridPosition[0] - totalWidth / 2 + this.origin[0] + elementSize[0] / 2,
                this.origin[1],
                gridPosition[1] * this.cellSize + this.gap * gridPosition[1] + this.origin[2] + this.cellSize / 2 + (this.depth - totalHeight) / 2 + elementSize[1] / 2,
            ],
            elementSize
        ]
    }

    canFitAt(position: Tuple2, size: Tuple2) {
        let [min, max] = this.getBounds(position, size)

        if (size[0] > this.size[0] || size[1] > this.size[1]) {
            return false
        }

        for (let x = min[0]; x < max[0]; x++) {
            for (let y = min[1]; y < max[1]; y++) {
                if (this.grid[x][y]) {
                    return false
                }
            }
        }

        return true
    }

    canFit(size: Tuple2) {
        return this.getAllPotentialPositions(size).length > 0
    }

    add(position: Tuple2, size: Tuple2): ReturnType<typeof this.insert>
    add(size: Tuple2): ReturnType<typeof this.insert>
    add(...args): ReturnType<typeof this.insert> {
        if (args.length === 2) {
            let [position, size] = args as [position: Tuple2, size: Tuple2]

            return this.insert(position, size)
        } else {
            let [size] = args as [size: Tuple2]
            let position = random.pick(...this.getAllPotentialPositions(size))

            return this.insert(position, size)
        }
    }

    getAllPotentialPositions(size: Tuple2) {
        let result: Tuple2[] = []

        for (let x = 0; x < Math.min(this.size[0], this.size[0] - size[0] + 1); x++) {
            for (let y = 0; y < Math.min(this.size[1], this.size[1] - size[1] + 1); y++) {
                if (!this.grid[x][y] && this.canFitAt([x, y], size)) {
                    result.push([x, y])
                }
            }
        }

        return result
    }
}