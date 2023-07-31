import { useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { Mesh, MeshBasicMaterial, MeshLambertMaterial, Object3D } from "three"
import { requestRepeater, setRepeater, useStore } from "../data/store"

export function useRepeater(name: string) {
    let [repeater, setRepeater] = useState<Object3D | null>(null)
    let hasRepeater = useRef(false)
    let hasData = !!useStore(i => i.repeaters[name])

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
        release() {
            if (!repeater) {
                return
            }
            
            repeater.visible = false
            repeater.position.set(-1000,-1000,-1000)
        }
    }
}

const materials = {
    darkgray: new MeshLambertMaterial({ color: "#333", dithering: true }),
    gray: new MeshLambertMaterial({ color: "#eee", dithering: true }),
    "": new MeshBasicMaterial({ color: "red", dithering: true }),

}

export default function RepeaterMesh({ name, count, object }: { object: Object3D, name: string, count: number }) {
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

        let reps = new Array(count).fill(null).map(() => object.clone())

        reps.forEach(i => {
            i.visible = false
        })


        scene.add(...reps)

        setRepeater(name, reps, count)
    }, [object])

    return null
}