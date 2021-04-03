import { useFrame, useThree } from "react-three-fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useStore, { createObstacle, removeObstacle, setWarp } from "../../data/store"
import random from "@huth/random"
import { useMeteor } from "../Models"

export default function Space({ z, depth }) {
    let playerPosition = useRef([0, 0, 0])
    let health = useStore(i => i.player.health)
    let [meteors, setMeteors] = useState(() => {
        return new Array(40).fill().map((i,index) => {
            let z = index/40 * (depth-300) + 150

            return {
                id: random.id(),
                x: random.integer(-20, 20),
                radius: random.integer(2, 5),
                y: 5,
                z 
            }
        })
    })
    let removeMeteor = useCallback((id) => {
        setMeteors(i => i.filter(i => i.id !== id))
    }, [])

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useFrame(() => {
        let buffer = 100

        setWarp(health > 0 && playerPosition.current[2] > z + buffer * .65 && playerPosition.current[2] < z + depth - buffer)
    })

    return (
        <>
            {meteors.map(i => {
                return (
                    <Meteor removeMeteor={removeMeteor} {...i} key={i.id} />
                )
            })}
        </>
    )
}

function Meteor({ x = 0, y = 0, z = 0, id, removeMeteor, radius }) {
    let updateMeteor = useMeteor()
    let rot = useRef({
        x: random.float(0, Math.PI * 2),
        z: random.float(0, Math.PI * 2),
        y: random.float(0, Math.PI * 2)
    })
    let dead = useRef(false)
    let [rotationX] = useState(() => random.float(-.01, .01))
    let [rotationY] = useState(() => random.float(-.01, .01))
    let [rotationZ] = useState(() => random.float(-.01, .01))
    let [obstacleId, setObstacleId] = useState()
    let obstacle = useStore(i => i.obstacles.find(i => i.id === obstacleId))

    useEffect(() => {
        let oid = createObstacle({
            radius,
            health: radius * .5,
            x,
            y,
            z,
        })

        setObstacleId(oid)

        return () => {
            removeObstacle(oid)
        }
    }, [radius, id, x, y, z])

    useEffect(() => {
        if (obstacle?.health <= 0) {
            dead.current = true
            updateMeteor({ position: [0,0,-1000]})
            removeMeteor(id)
        }
    }, [obstacle?.health, id, updateMeteor, removeMeteor])

    useFrame(() => {
        if (dead.current) {
            return
        }

        rot.current.x += rotationX
        rot.current.y += rotationY
        rot.current.z += rotationZ

        updateMeteor({
            position: [x, y,   z],
            scale: [radius * 2, radius * 2, radius * 2],
            rotation: [rot.current.x, rot.current.y, rot.current.z]
        })
    })

    return null
}