import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { DirectionalLight, PointLight } from "three"
import { useStore } from "../data/store"  

export default function Lights() {
    let lightRef = useRef<DirectionalLight>(null) 
    let explosionLightRef = useRef<PointLight>(null)
    let { scene, viewport } = useThree()
    let ticks = useRef(0)
    let explosion = useStore(i => i.explosions[0])
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useEffect(() => {
        if (!lightRef.current) {
            return
        }

        scene.add(lightRef.current.target)
    }, [scene])

    useEffect(() => {
        if (explosionLightRef.current && explosion) {
            explosionLightRef.current.intensity = 30
            explosionLightRef.current.position.set(
                explosion.position[0],
                explosion.position[1] + 2,
                explosion.position[2],
            )
        } 
    }, [explosion])

    useFrame((state, delta) => {
        let player = useStore.getState().player.object

        if (lightRef.current && player && ticks.current > 1500) {
            lightRef.current.position.z = player.position.z
            lightRef.current.target.position.z = player.position.z
            ticks.current = 0
        } else {
            ticks.current += delta * 1000
        }

        if (explosionLightRef.current) {
            explosionLightRef.current.intensity *= .8
        }
    })

    return (
        <>
            <directionalLight
                color={0xddddff}
                position={[4, 14, 10]}
                intensity={.55}
            />
            <directionalLight
                ref={lightRef}
                color={0xffffff}
                position={[0, 15, 0]}
                intensity={.7}
                castShadow
                shadow-radius={1.5}
                shadow-camera-near={0} // y
                shadow-camera-far={15}
                shadow-camera-left={-8} // x
                shadow-camera-right={8}
                shadow-camera-top={diagonal * 1.5} // z
                shadow-camera-bottom={-diagonal * .5}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            /> 
            <pointLight
                color={"blue"}
                ref={explosionLightRef}
                distance={8}
            />
            <ambientLight intensity={.2} color="lightblue" />
        </>
    )
}