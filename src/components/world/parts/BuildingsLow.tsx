import { WorldPartBuildingsLow } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane"
import Building from "../spawner/Building"
import { WORLD_CENTER_X } from "../World"

export default function BuildingsLow({
    id,
    position,
    size,
}: WorldPartBuildingsLow) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Building
                position={[WORLD_CENTER_X, 0, position.z + 2]}
                size={[5, 4, 5]}
            />
            <Building
                position={[WORLD_CENTER_X, 0, position.z + 8]}
                size={[5, 2, 5]}
            />
        </WorldPartWrapper>
    )
}