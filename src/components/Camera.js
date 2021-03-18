import {  useFrame, useThree } from "react-three-fiber"
import { useEffect, useLayoutEffect, useRef } from "react"
import useStore from "../data/store"

export default function Camera() {
    let { camera } = useThree()
    let playerPosition = useRef([0, 15, -40])

    useLayoutEffect(() => {
        // magic numbers!!, only works to right :/
        camera.position.set(-10, 8.2925, -30) //set(-10, 8.2925, -30) // 8.2925
        camera.lookAt(0, 0, -20)  // 20.17 
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