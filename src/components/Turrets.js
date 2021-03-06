import { Quaternion, Vector3, Matrix4, MeshLambertMaterial } from "three"
import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import useStore, { createBullet, createObstacle, createParticle, removeObstacle, removeTurret, setScore } from "../data/store"
import random from "@huth/random"
import { useGeometry } from "../Model"
import Explosion from "./Explosion"

export default function Turrets() {
    let material = useMemo(() => new MeshLambertMaterial({ color: "green" ,  emissive: "green", emissiveIntensity: .1 }), [])
    let turrets = useStore(i => i.world.turrets)
    let state = useStore(i => i.state)
    let count = 75
    let ref = useRef()
    let geometry = useGeometry("turret")
    let matrix = useMemo(() => new Matrix4(), [])
    let quat = useMemo(() => new Quaternion(), [])
    let scaling = useMemo(() => new Vector3(), [])
    let setPosition = useCallback((index, position, scale = 1) => {
        ref.current.setMatrixAt(index, matrix.compose(position, quat, scaling.setScalar(scale)))
        ref.current.instanceMatrix.needsUpdate = true
    }, [quat, matrix, scaling])

    return (
        <>
            {turrets.map((i) => <Turret state={state} setPosition={setPosition} {...i} key={i.id} />)}
            <instancedMesh receiveShadow ref={ref} args={[geometry, material, count]} />
        </>
    )
}

function Turret({
    setPosition,
    health,
    position,
    id,
    index,
    x = 0,
    state,
    y = 0,
    z = 0,
    width = 3,
    height = 8,
    depth = 3
}) {

    let [dead, setDead] = useState(false)
    let [gone, setGone] = useState(false)
    let [explode, setExplode] = useState(false)
    let [obstacleId, setObstacleId] = useState()
    let obstacle = useStore(i => i.obstacles.find(i => i.id === obstacleId))
    let playerPosition = useRef([0, 0, 0])
    let tid = useRef()

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
            health,
            x,
            y: y - 2,
            z,
        })

        setObstacleId(oid)

        return () => {
            removeObstacle(oid)
        }
    }, [width, height, depth, id, x, y, z, setPosition, health, index, position])

    useEffect(() => {
        setPosition(index, position)
    })

    useEffect(() => {
        let fire = () => {
            if (state === "active" && playerPosition.current[2] > z - 35 && playerPosition.current[2] < z - 5 && !document.hidden) {
                createBullet(x, y + 5, z - 6, "enemy")
            }

            tid.current = setTimeout(fire, random.boolean() ? 200 : random.integer(850, 1000))
        }

        fire()

        return () => {
            clearTimeout(tid.current)
        }
    }, [x, y, z,state])

    useEffect(() => {
        if (obstacle?.health === 0) {
            setExplode(true)
            setScore(1000)
            clearTimeout(tid.current)
            setTimeout(() => setDead(true), 500)
            setTimeout(() => setGone(true), 1100)
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
            {explode ? <Explosion x={x} y={y + 3} z={z} /> : null}
        </>
    )
}