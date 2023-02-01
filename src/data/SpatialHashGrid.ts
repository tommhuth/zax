import { Vector3 } from "three"
import { Tuple2, Tuple3 } from "../types"

export interface ClientData {
    position: Vector3
    size: Tuple3
    type: string
    id: string
} 

export interface Client {
    position: Tuple2
    dimensions: Tuple2
    queryId: number
    data: ClientData
    cells: {
        min: Tuple2
        max: Tuple2
        nodes: Head[][]
    }
}

export interface Head {
    prev: null | Head
    next: null | Head
    client: Client
}

function clamp(x: number) {
    return Math.min(Math.max(x, 0), 1)
}

// https://github.com/simondevyoutube/Tutorial_SpatialHashGrid_Optimized/tree/main/src
export default class SpatialHashGrid {
    private queryIds = 0
    private bounds: [min: Tuple2, max: Tuple2]
    private dimensions: Tuple2
    private cells: (null | Head)[][]

    constructor(bounds: [min: Tuple2, max: Tuple2], dimensions: Tuple2) {
        const [x, y] = dimensions

        this.cells = [...Array(x)].map(() => [...Array(y)].map(() => (null)))
        this.dimensions = dimensions
        this.bounds = bounds
        this.queryIds = 0
    }

    private getCellIndex(position: Tuple2) {
        const x = clamp(
            (position[0] - this.bounds[0][0]) / (this.bounds[1][0] - this.bounds[0][0])
        )
        const y = clamp(
            (position[1] - this.bounds[0][1]) / (this.bounds[1][1] - this.bounds[0][1])
        )

        const xIndex = Math.floor(x * (this.dimensions[0] - 1))
        const yIndex = Math.floor(y * (this.dimensions[1] - 1))

        return [xIndex, yIndex] as Tuple2
    }

    private insert(client: Client) {
        const [x, y] = client.position
        const [w, h] = client.dimensions

        const i1 = this.getCellIndex([x - w / 2, y - h / 2])
        const i2 = this.getCellIndex([x + w / 2, y + h / 2])

        const nodes: Head[][] = []

        for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
            nodes.push([])

            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const xi = x - i1[0]

                const head: Head = {
                    next: null,
                    prev: null,
                    client,
                }

                nodes[xi].push(head)

                head.next = this.cells[x][y]

                if (this.cells[x][y]) {
                    (this.cells[x][y] as Head).prev = head
                }

                this.cells[x][y] = head
            }
        }

        client.cells.min = i1
        client.cells.max = i2
        client.cells.nodes = nodes
    }

    newClient(position: Tuple2, dimensions: Tuple2, data?: ClientData) {
        const client = {
            position,
            dimensions,
            data: data || {},
            cells: {
                min: [0, 0] as Tuple2,
                max: [0, 0] as Tuple2,
                nodes: [],
            },
            queryId: -1,
        }

        this.insert(client as unknown as Client)

        return client as unknown as Client
    }

    updateClient(client: Client) {
        const [x, y] = client.position
        const [w, h] = client.dimensions

        const i1 = this.getCellIndex([x - w / 2, y - h / 2])
        const i2 = this.getCellIndex([x + w / 2, y + h / 2])

        if (
            client.cells.min[0] == i1[0] &&
            client.cells.min[1] == i1[1] &&
            client.cells.max[0] == i2[0] &&
            client.cells.max[1] == i2[1]
        ) {
            return
        }

        this.remove(client)
        this.insert(client)
    }

    findNear(position: Tuple2, bounds: Tuple2) {
        const [x, y] = position
        const [w, h] = bounds

        const i1 = this.getCellIndex([x - w / 2, y - h / 2])
        const i2 = this.getCellIndex([x + w / 2, y + h / 2])

        const clients: Client[] = []
        const queryId = this.queryIds++

        for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                let head = this.cells[x][y]

                while (head) {
                    const v = head.client

                    head = head.next

                    if (v.queryId != queryId) {
                        v.queryId = queryId
                        clients.push(v)
                    }
                }
            }
        }

        return clients
    }

    remove(client: Client) {
        const i1 = client.cells.min
        const i2 = client.cells.max

        // tweak this
        if (client.cells.nodes[0]) {
            for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
                for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                    const xi = x - i1[0]
                    const yi = y - i1[1]
                    const node = client.cells.nodes[xi][yi]

                    if (node.next) {
                        node.next.prev = node.prev
                    }

                    if (node.prev) {
                        node.prev.next = node.next
                    }

                    if (!node.prev) {
                        this.cells[x][y] = node.next
                    }
                }
            }
        }

        client.cells.min = [0, 0]
        client.cells.max = [0, 0]
        client.cells.nodes = []
    }
}