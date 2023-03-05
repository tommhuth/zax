import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { useRepeater } from "../../RepeaterMesh"
import { WORLD_LEFT_EDGE } from "../World"
import random from "@huth/random"
import { useForwardMotion } from "../../../utils/hooks"
import { Vector3 } from "three"

export default function EdgeBuilding({ x = 0, z = 0, y = 0, type = random.pick("building1", "building2", "building3", "hangar") }) {
    let building = useRepeater(type)
    let position = useMemo(() => new Vector3(z, y, z), [x, y, z])

    useForwardMotion(position)

    useEffect(() => {
        if (building) {
            building.mesh.scale.set(.3, .3, .3)
        }
    }, [building])

    useEffect(() => {
        return () => { 
            building?.release()
        }
    }, [])

    useFrame(() => {
        if (building) {
            building.mesh.position.set(WORLD_LEFT_EDGE - 1, 0, position.z)
        }
    })

    return null
}