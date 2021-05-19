import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useEffect, useState, forwardRef } from "react"
import { BufferGeometry, Cache, MeshBasicMaterial, MeshLambertMaterial } from "three"

Cache.enabled = true

let gray = new MeshLambertMaterial({ color: "#ccc" }) 
let darkgray = new MeshLambertMaterial({ color: "#666" })
let black = new MeshBasicMaterial({ color: "#000" }) 
let white = new MeshBasicMaterial({ color: "#fff" }) 
let blue = new MeshLambertMaterial({ color: "#001170" })
let darkblue = new MeshLambertMaterial({ color: "#003cff" })
let loader = new GLTFLoader()
let blank = new BufferGeometry()


let map = {
    black,
    gray,
    white, 
    darkgray, 
    blue, 
    darkblue
}

export { gray }

export function useGeometry(name) {
    let [geometry, setGeometry] = useState(blank)

    useEffect(() => {
        loader.load(`/models/${name}.glb`, ({ scene }) => {

            setGeometry(scene.children[0].geometry)
        })
    }, [name])


    return geometry
}

export default forwardRef((
    {
        name,
        rotation,
        dispose = true,
        visible = true,
        scale,
        position,
        castShadow = false,
        receiveShadow = true
    },
    ref
) => {
    let [object, setObject] = useState()

    useEffect(() => {
        loader.load(`/models/${name}.glb`, ({ scene }) => {
            scene.traverse(object => {
                if (object.isMesh) {
                    object.castShadow = castShadow
                    object.receiveShadow = receiveShadow
                    object.material = map[object.material.name] || gray
                }
            })

            setObject(scene.children[0])
        })
    }, [name, castShadow, receiveShadow])


    if (!object) {
        return null
    }


    return (
        <primitive
            visible={visible}
            dispose={!dispose ? null : undefined}
            object={object}
            ref={ref}
            scale={scale}
            rotation={rotation}
            receiveShadow={receiveShadow}
            castShadow={castShadow}
            position={position}
        />
    )
})