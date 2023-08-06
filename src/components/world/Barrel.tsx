import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import { Vector3 } from "three"
import { createExplosion, createParticles, createShimmer, damageBarrel, damageTurret, removeBarrel, removeByProximity, store, useStore } from "../../data/store"
import { Barrel } from "../../data/types"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { useInstance } from "../InstancedMesh"
import random from "@huth/random"
import Config from "../../Config"

let _size = new Vector3()

export default function Barrel({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    health,
}: Barrel) {
    let removed = useRef(false)
    let model = useMemo(() => random.pick("barrel1", "barrel2", "barrel3", "barrel4"), [])
    let [index, instance] = useInstance(model)
    let [rotation] = useState(random.pick(...new Array(8 * 2).fill(null).map((i, index, list) => (index / list.length) * Math.PI * 2)))
    let remove = () => {
        setTimeout(() => removeBarrel(id), 300)
        removed.current = true
    }
    let color = "#ff0051"

    useEffect(() => {
        if (instance && typeof index === "number") {
            setColorAt(instance, index, color)
        }
    }, [index, instance])

    useEffect(() => {
        if (health === 0) {
            remove()
            createShimmer({ 
                position: [
                    position.x,
                    position.y + size[1]/2,
                    position.z,
                ], 
                size: [4,5,4] 
            })
            createExplosion({
                position: [position.x, 0, position.z],
                count: 10,
                radius: .65,
                fireballPath: [[position.x, 1, position.z], [0, 4, 0]],
                fireballCount: random.pick(0, 5),
            })
            createParticles({
                position: [position.x, 1, position.z],
                speed: [12, 20],
                speedOffset: [[-10, 10], [0, 5], [-10, 10]],
                positionOffset: [[-1, 1], [0, 1], [-1, 1]],
                normal: [0, 1, 0],
                count: [4, 8],
                radius: [.1, .4],
                color,
            })

            removeByProximity({ id, position }, 4)
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
                position: [position.x, position.y - size[1] / 2, position.z],
                rotation: [0, rotation, 0]
            })

            aabb.setFromCenterAndSize(position, _size.set(...size))

            if (!world.frustum.intersectsBox(aabb) && player.object && position.z > player.object.position.z) {
                remove()
            }
        }
    })

    if (!Config.DEBUG) {
        return null
    }


    return (
        <mesh position={position.toArray()}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" />
        </mesh>
    )
}