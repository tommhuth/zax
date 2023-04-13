import { useEffect, useLayoutEffect, useRef } from "react"
import { Rocket } from "../../data/types"
import { useInstance } from "../InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { ndelta, setColorAt, setMatrixAt } from "../../utils/utils"
import { createExplosion, createParticles, increaseScore, removeRocket, useStore } from "../../data/store"
import { Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../types"
import { WORLD_TOP_EDGE } from "./World"

let _size = new Vector3()

export default function Rocket({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    client,
    speed,
    health,
}: Rocket) {
    let grid = useStore(i => i.world.grid)
    let removed = useRef(false)
    let dead = useRef(false)
    let gravity = useRef(0)
    let actualSpeed = useRef(speed)
    let rotation = useRef([0, 0, 0])
    let triggerZ = useRef(random.integer(18, 24))
    let [index, instance] = useInstance("cylinder")
    let remove = () => {
        removed.current = true
        removeRocket(id)
    }

    useLayoutEffect(() => {
        if (instance && typeof index === "number") {
            setColorAt(instance, index, "purple")
        }
    }, [index, instance])

    useEffect(() => {
        if (health === 0) {
            dead.current = true
            increaseScore(500)
            createExplosion({
                position: [position.x, position.y - 1, position.z],
                count: 10,
                radius: .4,
                fireballCount: 6,
                fireballPath: [[position.x, position.y - 2, position.z], [0, 4, 0]]
            })
            createParticles({
                position: position.toArray(),
                speed: [12, 16],
                variance: [[-5, 5], [0, 10], [-15, 5]],
                offset: [[-.5, .5], [-.5, .5], [-.5, .5]],
                normal: [0, -1, 0],
                count: [4, 8],
                radius: [.1, .45],
                color: "purple",
            })
        }
    }, [health])


    useFrame((state, delta) => {
        let { player } = useStore.getState()

        if (instance && typeof index === "number" && !removed.current && player.object) {
            if (health > 0) {
                if (Math.abs(position.z - player.object.position.z) < triggerZ.current) {
                    position.y += actualSpeed.current * ndelta(delta)

                    if (position.y > WORLD_TOP_EDGE - 1) {
                        actualSpeed.current += 5 * ndelta(delta)
                    }
                }
            } else {
                gravity.current += 14 * ndelta(delta)
                rotation.current[0] += 1 * ndelta(delta)
                rotation.current[2] -= 1.25 * ndelta(delta)
                position.y -= gravity.current * ndelta(delta)
            }

            aabb.setFromCenterAndSize(position, _size.set(...size))

            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: size,
                rotation: rotation.current as Tuple3
            })

            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    useFrame(() => {
        if (instance && typeof index === "number" && dead.current && position.y < 0 && !removed.current) {
            createExplosion({
                position: [position.x, 0, position.z],
                count: 10,
                radius: .6,
            })
            createParticles({
                position: position.toArray(),
                speed: [15, 25],
                variance: [[-10, 10], [0, 5], [-10, 10]],
                offset: [[-.5, .5], [-.5, .5], [-.5, .5]],
                normal: [0, 1, 0],
                count: [4, 8],
                radius: [.15, .45],
                color: "purple",
            })
            remove()
        }
    })

    return null
}