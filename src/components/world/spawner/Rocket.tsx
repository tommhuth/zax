import { startTransition, useEffect } from "react"
import {  createRocket, removeRocket } from "../../../data/store"
import { Tuple3 } from "../../../types"

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
        let id

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