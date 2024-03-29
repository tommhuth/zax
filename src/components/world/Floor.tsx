import { useEffect } from "react"
import { useRepeater } from "../RepeaterMesh"
import { Tuple3 } from "../../types"
import { RepeaterName } from "../../data/types"

interface FloorProps {
    position: Tuple3
    type: RepeaterName
    scale?: Tuple3
}

export default function Floor({ 
    position: [x, y, z] = [0,0,0], 
    type, 
    scale = [1,1,1] 
}: FloorProps) {
    let floor = useRepeater(type)

    useEffect(() => {
        if (floor) {
            floor.mesh.position.set(x, y, z)
            floor.mesh.scale.set(...scale)
        }
    }, [floor?.mesh])

    return null
}