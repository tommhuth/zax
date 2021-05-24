import { useEffect } from "react"
import { createTank, removeTank } from "../../data/store"

export default function SpawnTank({ x, y, z, health = 1 }) {
    useEffect(() => {
        let id = createTank(x, y, z, health)

        return () => removeTank(id)
    }, [x, y, z, health])

    return null
}