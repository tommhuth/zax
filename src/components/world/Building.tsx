import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { removeBuilding, useStore } from "../../data/store"
import { useInstance } from "../InstancedMesh"
import { setColorAt, setMatrixAt } from "../../utils/utils"
import { useForwardMotion } from "../../utils/hooks"
import { Building } from "../../data/types"

export default function Building({ id, size, position, client }: Building) {
    let removed = useRef(false)
    let grid = useStore(i => i.world.grid)
    let { viewport } = useThree()
    let [index, instance] = useInstance("box") 
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let remove = () => { 
        removeBuilding(id) 
        removed.current = true
    }

    useForwardMotion(position)

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "gray")

            return () => {
                setMatrixAt({
                    instance,
                    index: index as number,
                    position: [0, 0, -1000],
                    scale: [0, 0, 0]
                })
            }
        }
    }, [index, instance])


    useFrame(() => {
        if (instance && typeof index === "number" && !removed.current) {  
            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: size,
            })

            if (position.z > diagonal * .75) {
                remove()
            } else {
                client.position = [position.x, position.z]
                grid.updateClient(client)
            } 
        }
    })

    return null
}