import { useEffect } from "react"
import { useInstance } from "../InstancedMesh"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { Building } from "../../data/types"
import random from "@huth/random"

export default function Building({ size, position }: Building) {
    let type = size[1] > 1 ? "device" : "device"
    let [index, instance] = useInstance("device")

    useEffect(() => {
        if (typeof index === "number" && instance) {  
            setColorAt(instance, index, "#333")
            setMatrixAt({
                instance,
                index,
                position: [position.x, position.y, position.z],
                scale: size, 
                rotation: [
                    random.pick(0, Math.PI),
                    size[0] === size[2] ? random.pick(0, Math.PI * .5, Math.PI * 1.5) : random.pick(0, Math.PI),
                    random.pick(0, Math.PI),
                ] 
            }) 

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, instance])

    return null
}