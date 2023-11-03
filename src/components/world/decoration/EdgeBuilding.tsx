import { useEffect, useRef } from "react"
import { useRepeater } from "../../RepeaterMesh"
import { WORLD_LEFT_EDGE } from "../World"
import random from "@huth/random"
import { RepeaterName } from "../../../data/types"

interface EdgeBuildingProps {
    x?: number
    y?: number
    z?: number
    type?: RepeaterName
}

export default function EdgeBuilding({
    x = 0,
    z = 0,
    y = 0,
    type = random.pick("building1", "building2", "building3")
}: EdgeBuildingProps) {
    let building = useRepeater(type) 

    useEffect(() => {
        if (building?.mesh) { 
            building.mesh.position.set(x + WORLD_LEFT_EDGE - 5.5, y, z)
        }
    }, [building])

    return null
}