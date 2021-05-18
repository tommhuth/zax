import { useCallback, useMemo, useRef, useState } from "react"
import random from "@huth/random"
import Model from "../../Model"
import { Only } from "../../utils"
import { SpawnFighter, SpawnTank, SpawnTurret } from "../World"
import Config from "../../data/Config"

function useGrid({ width = 24, depth = 65, size = 8 }) {
    let occupied = useRef([])
    let max = (Math.floor(width / size) + 1) * Math.floor(depth / size)
    let pick = useCallback((tick = 0) => {
        let xMax = Math.floor(width / (size))
        let zMax = Math.floor(depth / size)
        let x = random.integer(0, xMax) * size
        let z = random.integer(1, zMax - 1) * size
        let key = x + "." + z

        if (occupied.current.length === max) {
            return null
        }

        if (!occupied.current.includes(key)) {
            occupied.current.push(key)

            return {
                x: x - (size / 2) - width / 2 + 5,
                z: z + size / 2
            }
        } else {
            return pick(tick + 1)
        }
    }, [size, width, max, depth])
    let grid = useMemo(() => {
        return { pick, occupied, max }
    }, [pick, max])

    return grid
}

export default function AsteroidMediumBlock({ z, depth, hasFighter = false }) {
    let grid = useGrid({ width: 20, depth, size: 15 })
    let [scaleZ] = useState(random.pick(-1, 1))
    let [scaleX] = useState(random.pick(-1, 1))
    let deco = useMemo(() => random.pick( "wall3", "building1", "wall3", "building1", "wall3"), [])
    let turrets = useMemo(() => {
        let res = []

        for (let i = 0; i < 2; i++) {
            let position = grid.pick()

            if (!position) {
                break
            }

            res.push({
                x: position.x,
                z: position.z + z,
                y: random.pick(0, -2, 0),
            })
        }

        return res
    }, [grid, z])
    let tanks = useMemo(() => {
        let res = []

        for (let i = 0; i < 3; i++) {
            let position = grid.pick()

            if (!position) {
                break
            }

            res.push({
                x: position.x,
                z: position.z + z,
                y: 0
            })
        }

        return res
    }, [grid, z])
    let fighters = useMemo(() => {
        let res = []
        let count = random.pick(0, 2, 1)

        for (let i = 0; i < count; i++) {
            res.push({
                x: i / count * (Config.PLAYER_LEFT_EDGE + Math.abs(Config.PLAYER_RIGHT_EDGE)) - Config.PLAYER_LEFT_EDGE, // random.integer(-9, 16),
                z: z + depth - random.integer(0, 15),
                y: random.integer(10, Config.PLAYER_UPPER_EDGE),
                id: random.id()
            })
        }

        return res
    }, [depth, z])

    return (
        <>
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