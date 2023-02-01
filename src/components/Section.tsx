import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { removeWorldPart, WorldPart } from "../data/store"
import { useInstance } from "./InstancedMesh"
import { setColorAt, setMatrixAt } from "../utils/utils"
import { useRepeater } from "./RepeaterMesh"
import { WORLD_LEFT_EDGE } from "./World"
import random from "@huth/random"
import { useForwardMotion } from "../utils/hooks"

export default function Section({ id, color, position, size: [width, depth] }: WorldPart) {
    let { viewport } = useThree()
    let [index, instance] = useInstance("box")
    let building = useRepeater(random.pick("building1", "building2", "building3", "hangar")) 
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useForwardMotion(position)

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, color)
        }
    }, [index, instance, color]) 


    useFrame(() => {
        if (typeof index === "number" && building) {  
            building.mesh.position.set(WORLD_LEFT_EDGE - 1, 0, position.z)
            building.mesh.scale.set(.3, .3, .3)

            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: [width, .25, depth],
            })
        }
    })

    useFrame(() => {
        if (position.z - depth > diagonal * .75 && building) {
            removeWorldPart(id)
            building.release()
        }
    })

    return null
}