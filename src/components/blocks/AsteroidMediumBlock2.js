import { useEffect, useMemo, useRef, useState } from "react"
import { createObstacle, removeObstacle } from "../../data/store"
import random from "@huth/random"
import Model from "../../Model"
import { getGrid, Only } from "../../utils"
import SpawnTurret from "../actors/SpawnTurret"
import SpawnTank from "../actors/SpawnTank"
import Config from "../../data/Config"

export default function AsteroidMediumBlock2({ z, depth }) {
    let index = useRef(0)
    let [scaleZ] = useState(random.pick(1, -1))
    let grid = useMemo(() => getGrid({
        width: 16,
        depth: depth - 10,
        z: z - 10,
        remove: [0, 2]
    }), [z, depth])
    let [scaleX] = useState(random.pick(1, -1))
    let deco = useMemo(() => random.pick("tanks"), [])
    let decoPosition = useMemo(() => {
        return [
            36 + random.integer(-6, 4),
            0,
            z + 44 + random.integer(-4, 4)
        ]
    }, [z])
    let turrets = useMemo(() => {
        let res = []
        let count = random.integer(1, 2)

        for (let i = 0; i < count; i++) {
            let { position } = grid[index.current++]

            res.push({
                x: position[0],
                y: position[1],
                z: position[2],
            })
        }

        return res
    }, [grid])
    let tanks = useMemo(() => {
        let res = []
        let count = random.integer(1, 2)

        for (let i = 0; i < count; i++) {
            let { position } = grid[index.current++]

            res.push({
                x: position[0],
                y: position[1],
                z: position[2],
            })
        }

        return res
    }, [grid])

    useEffect(() => {
        let ids = [
            createObstacle({
                depth: 2,
                width: 40,
                height: 2,
                x: -15,
                y: 2,
                z: z + 40
            }),
            createObstacle({
                depth: 28,
                width: 6,
                height: 2,
                x: 7,
                y: 2,
                z: z + 25
            }),
            createObstacle({
                depth: 30,
                width: 4,
                height: 2,
                x: 12,
                y: 4,
                z: z + 30
            }),
            createObstacle({
                depth: 2,
                width: 45,
                height: 2,
                x: -13,
                y: 4,
                z: z + 45
            })
        ]

        return () => {
            removeObstacle(...ids)
        }
    }, [z])

    return (
        <>
            <Only if={Config.DEBUG}>
                {grid.map((i, index) => {
                    return (
                        <mesh key={index} position={i.position}>
                            <boxBufferGeometry args={[i.size, 1, i.size]} />
                            <meshBasicMaterial wireframe color="red" />
                        </mesh>
                    )
                })}
            </Only>

            <Model
                name="floor2"
                position={[0, 0, z]}
                scale={[1, 1, 1]}
            />

            {turrets.map((i, index) => <SpawnTurret key={index} {...i} />)}
            {tanks.map((i, index) => <SpawnTank key={index} {...i} />)}

            <Model
                name={deco}
                scale={[
                    scaleX,
                    1,
                    scaleZ,
                ]}
                position={decoPosition}
            />
        </>
    )
}