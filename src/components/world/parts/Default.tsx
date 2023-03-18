import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane"
import Building from "../spawner/Building"

export default function Default({
    id,
    barrels,
    buildings,
    position,
    turrets,
    planes,
    size,
}: WorldPartDefault) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <EdgeBuilding z={position.z + size[1] / 2} />

            {turrets.map(i => {
                return (
                    <Turret
                        key={i.id}
                        position={i.position}
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
                        position={i.position}
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