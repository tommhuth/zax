import { useThree } from "react-three-fiber"
import { useEffect, useRef } from "react"
import useStore from "../data/store"

export default function Lights() {
    let { scene, viewport } = useThree()
    let ref = useRef()
    let ref2 = useRef()

    useEffect(() => {
        ref.current.target.position.set(0, -1, 0)
        scene.add(ref.current.target)

        ref2.current.target.position.set(5, -1, 1)
        scene.add(ref2.current.target) 
    }, [scene])

    useEffect(() => {
        return useStore.subscribe(([, , z]) => {
            ref.current.position.z = z
            ref.current.target.position.z = z 
            ref.current.shadow.camera.updateMatrixWorld()
            ref.current.updateMatrixWorld()
        }, store => store.player.position)
    }, [])

    useEffect(() => {
        let size = 38 
        let diag = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

        ref.current.shadow.camera.near = -size * .5
        ref.current.shadow.camera.far = size * .5
        ref.current.shadow.camera.left = -size * .85
        ref.current.shadow.camera.right = size * 1.125
        ref.current.shadow.camera.top = diag * .45
        ref.current.shadow.camera.bottom = -diag * .85
        ref.current.shadow.bias = .001
        ref.current.shadow.mapSize.set(512, 512)

        ref.current.shadow.camera.updateMatrixWorld()
        ref.current.updateMatrixWorld()
        
        /*
        let g = new CameraHelper(ref.current.shadow.camera)
 
        scene.add(g)
        */
    }, [viewport])


    return (
        <>
            <directionalLight
                castShadow
                ref={ref}
                onUpdate={(self) => self.updateMatrixWorld()}
                intensity={.1}
                color={0xffffff}
            />
            <directionalLight
                ref={ref2}
                onUpdate={(self) => self.updateMatrixWorld()}
                intensity={1.9}
                color={"blue"}
            />
            <hemisphereLight intensity={.6} groundColor={"#0000ff"} color={"#77eeff"} />
        </>
    )
}