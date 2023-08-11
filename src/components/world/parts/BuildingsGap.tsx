import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"  
import Plane from "../spawner/Plane"
import Turret from "../spawner/Turret"

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
            <Plane position={[3, 4, position.z - size[1]]} />
            <Plane position={[-3, 4, position.z - size[1] - 4]} />
            <Turret position={[0, 0, position.z - size[1] / 2]} />
        </WorldPartWrapper>
    )
} 