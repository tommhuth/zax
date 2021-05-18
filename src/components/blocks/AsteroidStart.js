import { useState } from "react"
import random from "@huth/random"
import Model from "../../Model"
import { SpawnTurret } from "../World"

export default function AsteroidStart({ z, depth }) {
    const [x] = useState(() => random.integer(-8, 8))

    return (
        <>
            <SpawnTurret x={x} y={0} z={z + depth / 2} />
            <Model name="asttop" receiveShadow={true} castShadow={false} position={[2, 0, z + depth]} />
            <Model name="astbottom" receiveShadow={false} position={[2, 0, z + depth]} />
        </>
    )
}