import { WorldPartBuildingsLow } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper" 
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane"
import Building from "../spawner/Building"

export default function BuildingsLow({
    id,
    barrels, 
    position,
    turrets,
    planes, 
    buildings,
    size: [, depth]
}: WorldPartBuildingsLow) {
    return (
        <WorldPartWrapper
            depth={depth}
            position={position}
            id={id}
        > 

            {turrets.map(i => {
                return (
                    <Turret
                        key={i.id}
                        {...i}
                    />
                )
            })}
            {buildings.map(i => {
                return (
                    <Building
                        key={i.id}
                        {...i}
                    />
                )
            })}
            {barrels.map(i => {
                return (
                    <Barrel
                        key={i.id}
                        {...i}
                    />
                )
            })}
            {planes.map(i => {
                return (
                    <Plane
                        key={i.id}
                        {...i}
                    />
                )
            })} 
        </WorldPartWrapper>
    )
}