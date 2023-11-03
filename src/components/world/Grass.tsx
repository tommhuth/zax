import { useEffect } from "react"
import { useInstance } from "../InstancedMesh"
import { setMatrixAt, setMatrixNullAt } from "../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../types"

interface GrassProps {
    position:Tuple3
}

export default function Grass({  
    position
}: GrassProps) {
    let [index, instance] = useInstance("grass")
    
    useEffect(()=> {
        if (typeof index === "number" ) {
            let flip = random.pick(-1, 1)

            setMatrixAt({
                index,
                instance, 
                rotation: [0,  random.pick(-.5, .25, 0, .25, .5), 0], 
                scale: [flip, 1.75, flip],
                position
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }

    }, [index])

    return null 
}