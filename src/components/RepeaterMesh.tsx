import { useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import { Mesh, MeshBasicMaterial, MeshLambertMaterial, Object3D } from "three"
import { useStore } from "../data/store"
import { requestRepeater, setRepeater } from "../data/store/utils"
import { RepeaterName } from "../data/types"

export function useRepeater(name: RepeaterName) {
    let [repeater, setRepeater] = useState<Object3D | null>(null)
    let hasRepeater = useRef(false)
    let hasData = !!useStore(i => i.repeaters[name])
    let release = useCallback(() => {
        if (!repeater) {
            return
        }
        
        repeater.visible = false
        repeater.position.set(0, 0, 100_000)
    }, [repeater])

    useEffect(()=> {
        if (repeater) {
            return () => release()
        }
    }, [repeater, release])

    useEffect(() => {
        if (!hasRepeater.current && hasData) { 
            setRepeater(requestRepeater(name))
            hasRepeater.current = true
        }
    }, [hasData])   

    if (!repeater) {
        return null
    }

    return {
        mesh: repeater,
        release
    }
}

const materials = {
    darkgray: new MeshLambertMaterial({ color: "#333", dithering: true }),
    gray: new MeshLambertMaterial({ color: "#eee", dithering: true }),
    "": new MeshBasicMaterial({ color: "red", dithering: true }),
}

interface RepeaterMeshProps {
    object: Object3D
    name: RepeaterName
    count: number 
}

export default function RepeaterMesh({ name, count, object }: RepeaterMeshProps) {
    let { scene } = useThree()

    useEffect(() => {
        if (!object) {
            return
        }

        object.traverse(i => {
            if (i instanceof Mesh) {
                i.material = materials[i.material.name]
            }
        })

        let list = new Array(count).fill(null).map(() => object.clone())

        list.forEach(i => {
            i.visible = false
        })

        scene.add(...list)

        setRepeater(name, list, count)
    }, [object])

    return null
}