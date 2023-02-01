
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { addWorldPart, createBuilding, createPlane, createTurret, store, useStore } from "../data/store"
import random from "@huth/random" 
import Turret from "./Turret"
import Plane from "./Plane"
import Section from "./Section"
import Building from "./Building"
import { Tuple3 } from "../types"
import ParticleHandler from "./ParticleHandler"
import BulletHandler from "./BulletHandler"

export const WORLD_LEFT_EDGE = -5
export const WORLD_RIGHT_EDGE = 5
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1.5 

export default function World() {
    let parts = useStore(i => i.world.parts)
    let buildings = useStore(i => i.buildings)
    let turrets = useStore(i => i.turrets)
    let planes = useStore(i => i.planes)
    let { viewport } = useThree()

    useFrame(() => {
        let [forwardWorldPart] = store.getState().world.parts

        if (forwardWorldPart.position.z > -viewport.width / 2) {
            addWorldPart() 
        }
    })

    useEffect(() => {
        let spawn = () => {
            let x = random.float(WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE)
            let size = [random.float(.5, 6), random.float(1.5, 5), random.float(.5, 5)] as Tuple3

            if (random.boolean(.8)) {
                createPlane([random.float(-4, 4), WORLD_TOP_EDGE, -30])
            }

            if (random.boolean(.8)) {
                createBuilding(size, [x, size[1] / 2, -15])
            }

            if (random.boolean(.8)) {
                createTurret(1000, [random.float(-6, 6), 0, -15])
            }
        }
        let id = setInterval(spawn, 1000)
        let onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                clearInterval(id)
            } else {
                id = setInterval(spawn, 1500)
            }
        }

        createTurret(1000, [0, 0, -10])
        createPlane([0, 5, -25])
        createBuilding([5, 5, 5], [-5, 1, -10])

        document.addEventListener("visibilitychange", onVisibilityChange)

        return () => {
            clearInterval(id)
            document.removeEventListener("visibilitychange", onVisibilityChange)
        }
    }, [])

    return (
        <>
            {parts.map(i => {
                return <Section key={i.id} {...i} />
            })}
            {buildings.map(i => {
                return <Building key={i.id} {...i} />
            })}
            {turrets.map(i => {
                return <Turret key={i.id} {...i} />
            })}
            {planes.map(i => {
                return <Plane key={i.id} {...i} />
            })}

            <ParticleHandler />
            <BulletHandler />
        </>
    )
}