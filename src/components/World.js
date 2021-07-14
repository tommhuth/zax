import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import useStore, { generateWorld } from "../data/store"
import { PlaneBufferGeometry } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import AsteroidMediumBlock from "./blocks/AsteroidMediumBlock"
import AsteroidStart from "./blocks/AsteroidStart"
import AsteroidEnd from "./blocks/AsteroidEnd"
import AsteroidForcefield from "./blocks/AsteroidForcefield"
import Starfield from "./blocks/Starfield"
import SpaceEnd from "./blocks/SpaceEnd"
import SpaceMid from "./blocks/SpaceMid"
import SpaceStart from "./blocks/SpaceStart"
import AsteroidMediumBlock2 from "./blocks/AsteroidMediumBlock2"
import SpaceMid2 from "./blocks/SpaceMid2"
import { BlockType } from "../data/block-generator"
import { AsteroidWall } from "./blocks/AsteroidWall"


export default function World() {
    let blocks = useStore(i => i.world.blocks)
    let state = useStore(i => i.state)
    let cover = useRef()
    let { viewport } = useThree()
    let playerPosition = useRef([0, 0, 0])
    let geometry = useMemo(() => {
        let right = new PlaneBufferGeometry(50, 400, 1, 1).rotateX(-Math.PI / 2).translate(-66, 18, 0)
        let left = new PlaneBufferGeometry(40, 400, 1, 1).rotateX(-Math.PI / 2).translate(25, 30, 0)

        return BufferGeometryUtils.mergeBufferGeometries([left, right])
    }, [])

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])
 

    useEffect(() => {
        let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

        if (state === "active") { 
            let id = setInterval(() => {
                if (!document.hidden) {
                    generateWorld(diagonal)
                }
            }, 300)

            generateWorld(diagonal)

            return () => {
                clearInterval(id)
            }
        } else {
            generateWorld(diagonal) 
        }
    }, [viewport, state])

    useFrame(() => {
        cover.current.position.z = playerPosition.current[2]
    })

    return (
        <>
            <mesh ref={cover} position-x={0} geometry={geometry}>
                <meshBasicMaterial color="black" />
            </mesh>

            {blocks.map(i => {
                switch (i.type) {
                    case BlockType.ASTEROID_START:
                        return <AsteroidStart {...i} key={i.id} />
                    case BlockType.ASTEROID_END:
                        return <AsteroidEnd {...i} key={i.id} />
                    case BlockType.SPACE_END:
                        return <SpaceEnd {...i} key={i.id} />
                    case BlockType.SPACE_MID:
                        return <SpaceMid {...i} key={i.id} />
                    case BlockType.SPACE_MID2:
                        return <SpaceMid2 {...i} key={i.id} />
                    case BlockType.SPACE_START:
                        return <SpaceStart {...i} key={i.id} />
                    case BlockType.ASTEROID_WALL:
                        return <AsteroidWall {...i} key={i.id} />
                    case BlockType.ASTEROID_MEDIUM_BLOCK:
                        return <AsteroidMediumBlock {...i} key={i.id} />
                    case BlockType.ASTEROID_MEDIUM_BLOCK2:
                        return <AsteroidMediumBlock2 {...i} key={i.id} />
                    case BlockType.ASTEROID_FORCEFIELD:
                        return <AsteroidForcefield {...i} key={i.id} />
                }
            })}

            <Starfield z={0} />
        </>
    )
}