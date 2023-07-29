import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper" 
import Building from "../spawner/Building"
import Plane from "../spawner/Plane"

export default function BuildingsGap({
    id,
    position,
    size, 
}: WorldPartBuildingsGap) {  
    return (
        <WorldPartWrapper
            position={position} 
            size={size}
            id={id}
        > 
        </WorldPartWrapper>
    )
} 