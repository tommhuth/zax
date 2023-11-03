import { useEffect } from "react"
import { useInstance } from "../../InstancedMesh"
import { setMatrixAt } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types"

interface PlantProps {
    position: Tuple3
    scale: Tuple3 | number
}

export default function Plant({ position = [0,0,0], scale = 1 }: PlantProps) {
    let [index, instance] = useInstance("plant")

    useEffect(() => {
        if (index) {
            setMatrixAt({
                instance,
                index,
                scale,
                rotation: [0, random.float(0, Math.PI * 2), 0],
                position,
            }) 
        }
    }, [index, instance])

    return null
}