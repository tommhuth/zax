import { useFrame } from "react-three-fiber"
import { Box3, Vector3 } from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, hitPlayer, setWarp } from "../data/store"
import { clamp } from "../utils"
import Model from "../Model"
import Config from "../data/Config"

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
        let shoot = () => {
            createBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z + depth / 2 + 1, "player")
        }

        window.addEventListener("keydown", e => {
            keys.current[e.key] = true

            if (e.key === " ") {
                shoot()
            }
        })
        window.addEventListener("keyup", e => {
            delete keys.current[e.key]
        })

        window.addEventListener("click", shoot)
    }, [])

    useFrame(() => {
        if (!ref.current) {
            return
        }

        for (let [key] of Object.entries(keys.current)) {
            switch (key.toLowerCase()) {
                case "a":
                    x.current = clamp(x.current + .25, Config.PLAYER_RIGHT_EDGE, Config.PLAYER_LEFT_EDGE)
                    break
                case "d":
                    x.current = clamp(x.current - .25, Config.PLAYER_RIGHT_EDGE, Config.PLAYER_LEFT_EDGE)
                    break
                case "w":
                    y.current = clamp(y.current + .2, Config.PLAYER_LOWER_EDGE, Config.PLAYER_UPPER_EDGE)
                    break
                case "s":
                    y.current = clamp(y.current - .2, Config.PLAYER_LOWER_EDGE, Config.PLAYER_UPPER_EDGE)
                    break
            }
        }

        if (warp) {
            y.current = Config.WARP_Y
        }

        ref.current.position.x += (x.current - ref.current.position.x) * .1
        ref.current.position.z += dead ? 0 : .3 + (warp ? .1 : 0)
        ref.current.position.y += (y.current - ref.current.position.y) * (warp ? .01 : .1)

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