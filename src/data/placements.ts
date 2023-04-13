import random from "@huth/random"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../components/world/World"
import { Tuple3 } from "../types"
import makeCycler from "./cycler"

interface PlaceableObject {
    position: Tuple3
}

interface PlacementBuilding extends PlaceableObject {
    size: Tuple3
}

interface PlacementRocket extends PlaceableObject {
    health?: number
}

interface PlacementTurret extends PlaceableObject {
    fireFrequency?: number
}

type PlacementBarrel = PlaceableObject

interface Placement {
    buildings: PlacementBuilding[]
    turrets: PlacementTurret[]
    rockets: PlacementRocket[]
    barrels: PlacementBarrel[]
}

const placements: Placement[] = [
    {
        buildings: [
            {
                position: [WORLD_CENTER_X, 0, 2],
                size: [3, 1, 3]
            }
        ],
        turrets: [
            {
                position: [WORLD_CENTER_X + 3, 0, 4], 
            },
            {
                position: [WORLD_CENTER_X + 3, 0, -4], 
            }
        ],
        rockets: [ 
            {
                position: [WORLD_CENTER_X, -2, 6], 
            }
        ],
        barrels: [
            {
                position: [WORLD_CENTER_X + 3, 0, 0],
            },
            {
                position: [WORLD_LEFT_EDGE, 0, -4],
            },
            {
                position: [WORLD_LEFT_EDGE + 3, 0, -4],
            }
        ]
    },
    {
        buildings: [
            {
                position: [WORLD_CENTER_X, 0, 1],
                size: [3, 1, 3]
            },
            {
                position: [WORLD_CENTER_X, 0, -3],
                size: [3, 2, 3]
            },
            {
                position: [WORLD_CENTER_X + 4, 0, -4],
                size: [3, 1, 5]
            }
        ],
        rockets: [ 
            {
                position: [WORLD_RIGHT_EDGE, -2, 4], 
            }
        ],
        turrets: [
            {
                position: [WORLD_CENTER_X, 0, 5.5], 
            },
        ],
        barrels: [
            {
                position: [WORLD_RIGHT_EDGE, 0, 0],
            },
            {
                position: [WORLD_LEFT_EDGE, 0, -4],
            }, 
        ]
    },
    {
        buildings: [
            {
                position: [WORLD_CENTER_X + 2, 0, 5],
                size: [5, 1, 4]
            },
        ],
        turrets: [
            {
                position: [WORLD_CENTER_X + 2, 1, 5], 
            },
        ],
        rockets: [ 
            {
                position: [2, -2, 1], 
            }
        ],
        barrels: [
            {
                position: [WORLD_CENTER_X - 1, 0, -5],
            },
            {
                position: [WORLD_CENTER_X + 4, 0, -1],
            },
        ]
    }
]

function toWorldSpace<T extends PlaceableObject>(object: T, origin: Tuple3, direction = 1) {
    return {
        ...object,
        position: [object.position[0], object.position[1], object.position[2] * direction + origin[2]],
        id: random.id(),
    }
}

let placementCycler = makeCycler(placements)

export function getRandomPlacement(origin: Tuple3 = [0, 0, 0]) {
    let placement = placementCycler.next()
    let direction = random.pick(-1, 1) 

    return {
        buildings: placement.buildings.map(obj => toWorldSpace<typeof obj>(obj, origin, direction)),
        barrels: placement.barrels.map(obj => toWorldSpace<typeof obj>(obj, origin, direction)),
        turrets: placement.turrets.map(obj => toWorldSpace<typeof obj>(obj, origin, direction)),
        rockets: placement.rockets.map(obj => toWorldSpace<typeof obj>(obj, origin, direction)),
    }
}