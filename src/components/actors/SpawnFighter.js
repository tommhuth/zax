import { useEffect } from "react"
import { createFighter, removeFighter } from "../../data/store"

export default function SpawnFighter({ x, y, z, stationary = false, straight = false }) {
    useEffect(() => {
        let id = createFighter(x, y, z, stationary, straight)

        return () => removeFighter(id)
    }, [x, y, z, stationary, straight])

    return null
}