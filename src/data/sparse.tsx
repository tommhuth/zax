
export class SpatialHash3D {
    private cellSize: [number, number, number]
    private grid: Map<string, any[]>

    constructor(cellSize: [number, number, number]) {
        this.cellSize = cellSize
        this.grid = new Map()
    }
}