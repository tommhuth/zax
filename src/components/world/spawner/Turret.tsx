import { useEffect, startTransition } from "react" 
import { Tuple3 } from "../../../types"
import { createTurret, removeTurret } from "../../../data/store/actors"

interface TurretProps {
    position?: Tuple3
    fireFrequency?: number
}

export default function Turret({
    fireFrequency,
    position = [0, 0, 0]
}: TurretProps) {
    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createTurret(fireFrequency, position)
        })

        return () => {
            removeTurret(id)
        }
    }, [fireFrequency, ...position])

    return null
}