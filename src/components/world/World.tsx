
import { useFrame, useThree } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { createWorldPart, store, useStore } from "../../data/store"
import Turret from "./Turret"
import Plane from "./Plane"
import Default from "./parts/Default"
import Building from "./Building"
import Barrel from "./Barrel"
import ParticleHandler from "./ParticleHandler"
import BulletHandler from "./BulletHandler"
import { WorldPartDefault, WorldPartBuildingsGap, WorldPartType, WorldPartBuildingsLow } from "../../data/types"
import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Rocket from "./Rocket"

export const WORLD_CENTER_X = 1
export const WORLD_LEFT_EDGE = -2
export const WORLD_RIGHT_EDGE = 5
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1

export default function World() {
    let parts = useStore(i => i.world.parts)
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame(() => {
        let { world: { parts }, player: { object: player } } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]
        let lastPartIsAtEdge = forwardWorldPart && player && forwardWorldPart.position.z > player.position.z - diagonal

        if (lastPartIsAtEdge || !forwardWorldPart) {
            startTransition(createWorldPart)
        }
    })

    return (
        <>
            {parts.map(i => {
                switch (i.type) {
                    case WorldPartType.DEFAULT:
                        return <Default key={i.id} {...i as WorldPartDefault} />
                    case WorldPartType.BUILDINGS_GAP:
                        return <BuildingsGap key={i.id} {...i as WorldPartBuildingsGap} />
                    case WorldPartType.BUILDINGS_LOW:
                        return <BuildingsLow key={i.id} {...i as WorldPartBuildingsLow} />
                    default:
                        throw new Error(`Unknown type: ${i.type}`)
                }
            })}

            <Parts />
            <ParticleHandler />
            <BulletHandler />
        </>
    )
}


const Parts = memo(() => {
    let barrels = useStore(i => i.barrels)
    let buildings = useStore(i => i.buildings)
    let turrets = useStore(i => i.turrets)
    let planes = useStore(i => i.planes)
    let rockets = useStore(i => i.rockets)

    return (
        <>
            {buildings.map(i => {
                return <Building key={i.id} {...i} />
            })}
            {turrets.map(i => {
                return <Turret key={i.id} {...i} />
            })}
            {planes.map(i => {
                return <Plane key={i.id} {...i} />
            })}
            {barrels.map(i => {
                return <Barrel key={i.id} {...i} />
            })}
            {rockets.map(i => {
                return <Rocket key={i.id} {...i} />
            })}
        </>
    )
})