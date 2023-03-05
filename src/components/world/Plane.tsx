import { useRef, memo } from "react"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { createBullet, createParticles, damageBarrel, damageTurret, increaseScore, removePlane, store, useStore } from "../../data/store"
import { useInstance } from "../InstancedMesh"
import { clamp, setColorAt, setMatrixAt } from "../../utils/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Tuple3 } from "../../types"
import { useCollisionDetection, useForwardMotion } from "../../utils/hooks"
import { Raycaster, Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "./World"
import { Owner, Plane } from "../../data/types"

let _origin = new Vector3()
let _direction = new Vector3(0, -1, 0)
let _raycaster = new Raycaster(_origin, _direction, 0, 10)

function Plane({
    id,
    size,
    position,
    client,
    health,
    fireFrequency = 300,
    speed
}: Plane) {
    let removed = useRef(false)
    let grounded = useRef(false)
    let bottomY = useRef(0)
    let gravety = useRef(0)
    let actualSpeed = useRef(speed)
    let grid = useStore(i => i.world.grid)
    let { viewport, scene } = useThree()
    let rotation = useRef([0, 0, 0] as Tuple3)
    let tilt = useRef(random.float(0.001, 0.05))
    let [index, instance] = useInstance("box")
    let shootTimer = useRef(0)
    let nextShotAt = useRef(fireFrequency * .5)
    let remove = () => {
        removePlane(id)
        removed.current = true
    }

    useCollisionDetection({
        position,
        size: [size[0], size[2]],
        predicate() {
            return health === 0
        },
        source: {
            size,
            position,
        },
        actions: {
            turret: (data) => {
                damageTurret(data.id, 100)
            },
            barrel: (data) => {
                damageBarrel(data.id, 100)
            },
        }
    })

    useForwardMotion(position, actualSpeed)

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "yellow")

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

    useEffect(() => {
        if (health && health !== 100 && instance && typeof index === "number") {
            return animate({
                from: "#FFFFFF",
                to: "#ffff00",
                duration: 200,
                render(color) {
                    setColorAt(instance, index as number, color)
                },
            })
        }
    }, [instance, health, index])

    useEffect(() => {
        if (health === 0) {
            increaseScore(500)
            createParticles({
                position: position.toArray(),
                speed: [10, 14],
                variance: [[-5, 5], [0, 40], [-5, 5]],
                offset: [[-.5, .5], [-.5, .5], [-.5, .5]],
                normal: [0, -1, 0],
                count: [4, 8],
                radius: [.1, .45],
                color: "yellow",
            })

            _origin.copy(position) 
            _origin.y -= size[1] / 2
            _raycaster.set(_origin, _direction)

            let [intersection] = _raycaster.intersectObjects(scene.children, false) || []

            if (intersection) {
                bottomY.current = intersection.point.y
            }
        }
    }, [health])

    useFrame((state, delta) => {
        let playerPosition = store.getState().player.position
        let distanceFromPlayer = 1 - clamp((-position.z - playerPosition.z) / 10, 0, 1)
        let heightPenalty = 1 - clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)
        let shootDisabled = position.z > playerPosition.z
        let canShoot = position.y > playerPosition.y - 3 && health > 0 && position.z > -8

        if (!shootDisabled && canShoot && shootTimer.current > nextShotAt.current + heightPenalty * fireFrequency * 2) {
            let bulletSpeed = 25

            createBullet({
                position: [
                    position.x,
                    position.y,
                    position.z + 2
                ],
                damage: 15,
                color: "red",
                speed: [0, 0, bulletSpeed],
                rotation: 0,
                owner: Owner.ENEMY
            })
            shootTimer.current = 0
            nextShotAt.current = fireFrequency * random.float(.75, 1) - fireFrequency * distanceFromPlayer * .5
        }

        shootTimer.current += delta * 1000
    })

    useFrame(() => {
        if (instance && typeof index === "number" && !removed.current) {
            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: size,
                rotation: rotation.current
            })

            if (position.z > viewport.width) {
                remove()
            } else {
                client.position = [position.x, position.z]
                grid.updateClient(client)
            }
        }
    })

    useFrame((state, delta) => {
        if (health === 0 && !grounded.current) {
            gravety.current += -.015 * 60 * delta
            position.y += gravety.current  * 60 * delta
            rotation.current[0] += tilt.current  * 60 * delta
            rotation.current[2] += tilt.current * .25  * 60 * delta
            grounded.current = position.y <= (bottomY.current + size[1] / 2)
        }

        if (grounded.current) {
            actualSpeed.current = 0 
            position.y = (bottomY.current + size[1] / 2)
        }
    })

    return null
}

export default memo(Plane)