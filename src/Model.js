import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useEffect, useState, forwardRef } from "react"
import { BufferGeometry, Cache,MeshBasicMaterial,MeshLambertMaterial } from "three"
import { useThree } from "react-three-fiber"

Cache.enabled = true

let mat = new MeshLambertMaterial({ color: "#ccc" })
let mat2 = new MeshLambertMaterial({ color: "#ccc" })
let black = new MeshBasicMaterial({ color: "#000" })
let gray = new MeshLambertMaterial({ color: "#666" })
let blue = new MeshLambertMaterial({ color: "#003cff" })
let darkblue = new MeshLambertMaterial({ color: "#001170" })
let loader = new GLTFLoader() 
let blank = new BufferGeometry()


let map = {
    black,
    gray,blue:darkblue,darkblue:blue
}



export {mat}

export function useGeometry(name) {
    let [geometry, setGeometry] = useState(blank)

    useEffect(() => {
        loader.load(`/models/${name}.glb`, ({ scene }) => { 

            setGeometry(scene.children[0].geometry )
        })
    }, [name ])


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
    let {gl} = useThree()

    useEffect(() => { 
        loader.load(`/models/${name}.glb`, ({ scene }) => {
            scene.traverse(object => {
                if (object.isMesh) {
                    object.castShadow = castShadow
                    object.receiveShadow = receiveShadow 
                    object.material = map[object.material.name] || mat 
                }
            }) 

            setObject(scene.children[0] )
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