import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { createParticles, removeBarrel, useStore } from "../../data/store"
import { Barrel } from "../../data/types"
import { useForwardMotion } from "../../utils/hooks"
import { setMatrixAt } from "../../utils/utils"
import { useInstance } from "../InstancedMesh"

export default function Barrel({
    position,
    client,
    size = [.25, 2, .25],
    id,
    health,
}: Barrel) {
    let removed = useRef(false)
    let grid = useStore(i => i.world.grid)
    let { viewport } = useThree()
    let [index, instance] = useInstance("cylinder")
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let remove = () => {
        removeBarrel(id)
        removed.current = true
    }

    useForwardMotion(position)

    useEffect(() => {
        if (health === 0) {
            remove()
            createParticles({
                position: [position.x, 1, position.z],
                speed: [10, 20],
                variance: [[-10, 10], [0, 5], [-10, 10]],
                offset: [[-1, 1], [0, 1], [-1, 1]],
                normal: [0, 1, 0],
                count: [4, 8],
                radius: [.1, .35],
                color: "red",
            })
        }
    }, [health])

    useEffect(() => {
        if (typeof index === "number" && instance) {
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