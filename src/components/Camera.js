import { useFrame, useThree } from "react-three-fiber"
import { useEffect, useLayoutEffect, useRef } from "react"
import useStore from "../data/store" 

export default function Camera() {
    let { camera } = useThree()
    let playerPosition = useRef([0, 15, -40])

    useLayoutEffect(() => {  
        // https://discourse.threejs.org/t/dimetric-orthographic-camera-angle-for-retro-pixel-look/24455/2
        camera.position.setFromSphericalCoords(
            10,
            -Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
            Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
        ) 
        camera.lookAt(0, 0, 0)
        camera.position.x += 14
    }, [camera])

    useEffect(() => {
        useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useFrame(() => {
        camera.position.z += (playerPosition.current[2] + 10 - camera.position.z) * .1
    })

    return null
}