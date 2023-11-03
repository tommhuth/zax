import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Plane from "../spawner/Plane"
import { WORLD_CENTER_X, WORLD_TOP_EDGE } from "../World" 
import Floor from "../Floor" 

export default function Airstrip({
    id,
    position,
    size,
}: WorldPartAirstrip) { 
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Floor
                type={"floor4"}
                position={[position.x + WORLD_CENTER_X, 0, position.z - size[1] / 2]}
            />
            <EdgeBuilding type="hangar" z={position.z - 17.85} x={3} />
            <Plane
                position={[0, .5, position.z - size[1]]}
            />
            <Plane
                position={[4, WORLD_TOP_EDGE - 3, position.z - size[1] + 10]}
            />
            <Plane
                position={[-4, WORLD_TOP_EDGE  - 1, position.z - size[1] - 1]}
            />
        </WorldPartWrapper>
    )
}