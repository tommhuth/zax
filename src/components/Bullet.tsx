
import { useFrame, useThree } from "@react-three/fiber"
import React, { useEffect, useLayoutEffect, useRef } from "react"
import { Object3D, Raycaster, Vector3 } from "three"
import { Bullet, createParticles, damagePlayer, damagePlane, damageTurret, increaseScore, Owner, removeBullet, store, useStore } from "../data/store"
import { useInstance } from "./InstancedMesh"
import { ndelta, setColorAt, setMatrixAt } from "../utils/utils"
import { useCollisionDetection } from "../utils/hooks"

let _origin = new Vector3()
let _direction = new Vector3()
let _speed = new Vector3()
let _raycaster = new Raycaster(_origin, _direction, 0, 10)


export function Bullets2() {
    let bullets = useStore(i => i.bullets)

    return (
        <>
            {bullets.map(i => {
                return <Bullet key={i.id} {...i} />
            })}
        </>
    )
}


function Bullet({
    id,
    owner,
    position,
    speed,
    size,
    rotation,
    obb, 
    color = "red",
    damage
}: Bullet) {
    let removed = useRef(false)
    let { viewport } = useThree()
    let [index, instance] = useInstance("line")
    let playerSpeed = useStore(i => i.player.speed) 
    let worldDiagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let bulletDiagonal = Math.sqrt((size[2] * .5) ** 2 + size[2] ** 2)
    let intersect = (object: Object3D) => {
        _raycaster.set(
            _origin.copy(position).sub(_speed.set(...speed).normalize().multiplyScalar(1.5)),
            _direction.set(...speed).normalize()
        )

        let [intersection] = _raycaster.intersectObject(object, false) || []

        return intersection
    }
    let remove = () => {
        removeBullet(id) 
        removed.current = true
    } 

    useCollisionDetection({  
        position,
        size: [size[0], size[2]],
        predicate() {
            return !removed.current
        }, 
        source: {
            rotation,
            obb,
            position,
            size: [bulletDiagonal, size[1], bulletDiagonal],
        },
        actions: {
            building: () => {
                let intersection = intersect(store.getState().instances.box.mesh)

                if (intersection?.face) {
                    createParticles({
                        position: intersection.point.toArray(),
                        offset: [[0, 0], [0, 0], [0, 0]],
                        speed: [7, 8],
                        variance: [[-2, 2], [-2, 2], [-2, 2]],
                        normal: intersection.face.normal.toArray(),
                        count: [1, 3],
                        radius: [.1, .2],
                        color: "gray",
                    })
                }


                remove()
            },
            plane: (data) => {
                if (owner === Owner.PLAYER) {
                    damagePlane(data.id, damage)
                    increaseScore(40)

                    let intersection = intersect(store.getState().instances.box.mesh)


                    if (intersection) {
                        createParticles({
                            position: intersection.point.toArray(),
                            count: [1, 3],
                            speed: [8, 12],
                            offset: [[0, 0], [0, 0], [0, 0]],
                            variance: [[-5, 5], [0, 0], [5, 18]],
                            normal: [0, -1, 0],
                            color: "yellow",
                        })
                    }
                }

                remove()
            },
            turret: (data) => {
                if (owner === Owner.PLAYER) {
                    damageTurret(data.id, damage)
                    increaseScore(100)

                    let intersection = intersect(store.getState().instances.box.mesh)

                    if (intersection?.face) {
                        createParticles({
                            position: intersection.point.toArray(),
                            count: [1, 3],
                            speed: [8, 12],
                            offset: [[0, 0], [0, 0], [0, 0]],
                            variance: [[-5, 5], [0, 0], [-5, 5]],
                            normal: intersection.face.normal.toArray(),
                            color: "blue"
                        })
                    }
                }

                remove()
            },
            player: () => { 
                remove() 
                damagePlayer(damage)
                increaseScore(-5)
            }
        }
    })

    useLayoutEffect(() => {
        if (instance && typeof index === "number") {
            setColorAt(instance, index, color)
        }
    }, [instance, index, color])

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

    useFrame((state, delta) => {
        if (instance && typeof index === "number" && !removed.current) {
            position.x += speed[0] * ndelta(delta)
            position.z += speed[2] * ndelta(delta)
            position.z += playerSpeed * ndelta(delta) 

            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                rotation: [0, rotation, 0],
                scale: size,
            })

            if (
                position.z > worldDiagonal * .75 ||
                position.z < -worldDiagonal ||
                position.x > worldDiagonal / 2 ||
                position.x < -worldDiagonal / 2
            ) {
                remove()
            }
        }
    })

    return null
}

export default React.memo(Bullet)