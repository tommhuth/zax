import { useEffect, useMemo, useState } from "react"
import { setInstance, store, useStore } from "../data/store"
import { setMatrixAt } from "../utils/utils"

export function useInstance(name: string) {
    let instance = useStore(i => i.instances[name])
    let [index, setIndex] = useState<null | number>(null)

    useEffect(() => {
        if (instance) {
            setIndex(instance.index.next())
        }
    }, [instance])

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