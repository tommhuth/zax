import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, removeTank, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import { useGeometry } from "../Model"
import Explosion from "../components/Explosion"

import random from "@huth/random"

const mat = new MeshLambertMaterial({ color: "#ccc" })

export default function Tanks() {
    let tanks = useStore(i => i.world.tanks)
    let count = 75
    let ref = useRef()
    let geometry = useGeometry("tank")
    let matrix = useMemo(() => new Matrix4(), [])
    let scaling = useMemo(() => new Vector3(), [])
    let quaternion = useMemo(() => new Quaternion(), [])
    let setPosition = useCallback((index, position, scale = 1) => {
        scaling.set(scale, scale, scale)

        ref.current.setMatrixAt(index, matrix.compose(position, quaternion, scaling))
    }, [quaternion, matrix, scaling])

    useFrame(() => {
        ref.current.instanceMatrix.needsUpdate = true
    })

    return (

        <>
            {tanks.map((i) => <Tank setPosition={setPosition} {...i} key={i.id} />)}
            <instancedMesh receiveShadow ref={ref} args={[geometry, mat, count]} />
        </>
    )
}

function Tank({ setPosition, position, id, index, x = 0, y = 0, z = 0, width = 5, height = 3, depth = 5 }) {
    let [obstacleId, setObstacleId] = useState()
    let obstacle = useStore(i => i.obstacles.find(i => i.id === obstacleId))
    let playerPosition = useRef([0, 0, 0])
    let [dead, setDead] = useState(false)
    let [explode, setExplode] = useState(false)
    let [gone, setGone] = useState(false)

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useEffect(() => {
        let oid = createObstacle({
            width,
            height,
            depth,
            health: 3,
            position: [x, y, z],
        })

        setObstacleId(oid)

        return () => {
            removeObstacle(oid)
        }
    }, [width, height, depth, id, x, y, z, setPosition, index, position])

    useEffect(() => {
        setPosition(index, position)
    })

    useEffect(() => {
        if (obstacle?.health === 0) {
            setExplode(true) 
            setTimeout(() => setDead(true), 500)
            setTimeout(() => setGone(true), 1900)
        }
    }, [obstacle?.health])
 


    useEffect(() => {
        if (dead) {
            setPosition(index, position.set(0, 0, -10000))

            for (let i = 0; i < 6; i++) {
                createParticle(
                    [x, y + 2, z],
                    [
                        random.float(-1, 1),
                        random.float(.25, 2.5),
                        random.float(-1, 1)
                    ],
                    random.float(.25, 1)
                )
            }
        }
    }, [dead, setPosition, position, x, y, z, index])

    useEffect(() => {
        if (gone) {
            removeTurret(id)
        }
    }, [gone, id])

    return (
        <>
            {explode ? <Explosion radius={9} x={x} y={y + 1.5} z={z} width={7} depth={7} height={3} /> : null}
        </>
    )
}