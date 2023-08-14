import { startTransition, useEffect } from "react" 
import { Tuple3 } from "../../../types"
import { createPlane, removePlane } from "../../../data/store/actors"

interface PlaneProps {
    position: Tuple3
    fireFrequency?: number
    speed?: number
}

export default function Plane({
    position = [0, 0, 0],
    speed,
    fireFrequency,
}: PlaneProps) {
    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createPlane(position, speed, fireFrequency)
        })

        return () => {
            startTransition(() => {
                removePlane(id)
            })
        }
    }, [...position])

    return null
}