
import ReactDOM from "react-dom"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import Config from "../data/Config"
import { clamp } from "../utils"
import random from "@huth/random"
import Model, { useGeometry } from "../Model"

const material = new MeshLambertMaterial({ color: "red" })

export default function Fighters() {
    let count = 40
    let fighters = useStore(i => i.fighters.list)
    let geomtery = useGeometry("fighter1")
    let ref = useRef()
    let matrix = useMemo(()=> new Matrix4(), []) 
    let setPosition = useCallback((index, position) => { 
        ref.current.setMatrixAt(index, matrix.setPosition(position))
    }, [matrix])

    useLayoutEffect(() => {
        matrix.setPosition(0, 0, - 100)

        for (let i = 0; i < count; i++) {
            ref.current.setMatrixAt(i, matrix)
        }

        ref.current.instanceMatrix.needsUpdate = true
    }, [matrix,count])

    useFrame(() => {
        ref.current.instanceMatrix.needsUpdate = true
    })

    useEffect(() => {
        setInterval(() => {
            if (!document.hidden) {
                //createFighter()
            }
        }, 1500)
    }, [])

    return <>
        {fighters.map(i => <Fighter setPosition={setPosition} {...i} key={i.id} />)}
        <instancedMesh ref={ref} castShadow receiveShadow args={[geomtery, material, count]}> 
        </instancedMesh>
    </>
}

function Fighter({ position, index, setPosition, y = 5, speed = .2, straight, id }) {
    let dead = useRef(false)
    let t = useRef(Math.random() * 2)
    let tid = useRef(0)
    let playerPosition = useRef([0, 0, 0])

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useEffect(() => {
        return () => setPosition(index, 0, 0, -1000)
    }, [index, setPosition])

    useEffect(() => {
        const fire = () => { 
            if (!document.hidden && playerPosition.current[2] > position.z - 25 &&  playerPosition.current[2] < position.z) {
                createBullet(position.x, position.y, position.z, "enemy")
            }

            tid.current = setTimeout(fire, random.boolean() ? 200 : random.integer(500, 1000))
        } 

        fire()

        return () => clearTimeout(tid.current)
    }, [position])

    useFrame(() => {
        position.y = Math.cos(t.current) * .35 + y
        position.z -= speed

        if (!straight) {
            position.x = Math.cos(t.current * .4) * 8
        }

        t.current += .085

        setPosition(index, position)
    })

    useFrame(() => {
        let gone = position.z < playerPosition.current[2] - 45
        let hit = position.distanceTo(new Vector3(...playerPosition.current)) < 3

        if ((hit || gone) && !dead.current) {
            dead.current = true
            removeFighter(id, index)
            clearTimeout(tid.current)

            if (hit) {
                hitPlayer()
            }
        }
    })

    return null
}
