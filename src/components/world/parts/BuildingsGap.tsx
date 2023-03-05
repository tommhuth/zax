import { useRef } from "react"
import { useForwardMotion } from "../../../utils/hooks"
import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import { Group } from "three"
import Building from "../spawner/Building"


export default function BuildingsGap({
    id,
    position,
    size: [, depth], 
    buildings = [], 
}: WorldPartBuildingsGap) {
    let ref = useRef<Group>(null) 

    useForwardMotion(ref, undefined, position.toArray())

    return (
        <WorldPartWrapper
            position={position}
            depth={depth}
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
        </WorldPartWrapper>
    )
}

/*

            <group> 
                {grid.map.map((i) => {
                    return i.map(([, position]) => {
                        return (
                            <mesh
                                position={position}
                                key={position[0] + "-" + position[2]}
                            >
                                <boxGeometry args={[grid.cellSize, 1, grid.cellSize, 1, 1]} />
                                <meshBasicMaterial color="black" wireframe />
                            </mesh>
                        )
                    })
                })}
            </group>
            */