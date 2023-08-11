import { useEffect, startTransition } from "react"
import { createBuilding, removeBuilding } from "../../../data/store"
import { Tuple3 } from "../../../types"


interface BuildingProps {
    position?: Tuple3
    size?: Tuple3
}

export default function Building({
    size = [1, 1, 1],
    position = [0, 0, 0]
}: BuildingProps) {
    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createBuilding(size, position)
        })

        return () => {
            removeBuilding(id)
        }
    }, [...size, ...position])

    return null
}