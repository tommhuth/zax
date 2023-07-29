import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane"
import Building from "../spawner/Building"
import Rocket from "../spawner/Rocket"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE } from "../World"
 

export default function Default({
    id, 
    position, 
    size, 
}: WorldPartDefault) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <EdgeBuilding z={position.z + size[1] / 2} />

            <Turret 
                position={[WORLD_CENTER_X + 3, 0, position.z + 4]}
            />
            <Turret 
                position={[WORLD_CENTER_X + 3, 0, position.z + -4]}
            />
            <Building 
                position={[WORLD_CENTER_X, 0, position.z +  2]}
                size={[3, 1, 3]}
            />
            <Rocket 
                position={[WORLD_CENTER_X, -2, position.z + 6]}
            />
            <Barrel 
                position={[WORLD_CENTER_X + 3, 0, position.z +  0]}
            />
            <Barrel 
                position={[WORLD_LEFT_EDGE + 3, 0, position.z +  -4]}
            />
        </WorldPartWrapper>
    )
}