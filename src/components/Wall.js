
import { useEffect } from "react"
import { createObstacle, removeObstacle } from "../data/store"
import Model from "../Model"
 
export default function Wall({ x, y = 0, z, width, height }) {
    useEffect(() => {
        let id = createObstacle({
            width,
            height,
            depth: 2,
            x,y,z
        })

        return () => {
            removeObstacle(id)
        }
    }, [width, height, x, y, z])

    return <Model name="wall1" position={[x, y, z]} />
}