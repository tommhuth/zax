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

export default function InstancedMesh({ children, count, name, userData = {} }) {
    let colors = useMemo(() => new Float32Array(count * 3).fill(1), []) 
 

    return (
        <instancedMesh
            args={[undefined, undefined, count]}
            castShadow
            userData={{...userData, type: name }}
            receiveShadow
            ref={(mesh) => {
                if (mesh && mesh !== store.getState().instances[name]?.mesh) {
                    setInstance(name, mesh, count)

                    for (let i = 0; i < count; i++) {
                        setMatrixAt({ instance: mesh, index: i, scale: [0,0,0] })
                    }
                }
            }}
        >
            <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
            {children}
        </instancedMesh>
    )
}