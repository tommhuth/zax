import { useEffect, useMemo, useState } from "react"
import { createObstacle, removeObstacle } from "../../data/store"
import random from "@huth/random"
import Model from "../../Model"
import { Only } from "../../utils"
import { SpawnTank, SpawnTurret } from "../World"

export default function AsteroidMediumBlock2({ z, depth }) {
    let [scaleZ] = useState(random.pick(1, -1))
    let [scaleX] = useState(random.pick(1, -1))
    let deco = useMemo(() => random.pick("tanks", "building1","wall3"), [])
    let positions = useMemo(() => {
        return [
            [random.pick(1, -3, -8, -15), 0, z + depth - random.integer(30, 45)],
            [random.pick(1, -3, -8, -15), 0, z + random.integer(0, 15)],
        ]
    }, [z, depth])

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
            <Model
                name="floor2"
                position={[0, 0, z]}
                scale={[1, 1, 1]}
            />
            <SpawnTurret
                x={positions[0][0]}
                y={positions[0][1]}
                z={positions[0][2]}
                health={3}
            />
            <SpawnTank
                x={positions[1][0]}
                y={positions[1][1]}
                z={positions[1][2]}
            />
            <Only if={deco}>
                <Model
                    name={deco}
                    scale={[
                        deco === "tanks" ? scaleX : 1,
                        1,
                        deco === "tanks" ? scaleZ : 1,
                    ]}
                    position={[
                        22 + (deco === "tanks" ? 20 : 0),
                        0,
                        z + (deco === "tanks" ? 45 : 13)
                    ]}
                />
            </Only>
        </>
    )
}