import { useCallback, useEffect, useMemo, useRef, useState } from "react" 
import random from "@huth/random" 
import { SpawnFighter } from "../World"
import Config from "../../data/Config"

export default function SpaceMid2({ z, depth }) { 
    let meteors = useMemo(() => {
        let count = random.integer(1, 4)

        return new Array(count).fill().map((i, index) => {
            return {
                id: random.id(),
                x: index / count * (16+9) - 9, 
                y: Config.WARP_Y,
                z: z + random.integer(0, depth)
            }
        })
    }, [z, depth]) 

    return (
        <>
            {meteors.map(i => {  
                return (
                    <SpawnFighter stationary   {...i} key={i.id} />
                )
            })}
        </>
    )
} 