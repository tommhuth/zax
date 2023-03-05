import { useFrame, useThree } from "@react-three/fiber"
import React, { useEffect } from "react"
import { Vector3 } from "three"
import { removeWorldPart } from "../../data/store"
import { useForwardMotion } from "../../utils/hooks"
import { setColorAt, setMatrixAt } from "../../utils/utils"
import { useInstance } from "../InstancedMesh"

interface Asset {
    release: () => void
}

interface WorldPartWrapperProps {
    position: Vector3
    id: string
    children?: React.ReactNode
    depth: number
    assets?: (Asset | null)[]
}

export default function WorldPartWrapper({
    position,
    children,
    depth,
    id,
    assets = []
}: WorldPartWrapperProps) {
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let [index, instance] = useInstance("box")

    useForwardMotion(position)

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, 0xFFFFFF * Math.random())
        }
    }, [index, instance])

    useFrame(() => {
        if (typeof index === "number" && instance) {
            setMatrixAt({
                instance,
                index,
                position: [position.x, position.y - 5, position.z + depth / 2],
                scale: [30, 10, depth],
            })
        }
    })

    useFrame(() => {
        if (position.z - depth > diagonal * .75) {
            removeWorldPart(id)

            assets.filter((i): i is Asset => !!i).forEach(i => i.release())
        }
    })

    return (
        <>{children}</>
    )
}