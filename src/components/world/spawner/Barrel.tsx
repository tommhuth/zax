import { startTransition, useEffect } from "react"
import { createBarrel, removeBarrel } from "../../../data/store"
import { Tuple3 } from "../../../types"

interface BarrelProps {
    position: Tuple3
    rotation?: number 
    health?: number
}

export default function Barrel({
    position = [0, 0, 0],
    rotation = 0,
    health,
}: BarrelProps) {
    useEffect(() => {
        let id

        startTransition(() => {
            id = createBarrel({ position, rotation, health })
        })

        return () => {
            startTransition(() => {
                removeBarrel(id)
            })
        }
    }, [...position])

    return null
}