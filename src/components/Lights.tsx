import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { DirectionalLight } from "three"

export default function Lights() {
    let lightRef = useRef<DirectionalLight>(null)
    let { scene } = useThree()

    useEffect(() => {
        if (!lightRef.current) {
            return
        }

        scene.add(lightRef.current.target)
    }, [scene])

    useFrame((state, delta) => {
        if (lightRef.current) {
            lightRef.current.position.z -= 6 * delta
            lightRef.current.target.position.z = lightRef.current.position.z
        }
    })

    return (
        <>
            <directionalLight
                color={0xffffff}
                position={[4, 14, 10]}
                intensity={.45}
            />
            <directionalLight
                ref={lightRef}
                color={0xffffff}
                position={[0, 15, 0]}
                intensity={.75}
                castShadow
                shadow-radius={1.5}
                shadow-camera-near={-1}
                shadow-camera-far={20}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-mapSize={[256, 256]}
                shadow-bias={-0.001}
            />
            <ambientLight intensity={.25} color="lightblue" />
        </>
    )
}