import { memo, useRef } from "react"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { createBullet, createExplosion, createParticles, createShimmer, damageBarrel, damageTurret, removeByProximity, removeTurret, store, useStore } from "../../data/store"
import { useInstance } from "../InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "./World"
import { Owner, Turret } from "../../data/types"
import Config from "../../Config"


function Turret({ id, size, position, health, fireFrequency, rotation, aabb }: Turret) {
    let removed = useRef(false)
    let { viewport } = useThree()
    let [index, instance] = useInstance("turret")
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let shootTimer = useRef(0)
    let nextShotAt = useRef(fireFrequency)
    let remove = () => {
        setTimeout(() => removeTurret(id), 350)
        removed.current = true
    }

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "#fff")
            setMatrixAt({
                instance,
                index,
                position: [position.x, position.y - .1, position.z],
                rotation: [0, -rotation + Math.PI * .5, 0],
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, position, rotation, instance])

    useEffect(() => {
        if (health && health !== 100 && instance && typeof index === "number") {
            return animate({
                from: "#9a9aa4",
                to: "#ffffff",
                duration: 200,
                render(color) {
                    setColorAt(instance, index as number, color)
                },
            })
        }
    }, [instance, health, index])

    useEffect(() => {
        if (health === 0) {
            remove()
            createShimmer({  
                position: [
                    position.x,
                    position.y + size[1]/2,
                    position.z,
                ], 
                size: [3,4,3]
            })
            createExplosion({
                position: [position.x, 0, position.z],
                count: 10,
                radius: .65
            })
            createParticles({
                position: [position.x, 0, position.z],
                positionOffset: [[-1, 1], [0, 2], [-1, 1]],
                speed: [6, 22],
                speedOffset: [[-10, 10], [0, 5], [-10, 10]],
                normal: [0, 1, 0],
                count: [6, 12],
                radius: [.1, .45],
                color: "#fff",
            })

            removeByProximity({ id, position }, 1.5)
        }
    }, [health])

    useFrame((state, delta) => {
        let { player: { object: playerObject }, world } = store.getState()
        let canShoot = world.frustum.containsPoint(position)

        if (shootTimer.current > nextShotAt.current && canShoot && playerObject) {
            let playerPosition = playerObject.position
            let distanceFromPlayer = 1 - clamp(Math.abs(playerPosition.z - playerPosition.z) / (diagonal / 2), 0, 1)
            let heightPenalty = clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)

            let offsetRadius = size[0] + 1.25
            let offsetx = Math.cos(rotation) * offsetRadius
            let offsetz = Math.sin(rotation) * offsetRadius
            let bulletSpeed = 18

            createBullet({
                position: [
                    position.x + offsetx,
                    position.y + size[1] / 2 - .15,
                    position.z + offsetz
                ],
                color: "white",
                damage: 5,
                speed: bulletSpeed,
                rotation: rotation,
                owner: Owner.ENEMY
            })

            shootTimer.current = 0
            nextShotAt.current = fireFrequency * random.float(.75, 1) - fireFrequency * distanceFromPlayer * .5 + heightPenalty * fireFrequency * 2
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    useFrame(() => {
        let { world, player } = useStore.getState()

        if (!removed.current && !world.frustum.intersectsBox(aabb) && player.object && position.z > player.object.position.z) {
            remove()
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

export default memo(Turret)