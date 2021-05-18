import { useFrame } from "react-three-fiber"
import { Vector3, Matrix4 } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import useStore, { hitPlayer, removeBullet, removeFighter, hitObstacle, createParticle } from "../data/store"
import random from "@huth/random"

export default function Bullets() {
    let bullets = useStore(i => i.bullets.list)
    let count = 75
    let ref = useRef()
    let matrix = useMemo(() => new Matrix4(), [])
    let setPosition = useCallback((index, position) => {
        ref.current.setMatrixAt(index, matrix.setPosition(position))
        ref.current.instanceMatrix.needsUpdate = true
    }, [matrix])

    return (
        <>
            {bullets.map((i) => <Bullet setPosition={setPosition} {...i} key={i.id} />)}
            <instancedMesh ref={ref} args={[null, null, count]}>
                <boxBufferGeometry args={[.25, .25, 1.5]} />
                <meshBasicMaterial color="white" />
            </instancedMesh>
        </>
    )
}

function Bullet({ x, y, z, speed, index, position, id, setPosition, owner }) {
    //let ref = useRef()
    let dead = useRef(false)
    let playerPosition = useRef([0, 0, 0])
    let obstacles = useRef([])
    let fighters = useStore(i => i.fighters.list)
    let warp = useStore(i => i.player.warp)

    useLayoutEffect(() => {
        setPosition(x, y, z)
        obstacles.current = useStore.getState().obstacles
    }, [setPosition, x, y, z])

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useEffect(() => {
        return useStore.subscribe(objs => {
            obstacles.current = objs
        }, store => store.obstacles)
    }, [])

    useEffect(() => {
        return () => setPosition(index, new Vector3(0, 0, -1000))
    }, [setPosition, index])

    useFrame(() => {
        if (owner === "player") {
            for (let obstacle of obstacles.current) {
                if (obstacle.health > 0 && obstacle.container.containsPoint(position)) { 
                    dead.current = true
                    removeBullet(id, index)
                    hitObstacle(obstacle.id, 1)

                    for (let i = 0; i < random.integer(0, 2); i++) (
                        createParticle([position.x, position.y, obstacle.position[2] - obstacle.depth / 2], [
                            random.float(-.5, .5),
                            random.float(-.5, .5),
                            random.float(-.5, 0),
                        ])
                    )

                    break
                }
            }
        }
    })

    useFrame(() => {
        if (!dead.current) {
            if (owner === "player") {
                for (let fighter of fighters) {
                    if (fighter.position.distanceTo(position) < 1.5) {
                        removeFighter(fighter.id, fighter.index)
                        removeBullet(id, index)
                        dead.current = true
                        break
                    }
                }
            } else if (owner === "enemy") {
                if (position.distanceTo(new Vector3(...playerPosition.current)) < 2.5) {
                    hitPlayer()
                    removeBullet(id, index)
                    dead.current = true
                }
            }
        }
    })

    useFrame(() => {
        if (dead.current) {
            return
        }

        position.z += (speed + (warp ? .1 : 0)) * (owner === "enemy" ? -1 : 1)

        let edgeLeftBuffer = 30
        let edgeRightBuffer = 45
        let beyondLeftEdge = position.z < playerPosition.current[2] - edgeLeftBuffer && owner === "enemy"
        let beyondRightEdge = position.z > (playerPosition.current[2] + edgeRightBuffer) && owner === "player"

        if (beyondLeftEdge || beyondRightEdge) {
            removeBullet(id, index)
        }

        setPosition(index, position)
    })

    return null
}