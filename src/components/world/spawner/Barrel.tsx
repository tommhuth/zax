import { startTransition, useEffect } from "react" 
import { Tuple3 } from "../../../types"
import { createBarrel, removeBarrel } from "../../../data/store/world"

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
        let id: string  

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