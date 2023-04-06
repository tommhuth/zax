import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Vector3 } from "three"
import { createExplosion, createParticles, removeBarrel, useStore } from "../../data/store"
import { Barrel } from "../../data/types"
import { setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { useInstance } from "../InstancedMesh"

let _size = new Vector3()

export default function Barrel({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    health,
}: Barrel) {
    let removed = useRef(false)
    let [index, instance] = useInstance("cylinder")
    let remove = () => {
        removeBarrel(id)
        removed.current = true
    }

    useEffect(() => {
        if (health === 0) {
            remove()
            createExplosion([position.x, 0, position.z])
            createParticles({
                position: [position.x, 1, position.z],
                speed: [10, 20],
                variance: [[-10, 10], [0, 5], [-10, 10]],
                offset: [[-1, 1], [0, 1], [-1, 1]],
                normal: [0, 1, 0],
                count: [4, 8],
                radius: [.1, .4],
                color: "red",
            })
        }
    }, [health])

    useEffect(() => {
        if (typeof index === "number" && instance) {
            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, instance])

    useFrame(() => {
        let { world, player } = useStore.getState()

        if (instance && typeof index === "number" && !removed.current) {
            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: size,
            })

            aabb.setFromCenterAndSize(position, _size.set(...size))

            if (!world.frustum.intersectsBox(aabb) && player.object && position.z > player.object.position.z) {
                remove()
            }
        }
    })

    return null
}