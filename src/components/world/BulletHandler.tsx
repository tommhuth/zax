import { useFrame } from "@react-three/fiber"
import { memo } from "react"
import { Object3D, Raycaster, Vector3 } from "three"
import { createParticles, damageBarrel, damagePlane, damagePlayer, damageRocket, damageTurret, increaseScore, removeBullet, store } from "../../data/store"
import { Bullet, Owner } from "../../data/types"
import { Tuple3 } from "../../types"
import { getCollisions } from "../../utils/hooks"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"

let _origin = new Vector3()
let _direction = new Vector3()
let _speed = new Vector3()
let _raycaster = new Raycaster(_origin, _direction, 0, 10)

function intersect(object: Object3D, position: Vector3, speed: Tuple3) {
    _raycaster.set(
        _origin.copy(position).sub(_speed.set(...speed).normalize().multiplyScalar(1.5)),
        _direction.set(...speed).normalize()
    )

    let [intersection] = _raycaster.intersectObject(object, false) || []

    return intersection
}


function BulletHandler() {
    useFrame((state, delta) => {
        let { bullets, instances, world, player } = store.getState()
        let removed: Bullet[] = []


        if (!instances.line || !player.object) {
            return
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
            let bulletDiagonal = Math.sqrt((bullet.size[2] * .5) ** 2 + bullet.size[2] ** 2)
            let collisions = getCollisions({
                grid: world.grid,
                position: bullet.position,
                size: bullet.size,
                source: {
                    position: bullet.position,
                    rotation: bullet.rotation,
                    size: [bulletDiagonal, bullet.size[1], bulletDiagonal],
                    obb: bullet.obb,
                }
            })

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]

                switch (client.data.type) {
                    case "building": {
                        let intersection = intersect(instances.box.mesh, bullet.position, bullet.speed)

                        if (intersection?.face) {
                            createParticles({
                                position: intersection.point.toArray(),
                                offset: [[0, 0], [0, 0], [0, 0]],
                                speed: [7, 8],
                                variance: [[-2, 2], [-2, 2], [-2, 2]],
                                normal: intersection.face.normal.toArray(),
                                count: [1, 2],
                                radius: [.1, .2],
                                color: "gray",
                            })
                        }

                        break
                    }
                    case "plane": {
                        if (bullet.owner === Owner.PLAYER) {
                            damagePlane(client.data.id, bullet.damage) 

                            let intersection = intersect(instances.box.mesh, bullet.position, bullet.speed)

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
                        break
                    }
                    case "rocket": {
                        if (bullet.owner === Owner.PLAYER) {
                            damageRocket(client.data.id, bullet.damage) 

                            let intersection = intersect(instances.cylinder.mesh, bullet.position, bullet.speed)

                            if (intersection) {
                                createParticles({
                                    position: intersection.point.toArray(),
                                    count: [2, 4],
                                    speed: [8, 12],
                                    offset: [[0, 0], [0, 0], [0, 0]],
                                    variance: [[-5, 5], [0, 0], [-5, 5]],
                                    normal: intersection.face?.normal.toArray() as Tuple3,
                                    color: "purple",
                                })
                            }
                        }
                        break
                    }
                    case "turret": {
                        if (bullet.owner === Owner.PLAYER) {
                            damageTurret(client.data.id, bullet.damage) 

                            let intersection = intersect(instances.box.mesh, bullet.position, bullet.speed)

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
                        break
                    }
                    case "player": {
                        damagePlayer(bullet.damage)
                        increaseScore(-10)
                        break
                    }
                    case "barrel": {
                        if (bullet.owner === Owner.PLAYER) {
                            damageBarrel(client.data.id, 100)
                            increaseScore(1000)
                        }
                        break
                    }
                }
            }

            bullet.position.x += bullet.speed[0] * ndelta(delta)
            bullet.position.z += bullet.speed[2] * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: bullet.position.toArray(),
                rotation: [0, bullet.rotation, 0],
                scale: bullet.size,
            })

            if (!world.frustum.containsPoint(bullet.position) || collisions.length) {
                removed.push(bullet) 
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }
        }

        for (let i = 0; i < removed.length; i++) {
            let bullet = removed[i]

            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removed.length) {
            removeBullet(...removed.map(i => i.id))
        }
    })

    return null
}

export default memo(BulletHandler)