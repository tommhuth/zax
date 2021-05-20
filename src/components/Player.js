import { useFrame } from "react-three-fiber"
import { Box3, Vector3 } from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, hitPlayer, setWarp } from "../data/store"
import { clamp, Only } from "../utils"
import Model from "../Model"
import Config from "../data/Config"
import Explosion from "./Explosion"

export default function Player({ width = 2.5, height = .65, depth = 5 }) {
    let ref = useRef()
    let keys = useRef({})
    let x = useRef(-7.5)
    let [dead, setDead] = useState(false)
    let [hidden, setHidden] = useState(false)
    let y = useRef(5)
    let size = useMemo(() => new Vector3(width, height, depth), [width, height, depth])
    let obstacles = useStore(i => i.obstacles)
    let health = useStore(i => i.player.health)
    let warp = useStore(i => i.player.warp)
    let acc = useRef(0)
    let container = useMemo(() => {
        return new Box3().setFromCenterAndSize(new Vector3(), size)
    }, [size])

    useEffect(() => {
        let shoot = () => {
            if (!dead) {
                createBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z + depth / 2 + 1, "player")
            }
        }
        let onKeyDown = e => {
            keys.current[e.key] = true

            if (e.key === " ") {
                shoot()
            }
        }
        let onKeyUp = e => {
            delete keys.current[e.key]
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("click", shoot)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("click", shoot)
        }
    }, [dead, depth])

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

        if (health === 0) {
            setTimeout(() => setHidden(true), 400)
        }
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

    useFrame(() => {
        if (dead) {
            acc.current -= .015
            ref.current.position.y = Math.max(ref.current.position.y + acc.current, 0)
            ref.current.rotation.z += .025
            ref.current.rotation.x += .015
        }
    })

    return (
        <>
            <Model visible={!hidden} receiveShadow={false} castShadow position={[0, 15, -40]} name="player" ref={ref} />
            <Only if={health === 0}>
                <Explosion
                    x={ref.current?.position.x}
                    y={ref.current?.position.y}
                    z={ref.current?.position.z}
                    width={width}
                    height={height}
                    depth={depth}
                />
            </Only>
        </>
    )
}