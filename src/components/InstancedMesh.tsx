import { useEffect, useMemo, useState } from "react"
import { setInstance, store, useStore } from "../data/store"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../utils/utils"
import { ColorRepresentation, Vector3 } from "three"
import { Tuple3, Tuple4 } from "../types"

interface UseInstanceOptions {
    reset?: boolean
    color?: ColorRepresentation
    scale?: Tuple3 | number
    rotation?: Tuple3 | Tuple4
    position?: Vector3 | Tuple3
}

export function useInstance(name: string, { reset = true, color, scale, rotation, position }: UseInstanceOptions = {}) {
    let instance = useStore(i => i.instances[name])
    let [index, setIndex] = useState<null | number>(null)

    useEffect(() => {
        if (typeof index === "number" && instance && (position || rotation || scale)) {
            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position instanceof Vector3 ? position.toArray() : position,
                scale,
                rotation,
            })
        }
    }, [index, instance])

    useEffect(() => {
        if (instance) {
            setIndex(instance.index.next())
        }
    }, [instance])

    useEffect(() => {
        if (typeof index === "number" && instance && reset) {
            return () => {
                setMatrixNullAt(instance.mesh, index as number)
            }
        }
    }, [index, instance])

    useEffect(() => {
        if (instance && typeof index === "number" && color) {
            setColorAt(instance.mesh, index, color)
        }
    }, [index, color, instance])

    return [index, instance?.mesh] as const
}

export default function InstancedMesh({
    children,
    receiveShadow = true,
    castShadow = true,
    colors = true,
    count,
    name,
    userData = {}
}) {
    let colorData = useMemo(() => new Float32Array(count * 3).fill(1), [])

    return (
        <instancedMesh
            args={[undefined, undefined, count]}
            castShadow={castShadow}
            userData={{ ...userData, type: name }}
            receiveShadow={receiveShadow}
            ref={(mesh) => {
                if (mesh && mesh !== store.getState().instances[name]?.mesh) {
                    setInstance(name, mesh, count)

                    for (let i = 0; i < count; i++) {
                        setMatrixAt({ instance: mesh, index: i, scale: 0 })
                    }
                }
            }}
            frustumCulled={false}
        >
            {colors ? <instancedBufferAttribute attach="instanceColor" args={[colorData, 3]} /> : null}
            {children}
        </instancedMesh>
    )
}