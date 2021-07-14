import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useEffect, useState, forwardRef } from "react"
import { BufferGeometry, Cache, MeshPhongMaterial } from "three"

Cache.enabled = true

let gray = new MeshPhongMaterial({ color: "#2d4e9c", shininess: 1 }) 
let darkgray = new MeshPhongMaterial({ color: "#05204a", shininess: 1 })
let black = new MeshPhongMaterial({ color: "#000", shininess: 1 }) 
let white = new MeshPhongMaterial({ color: "#fff", shininess: 1 }) 
let blue = new MeshPhongMaterial({ color: "rgb(5,5,153)", shininess: 1 })
let darkblue = new MeshPhongMaterial({ color: "rgb(2,7,68)", shininess: 1 })
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