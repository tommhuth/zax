import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper" 
import Building from "../spawner/Building"
import Plane from "../spawner/Plane"

export default function BuildingsGap({
    id,
    position,
    size,
    planes,
    buildings = [],
}: WorldPartBuildingsGap) {  
    return (
        <WorldPartWrapper
            position={position} 
            size={size}
            id={id}
        >
            {buildings.map(i => {
                return (
                    <Building
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