import { useEffect } from "react"
import { useInstance } from "../InstancedMesh"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../utils/utils"
import { Building } from "../../data/types"

export default function Building({ size, position }: Building) {
    let [index, instance] = useInstance("box")

    useEffect(() => {
        if (typeof index === "number" && instance) {
            let pos = position.toArray()

            setColorAt(instance, index, "gray")
            setMatrixAt({
                instance,
                index,
                position: [pos[0], pos[1] + size[1] / 2, pos[2]],
                scale: size,
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }
    }, [index, instance])

    return null
}