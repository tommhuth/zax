import { useRef, memo } from "react"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { createBullet, createExplosion, createParticles, damageBarrel, damageTurret, increaseScore, removePlane, store, useStore } from "../../data/store"
import { useInstance } from "../InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Tuple3 } from "../../types"
import { useCollisionDetection } from "../../utils/hooks"
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "./World"
import { Owner, Plane } from "../../data/types"

let _size = new Vector3()

function Plane({
    id,
    size,
    position,
    aabb,
    client,
    health,
    fireFrequency = 300,
    speed
}: Plane) {
    let removed = useRef(false)
    let grounded = useRef(false)
    let bottomY = 0
    let gravity = useRef(0)
    let actualSpeed = useRef(speed)
    let grid = useStore(i => i.world.grid)
    let rotation = useRef([0, 0, 0] as Tuple3)
    let tilt = useRef(random.float(0.001, 0.05))
    let [index, instance] = useInstance("box")
    let shootTimer = useRef(random.float(0, fireFrequency))
    let nextShotAt = useRef(fireFrequency * .5)
    let remove = () => {
        removePlane(id)
        removed.current = true
    }

    useCollisionDetection({
        position,
        size,
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

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "yellow")

            return () => {
                setMatrixNullAt(instance, index as number)
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
            createExplosion({
                position: [position.x, position.y - 1, position.z], 
                count: 10, 
                radius: .4
            })
            createParticles({
                position: position.toArray(),
                speed: [12, 16],
                speedOffset: [[-5, 5], [0, 20], [-15, 5]],
                positionOffset: [[-.5, .5], [-.5, .5], [-.5, .5]],
                normal: [0, 0, -.5],
                count: [4, 8],
                radius: [.1, .45],
                color: "yellow",
            })
        }
    }, [health])

    useFrame((state, delta) => {
        let playerPosition = store.getState().player.object?.position
        let world = store.getState().world

        if (!playerPosition) {
            return
        }

        let distanceFromPlayer = 1 - clamp((-position.z - playerPosition.z) / 10, 0, 1)
        let heightPenalty = 1 - clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)
        let shootDisabled = position.z > playerPosition.z || !world.frustum.containsPoint(position)
        let canShoot = position.y > playerPosition.y - 3 && health > 0

        if (!shootDisabled && canShoot && shootTimer.current > nextShotAt.current + heightPenalty * fireFrequency * 4) {
            let bulletSpeed = 20

            createBullet({
                position: [
                    position.x,
                    position.y,
                    position.z + 2
                ],
                damage: 15,
                color: "red",
                speed: bulletSpeed,
                rotation: Math.PI *.5,
                owner: Owner.ENEMY
            })
            shootTimer.current = 0
            nextShotAt.current = fireFrequency - fireFrequency * distanceFromPlayer * .5
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    useFrame((state, delta) => {
        let { world, player } = useStore.getState()

        if (instance && typeof index === "number" && !removed.current) {
            position.z += actualSpeed.current * ndelta(delta)

            aabb.setFromCenterAndSize(position, _size.set(...size))

            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: [size[0], .5, size[2]],
                rotation: rotation.current
            })

            if (!world.frustum.intersectsBox(aabb) && player.object && position.z > player.object.position.z) {
                remove()
            } else {
                client.position = position.toArray()
                grid.updateClient(client)
            }
        }
    })

    useFrame((state, delta) => {
        if (health === 0 && !grounded.current) {
            let nd = ndelta(delta)

            gravity.current += -.015 * 60 * nd
            position.y += gravity.current * 60 * nd
            rotation.current[0] += tilt.current * 60 * nd
            rotation.current[2] += tilt.current * .25 * 60 * nd
            grounded.current = position.y <= (bottomY + .5 / 2)
            actualSpeed.current *= .99

            if (grounded.current) { 
                createExplosion({
                    position: [position.x, -.5, position.z], 
                    count: 8,  
                    radius: .3,
                    fireballCount: 5,
                    fireballPath: [[position.x, 0, position.z], [0, 0, 2]]
                }) 
            }
        }

        if (grounded.current) {
            actualSpeed.current *= .9
            position.y = (bottomY + .5 / 2)
        }
    })

    return null
}

export default memo(Plane)