import { useEffect } from "react"
import { useInstance } from "../InstancedMesh"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { Building } from "../../data/types"

export default function Building({ size, position }: Building) {
    let [index, instance] = useInstance("box")

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, "gray")
            setMatrixAt({
                instance,
                index,
                position: [position.x, position.y, position.z],
                scale: size,
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, instance])

    return null
}