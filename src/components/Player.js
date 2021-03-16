
import ReactDOM from "react-dom"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import Config from "../data/Config"
import { clamp } from "../utils"
import random from "@huth/random"
import Model, { useGeometry } from "../Model"

export default function Player({ width = 3, height = .75, depth = 5 }) {
    let ref = useRef()
    let keys = useRef({})
    let x = useRef(-7.5)
    let [dead, setDead] = useState(false)
    let y = useRef(5)
    let size = useMemo(() => new Vector3(width, height, depth), [width, height, depth])
    let obstacles = useStore(i => i.obstacles)
    let health = useStore(i => i.player.health)
    let container = useMemo(() => {
        return new Box3().setFromCenterAndSize(new Vector3(), size)
    }, [size])

    useEffect(() => {
        window.addEventListener("keydown", e => {
            keys.current[e.key] = true
        })
        window.addEventListener("keyup", e => {
            delete keys.current[e.key]
        })

        window.addEventListener("click", () => {
            createBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z, "player")

        })
    }, [])

    useFrame(() => {
        if (!ref.current) {
            return
        }
        let xLeftEdge = 2  
        let xRightEdge = -18  
        let yUpperEdge = 16
        let yLowerEdge = 1.5

        for (let [key] of Object.entries(keys.current)) {
            switch (key.toLowerCase()) {
                case "a":
                    x.current = clamp(x.current + .25, xRightEdge, xLeftEdge)
                    break
                case "d":
                    x.current = clamp(x.current - .25, xRightEdge, xLeftEdge)
                    break
                case "w":
                    y.current = clamp(y.current + .25, yLowerEdge, yUpperEdge)
                    break
                case "s":
                    y.current = clamp(y.current - .25, yLowerEdge, yUpperEdge)
                    break
            }
        }

        ref.current.position.x += (x.current - ref.current.position.x) * .1
        ref.current.position.y += (y.current - ref.current.position.y) * .1
        ref.current.position.z += dead ? 0 : .15 

        setPlayerPosition([ref.current.position.x, ref.current.position.y, ref.current.position.z])
    })

    useEffect(() => {
        setDead(health === 0)
    }, [health])

    useFrame(() => {
        if (!ref.current) {
            return
        }

        container.setFromCenterAndSize(ref.current.position, size)

        for (let obstacle of obstacles) {
            if (obstacle.health > 0 && obstacle.container.intersectsBox(container)) {
                hitPlayer(1)
            }
        }
    })

    return (
        <>
            <Model receiveShadow={false} castShadow position={[0, 15, -40]} name="player" ref={ref} />
        </>
    )
}

/*
 <mesh position={[0, 15, -40]}>
                <boxBufferGeometry args={[width, height, depth]} />
                <meshLambertMaterial wireframe color="red" />
            </mesh>
            */