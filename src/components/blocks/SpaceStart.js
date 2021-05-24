import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import useStore, { setWarp } from "../../data/store"

export default function SpaceStart({ z, depth }) {
    let playerPosition = useRef([0, 0, 0])
    let health = useStore(i => i.player.health) 

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useFrame(() => {  
        if (playerPosition.current[2] < z + depth ) { 
            setWarp(
                health > 0
                && playerPosition.current[2] > z + depth * .5
            )
        } 
    })
 
    return (
        <> 
        </>
    )
}
 