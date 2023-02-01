import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useMemo } from "react"
import { Vector3 } from "three"
import { setCameraShake, store } from "../data/store"
import { Tuple3 } from "../types"

export default function Camera({
    startPosition = [10, 15, 10]
}: { startPosition?: Tuple3 }) {
    const { camera } = useThree()
    const basePosition = useMemo(() => new Vector3(), [])
 
    useLayoutEffect(() => {
        camera.position.setFromSphericalCoords(
            10,
            Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
            Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
        )
        camera.lookAt(0, 0, 0)
        camera.position.x -= 2.5
        basePosition.copy(camera.position)
    }, [camera, ...startPosition])

    useFrame(() => {
        let shake = store.getState().player.cameraShake

        camera.position.x = basePosition.x + shake * Math.random()
        camera.position.z = basePosition.z + shake * Math.random()

        setCameraShake(shake * .9)
    })

    return null
}