import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useMemo } from "react"
import { Matrix4, Vector3 } from "three"
import { store } from "../data/store"
import { Tuple3 } from "../types"

let _matrix = new Matrix4()

export default function Camera({ startPosition = [10, 15, 10] }: { startPosition?: Tuple3 }) {
    const { camera } = useThree()
    const basePosition = useMemo(() => new Vector3(), [])

    useLayoutEffect(() => {
        camera.position.setFromSphericalCoords(
            100,
            Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
            Math.PI / 4  // 45 degrees, between positive X and Z axes, thus on XZ-plane
        )
        camera.lookAt(0, 0, 0) 
        camera.position.x -= 2
        basePosition.copy(camera.position)
    }, [camera, ...startPosition])

    useFrame(() => {
        let { player, world } = store.getState()

        _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        world.frustum.setFromProjectionMatrix(_matrix)

        if (player.object) {
            camera.position.z = basePosition.z + player.object.position.z - 8
        }
    })

    return null
}