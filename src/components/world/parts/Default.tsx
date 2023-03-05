import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper" 
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane" 

export default function Default({
    id,
    barrels, 
    position,
    turrets,
    planes, 
    size: [, depth]
}: WorldPartDefault) {
    return (
        <WorldPartWrapper
            depth={depth}
            position={position}
            id={id}
        >
            <EdgeBuilding z={position.z + depth / 2} />

            {turrets.map(i => {
                return (
                    <Turret
                        key={i.id}
                        position={i.position}
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