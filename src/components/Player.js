import { useFrame } from "react-three-fiber"
import { Box3, Vector3 } from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, hitPlayer, setWarp } from "../data/store"
import { clamp } from "../utils"
import Model from "../Model"

export default function Player({ width = 2.5, height = .65, depth = 5 }) {
    let ref = useRef()
    let keys = useRef({})
    let x = useRef(-7.5)
    let [dead, setDead] = useState(false)
    let y = useRef(5)
    let size = useMemo(() => new Vector3(width, height, depth), [width, height, depth])
    let obstacles = useStore(i => i.obstacles)
    let health = useStore(i => i.player.health)
    let warp = useStore(i => i.player.warp)
    let container = useMemo(() => {
        return new Box3().setFromCenterAndSize(new Vector3(), size)
    }, [size])

    useEffect(() => {
        window.addEventListener("keydown", e => {
            keys.current[e.key] = true

            if (e.key === " ") {
                createBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z + depth / 2 + 1, "player")
            }
        })
        window.addEventListener("keyup", e => {
            delete keys.current[e.key]
        })

        window.addEventListener("click", () => {
            createBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z + depth / 2 + 1, "player")
        })
    }, [])

    useFrame(() => {
        if (!ref.current) {
            return
        }
        let xLeftEdge = 9
        let xRightEdge = -16
        let yUpperEdge = 16
        let yLowerEdge = 3

        for (let [key] of Object.entries(keys.current)) {
            switch (key.toLowerCase()) {
                case "a":
                    x.current = clamp(x.current + .25, xRightEdge, xLeftEdge)
                    break
                case "d":
                    x.current = clamp(x.current - .25, xRightEdge, xLeftEdge)
                    break
                case "w":
                    y.current = clamp(y.current + .2, yLowerEdge, yUpperEdge)
                    break
                case "s":
                    y.current = clamp(y.current - .2, yLowerEdge, yUpperEdge)
                    break
            }
        }

        ref.current.position.x += (x.current - ref.current.position.x) * .1
        ref.current.position.z += dead ? 0 : .3

        if (warp) {
            ref.current.position.y += (5 - ref.current.position.y) * .01
        } else {
            ref.current.position.y += (y.current - ref.current.position.y) * .1
        }

        setPlayerPosition([ref.current.position.x, ref.current.position.y, ref.current.position.z])
    })

    useEffect(() => {
        setDead(health === 0)
    }, [health])

    useFrame(() => {
        if (!ref.current || dead) {
            return
        }

        container.setFromCenterAndSize(ref.current.position, size)

        for (let obstacle of obstacles) {
            if (obstacle.health > 0 && obstacle.container.intersectsBox(container)) {
                setWarp(false) 
                hitPlayer(100)
                break
            }
        }
    })

    return ( 
        <Model receiveShadow={false} castShadow position={[0, 15, -40]} name="player" ref={ref} />
    )
} 