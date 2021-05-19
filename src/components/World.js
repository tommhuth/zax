import { useFrame, useThree } from "react-three-fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import useStore, { generateWorld, createTurret, createObstacle, removeObstacle, removeTurret, createTank, removeTank, createFighter, removeFighter } from "../data/store"
import random from "@huth/random"
import Model, { gray } from "../Model"
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

export function SpawnTurret({ x, y, z, health = 2 }) {
    useEffect(() => {
        let id = createTurret(x, y, z, health)

        return () => removeTurret(id)
    }, [])

    return null
}

export function SpawnTank({ x, y, z, health = 1 }) {
    useEffect(() => {
        let id = createTank(x, y, z, health)

        return () => removeTank(id)
    }, [])

    return null
}

export function SpawnFighter({ x, y, z, stationary = false, straight = false }) {
    useEffect(() => {
        let id = createFighter(x, y, z, stationary, straight)

        return () => removeFighter(id)
    }, [])

    return null
}


function AsteroidWall({ z }) {
    let [type] = useState(() => random.pick("simple"))
    let [x] = useState(random.pick(-12, -8))
    let [width] = useState(() => random.integer(12, 20))
    let [height] = useState(() => random.integer(5, 6))

    useEffect(() => {
        let id

        if (type === "fancy") {
            id = createObstacle({
                width: 35,
                height: 11,
                depth: 2,
                x,
                y: 0,
                z
            })
        } else {
            id = createObstacle({
                width,
                height,
                depth: 2,
                x,
                y: 0,
                z
            })
        }

        return () => {
            removeObstacle(id)
        }
    }, [type, height, width, x, z])

    if (type === "fancy") {
        return <Model name="wall1" position={[x, 0, z]} />
    }

    return (
        <mesh material={gray} position={[x, height / 2, z]} >
            <boxBufferGeometry args={[width, height, 2]} />
        </mesh>
    )
}


export default function World() {
    let { gl } = useThree()
    let blocks = useStore(i => i.world.blocks)
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
        let id = setInterval(() => {
            if (!document.hidden) {
                generateWorld(diagonal)
            }
        }, 300)

        generateWorld(diagonal)

        return () => {
            clearInterval(id)
        }
    }, [viewport])

    useFrame(() => {
        cover.current.position.z = playerPosition.current[2]
    })

    useFrame(() => {
        document.getElementById("rc").innerText = gl.info.render.calls
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