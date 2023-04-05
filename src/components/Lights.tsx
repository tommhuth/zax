import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { DirectionalLight, PointLight } from "three"
import { useStore } from "../data/store"

export default function Lights() {
    let lightRef = useRef<DirectionalLight>(null)
    let playerLightRef = useRef<PointLight>(null)
    let explosionLightRef = useRef<PointLight>(null)
    let { scene, viewport } = useThree()
    let ticks = useRef(0)
    let explosion = useStore(i => i.explosions)
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useEffect(() => {
        if (!lightRef.current) {
            return
        }

        scene.add(lightRef.current.target)
    }, [scene])

    useEffect(()=> {
        if (explosionLightRef.current) {
            explosionLightRef.current.intensity = 22 
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

        if (playerLightRef.current && player) {
            playerLightRef.current.position.z = player.position.z + 1
            playerLightRef.current.position.y = player.position.y
            playerLightRef.current.position.x = player.position.x 
        }

        if (explosionLightRef.current) {
            explosionLightRef.current.intensity *= .9  
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
                shadow-camera-near={0} // y
                shadow-camera-far={15}
                shadow-camera-left={-8} // x
                shadow-camera-right={8}
                shadow-camera-top={diagonal * 1.5} // z
                shadow-camera-bottom={-diagonal * .5}
                shadow-mapSize={[256, 256]}
                shadow-bias={-0.001}
            />
            <pointLight 
                color={"blue"}
                intensity={5}
                ref={playerLightRef}
                distance={4}
            />
            <pointLight 
                color={"red"} 
                ref={explosionLightRef}
                position={explosion}
                distance={6}
            />
            <ambientLight intensity={.25} color="lightblue" />
        </>
    )
}