import { useEffect } from "react"
import { createTurret, removeTurret } from "../../data/store"
import { cyclic } from "../../utils"

let nextY = cyclic([-2, 0, 2, 4], 0)

export default function SpawnTurret({ x, y, z, health = 2, fixedY = false }) {
    useEffect(() => { 
        let id = createTurret(x, y + nextY(), z, health) 

        return () => removeTurret(id)
    }, [fixedY, x, y, z, health])

    return null
}