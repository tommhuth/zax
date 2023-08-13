import { startTransition, useLayoutEffect, useRef } from "react"
import { Rocket } from "../../data/types"
import { useInstance } from "../InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { ndelta, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { createExplosion, createParticles, createShimmer, increaseScore, removeRocket, useStore } from "../../data/store"
import { Mesh, Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../types"
import { WORLD_TOP_EDGE } from "./World"
import Config from "../../Config"

let _size = new Vector3()

function explode(position: Vector3, size: Tuple3) {
    createShimmer({
        position: [
            position.x,
            position.y + size[1] / 2,
            position.z,
        ],
        size: [3, 6, 3]
    })
    createParticles({
        position: position.toArray(),
        speed: [12, 16],
        speedOffset: [[-5, 5], [-10, 10], [-15, 5]],
        positionOffset: [[-1.5, 1.5], [-.5, .5], [-1.5, 1.5]],
        normal: [0, -1, 0],
        count: [10, 18],
        radius: [.1, .45],
        color: "#fff",
    })

    for (let direction of [-1, 1]) {
        createExplosion({
            position: [position.x, position.y - direction, position.z],
            count: 10,
            radius: .45,
            fireballCount: 6,
            fireballPath: [[position.x, position.y, position.z], [0, 3 * direction, 0]]
        })
    }
}

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
    let gravity = useRef(0)
    let ref = useRef<Mesh>(null)
    let actualSpeed = useRef(speed)
    let rotation = useRef<Tuple3>([0, random.float(0, Math.PI * 2), 0])
    let triggerZ = useRef(25)
    let [rocketIndex, rocketInstance] = useInstance("rocket", { reset: false, color: "#FFF" })
    let remove = () => {
        removed.current = true
        increaseScore(500)
        removeRocket(id)
        setMatrixNullAt(rocketInstance, rocketIndex as number)
    }

    useInstance("platform", { 
        color: "#ddd", 
        reset: false,
        position: [position.x, 0, position.z],
        rotation: [0, random.float(0, Math.PI * 2), 0]
    })

    useLayoutEffect(() => {
        if (health === 0) {
            startTransition(() => {
                remove()
                explode(position, size)
            })
        }
    }, [health])
  
    useFrame((state, delta) => {
        let { player } = useStore.getState()

        if (rocketInstance && typeof rocketIndex === "number" && !removed.current && player.object) {
            if (health > 0) {
                if (Math.abs(position.z - player.object.position.z) < triggerZ.current) {
                    position.y += actualSpeed.current * ndelta(delta)

                    if (position.y > WORLD_TOP_EDGE + 1) {
                        actualSpeed.current += 5 * ndelta(delta)
                    }
                }
            } else {
                gravity.current += 14 * ndelta(delta)
                position.y -= gravity.current * ndelta(delta)
            }

            aabb.setFromCenterAndSize(position, _size.set(...size))

            setMatrixAt({
                instance: rocketInstance,
                index: rocketIndex,
                position: position.toArray(),
                rotation: rotation.current
            })

            ref.current?.position.set(...position.toArray())

            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    if (!Config.DEBUG) {
        return null
    }

    return (
        <mesh position={position.toArray()} ref={ref}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" />
        </mesh>
    )
}