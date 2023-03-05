import { useEffect, startTransition } from "react"
import { createTurret, removeTurret } from "../../../data/store"
import { Tuple3 } from "../../../types"

interface TurretProps {
    position?: Tuple3
    fireFrequency?: number
}

export default function Turret({
    fireFrequency,
    position = [0, 0, 0]
}: TurretProps) {
    useEffect(() => {
        let id

        startTransition(() => {
            id = createTurret(fireFrequency, position)
        })

        return () => {
            removeTurret(id)
        }
    }, [fireFrequency, ...position])

    return null
}