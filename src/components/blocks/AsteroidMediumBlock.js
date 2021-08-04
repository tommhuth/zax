import { useMemo, useRef, useState } from "react"
import random from "@huth/random"
import Model from "../../Model"
import { cyclic, getGrid, Only } from "../../utils"
import SpawnFighter from "../actors/SpawnFighter"
import SpawnTank from "../actors/SpawnTank"
import SpawnTurret from "../actors/SpawnTurret"
import Config from "../../data/Config"


let decoCycleNext = cyclic(["hangar", "building1", "building2", "building3"])

export default function AsteroidMediumBlock({ z, depth, hasFighter = false }) {
    let index = useRef(0)
    let grid = useMemo(() => getGrid({ width: 24, depth, z }), [z, depth])
    let [scaleZ] = useState(random.pick(-1, 1))
    let [scaleX] = useState(random.pick(-1, 1))
    let deco = useMemo(() => decoCycleNext(), [])
    let turrets = useMemo(() => {
        let res = []
        let count = random.integer(1, 3)

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
        let count = random.integer(0, 2)

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
    let fighters = useMemo(() => {
        let res = []
        let count = random.pick(0, 2, 1)

        for (let i = 0; i < count; i++) { 

            res.push({
                x: i / count * (Config.PLAYER_LEFT_EDGE + Math.abs(Config.PLAYER_RIGHT_EDGE)) - Config.PLAYER_LEFT_EDGE, // random.integer(-9, 16),
                z: z + depth - i * 10,
                y: 12,
                id: random.id()
            })
        }

        return res
    }, [depth, z])

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
            <Only if={hasFighter}>
                {fighters.map(i => {
                    return (
                        <SpawnFighter
                            x={i.x}
                            z={i.z}
                            y={i.y}
                            key={i.id}
                        />
                    )
                })}

            </Only>
            <Model
                name={"floor1"}
                position={[-18, 0, z + (scaleZ === -1 ? depth : 0)]}
                scale={[scaleX, 1, scaleZ]}
            />
            {deco ? <Model name={deco} position={[22, 0, z]} /> : null}

            {turrets.map((i, index) => <SpawnTurret key={index} {...i} />)}
            {tanks.map((i, index) => <SpawnTank key={index} {...i} />)}
        </>
    )
}