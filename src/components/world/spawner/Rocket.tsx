import { startTransition, useEffect } from "react" 
import { Tuple3 } from "../../../types"
import { createRocket, removeRocket } from "../../../data/store/actors"

interface RocketProps {
    position: Tuple3
    health?: number
    speed?: number
}

export default function Rocket({
    position = [0, 0, 0],
    speed,
    health,
}: RocketProps) {
    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createRocket(position, speed, health)
        })

        return () => {
            startTransition(() => {
                removeRocket(id)
            })
        }
    }, [...position])

    return null
}