import { useMemo } from "react"
import random from "@huth/random"
import SpawnFighter from "../actors/SpawnFighter"
import Config from "../../data/Config"

export default function SpaceMid2({ z, depth }) {
    let fighters = useMemo(() => {
        let count = random.integer(1, 2)

        return new Array(count).fill().map((i, index) => {  
            return {
                id: random.id(),
                x: index / count * (16 + 9) - 9,
                y: Config.WARP_Y,
                z: z + depth - index * 10 
            }
        })
    }, [z, depth])

    return (
        <>
            {fighters.map(i => {
                return (
                    <SpawnFighter stationary {...i} key={i.id} />
                )
            })}
        </>
    )
}