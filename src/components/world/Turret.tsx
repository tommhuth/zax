import { memo, useRef } from "react"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { createBullet, createExplosion, createParticles, removeTurret, store, useStore } from "../../data/store"
import { useInstance } from "../InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Raycaster, Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "./World"
import { Owner, Turret } from "../../data/types"

const _speed = new Vector3()

let _origin = new Vector3()
let _direction = new Vector3()
let _size = new Vector3()
let _raycaster = new Raycaster(_origin, _direction, 0)

function Turret({ id, size, position, health, fireFrequency, aabb }: Turret) {
    let removed = useRef(false)
    let { viewport } = useThree()
    let [index, instance] = useInstance("box")
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let shootTimer = useRef(0)
    let nextShotAt = useRef(fireFrequency)
    let remove = () => {
        setTimeout(() => removeTurret(id), 350)
        removed.current = true
    }

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "blue")

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, instance])

    useEffect(() => {
        if (health && health !== 100 && instance && typeof index === "number") {
            return animate({
                from: "#FFFFFF",
                to: "#0000FF",
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
            createExplosion([position.x, 0, position.z], 10, .65)
            createParticles({
                position: [position.x, 0, position.z],
                speed: [8, 15],
                variance: [[-10, 10], [0, 5], [-10, 10]],
                offset: [[-1, 1], [0, 2], [-1, 1]],
                normal: [0, 1, 0],
                count: [4, 8],
                radius: [.1, .45],
                color: "blue",
            })
        }
    }, [health])

    useFrame((state, delta) => {
        let { player: { object: playerObject }, world } = store.getState()
        let canShoot = world.frustum.containsPoint(position)

        if (shootTimer.current > nextShotAt.current && canShoot && playerObject) {
            let playerPosition = playerObject.position
            let distanceFromPlayer = 1 - clamp(Math.abs(playerPosition.z - playerPosition.z) / (diagonal / 2), 0, 1)
            let heightPenalty = clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)

            _raycaster.set(position, _direction.copy(playerPosition).sub(position).normalize())
            _raycaster.near = 0
            _raycaster.far = 25

            let [firstIntersection] = _raycaster.intersectObject(playerObject, true)
            let hasLineOfSightToPlayer = firstIntersection?.object.userData?.type === "player"

            if (hasLineOfSightToPlayer || random.boolean(.1)) {
                let rotation = Math.atan2(playerPosition.z - position.z, playerPosition.x - position.x)
                let offsetRadius = 1.5
                let offsetx = Math.cos(rotation) * offsetRadius
                let offsetz = Math.sin(rotation) * offsetRadius
                let bulletSpeed = 18
                let speed = _speed.set(playerPosition.x, position.y, playerPosition.z)
                    .sub(position)
                    .normalize()
                    .multiplyScalar(bulletSpeed)

                createBullet({
                    position: [
                        position.x + offsetx,
                        position.y + size[1] * .75 * .5,
                        position.z + offsetz
                    ],
                    color: "white",
                    damage: 5,
                    speed: [speed.x, 0, speed.z],
                    rotation: -rotation + Math.PI / 2,
                    owner: Owner.ENEMY
                })
            }

            shootTimer.current = 0
            nextShotAt.current = fireFrequency * random.float(.75, 1) - fireFrequency * distanceFromPlayer * .5 + heightPenalty * fireFrequency * 2
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    useFrame(() => {
        let { world, player } = useStore.getState()

        if (!removed.current && instance && typeof index === "number" && !removed.current) {
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

export default memo(Turret)