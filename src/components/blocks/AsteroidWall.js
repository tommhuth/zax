import random from "@huth/random"
import { useEffect, useState } from "react"
import { createObstacle, removeObstacle } from "../../data/store"
import Model, { gray } from "../../Model"

export function AsteroidWall({ z }) {
    let [type] = useState(() => random.pick("simple"))
    let [x] = useState(random.pick(-18, -5))
    let [width] = useState(() => random.pick(14, 18, 24))
    let [height] = useState(() => random.integer(4, 5, 6))

    useEffect(() => {
        let id

        if (type === "fancy") {
            id = createObstacle({
                width: 35,
                height: 11,
                depth: 2,
                x,
                y: 0,
                z
            })
        } else {
            id = createObstacle({
                width,
                height,
                depth: 2,
                x,
                y: 0,
                z
            })
        }

        return () => {
            removeObstacle(id)
        }
    }, [type, height, width, x, z])

    if (type === "fancy") {
        return <Model name="wall1" position={[x, 0, z]} />
    }

    return (
        <mesh material={gray} position={[x, height / 2, z]} >
            <boxBufferGeometry args={[width, height, 2]} />
        </mesh>
    )
}