import { useFrame, useThree } from "react-three-fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useStore, { generateWorld, createTurret, createObstacle, removeObstacle, removeTurret, createTank, removeTank, createFighter, removeFighter } from "../data/store"
import random from "@huth/random"
import Model, { mat } from "../Model"
import Wall from "./Wall"
import { PlaneBufferGeometry } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { Only } from "../utils"

function SpawnTurret({ x, y, z, health = 2 }) {
    useEffect(() => {
        let id = createTurret(x, y, z, health)

        return () => removeTurret(id)
    }, [])

    return null
}

function SpawnTank({ x, y, z, health = 1 }) {
    useEffect(() => {
        let id = createTank(x, y, z, health)

        return () => removeTank(id)
    }, [])

    return null
}

function SpawnFighter({ x, y, z, health = 1 }) {
    useEffect(() => {
        let id = createFighter(x, y, z, health)

        return () => removeFighter(id)
    }, [])

    return null
}

function AsteroidStart({ z, depth }) {
    return (
        <>
            <SpawnTurret x={2} y={0} z={z} />
            <Model name="asttop" receiveShadow={true} castShadow={false} position={[0, 0, z + depth]} />
            <Model name="astbottom" receiveShadow={false} position={[0, 0, z + depth]} />
        </>
    )
}

function Forcefield({ y = 0, z }) {
    let [height] = useState(() => random.integer(6, 12))
    let [active] = useState(() => random.boolean())
    let [x] = useState(-8)
    let ref = useRef()
    let t = useRef(0)
    let totalHeight = 17
    let width = 28
    let wall = useMemo(() => {
        let left = random.integer(6, 12)
        let middle = random.integer(7, 12)
        let right = width - left - middle

        return [
            {
                z: z,
                y: 0,
                x: x + right / 2 - width / 2,
                width: right,
                height: height,
            },
            {
                x: x + (right + middle / 2) - width / 2,
                z: z,
                y: -4,
                width: middle,
                height: height,
            },
            {
                x: x + (right + middle + left / 2) - width / 2,
                y: 0,
                z: z,
                width: left,
                height: height,
            }
        ]
    }, [width, height, x, z])

    useEffect(() => {
        let ids = []

        if (active) {
            ids.push(
                createObstacle({
                    depth: 2,
                    width: width,
                    height: totalHeight - height - 1,
                    x,
                    y: height + .5,
                    z
                })
            )
        }

        for (let part of wall) {
            ids.push(createObstacle({
                depth: 2,
                width: part.width,
                height: height,
                x: part.x,
                y: part.y,
                z: part.z
            }))
        }

        return () => {
            removeObstacle(...ids)
        }
    }, [active, wall, height, totalHeight, width, x, z])


    useFrame(() => {
        if (!ref.current || !active) {
            return
        }

        t.current += .5
        ref.current.material.opacity = (Math.cos(t.current) + 1) / 2 * .35
    })

    return (
        <>
            <Model name="forcefield" position={[x, y, z]} />

            <Only if={active}>
                <mesh ref={ref} position={[x, height + (totalHeight - height) / 2, z]} >
                    <boxBufferGeometry args={[width, totalHeight - height, .5]} />
                    <meshBasicMaterial color="red" transparent opacity={.15} />
                </mesh>
            </Only>

            {wall.map((i, index) => {
                return (
                    <mesh material={mat} receiveShadow position={[i.x, i.y + i.height / 2, i.z]} key={index} >
                        <boxBufferGeometry args={[i.width, i.height, 2]} />
                    </mesh>
                )
            })}
        </>
    )
}

function AsteroidWall({ z }) {
    let [type] = useState(() => random.pick("simple", "simple", "simple", "fancy"))
    let [x] = useState(random.pick(-12, -8))
    let [width] = useState(() => random.integer(14, 17))
    let [height] = useState(() => random.integer(5, 8))

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
        <mesh material={mat} position={[x, height / 2, z]} >
            <boxBufferGeometry args={[width, height, 2]} />
        </mesh>
    )
}

function useGrid({ width = 20, depth = 80, size = 10 }) {
    let occupied = useRef([])
    let max = (Math.floor(width / size) + 1) * Math.floor(depth / size)
    let pick = useCallback((tick = 0) => {
        let xMax = Math.floor(width / size)
        let zMax = Math.floor(depth / size)
        let x = random.integer(0, xMax) * size
        let z = random.integer(0, zMax - 1) * size
        let key = x + "." + z

        if (occupied.current.length === max) {
            return null
        }

        if (!occupied.current.includes(key)) {
            occupied.current.push(key)

            return {
                x: x - size / 2 - width / 2 + 5,
                z: z + size / 2
            }
        } else {
            return pick(tick + 1)
        }
    }, [size, width, max, depth])
    let grid = useMemo(() => {
        return { pick, occupied, max }
    }, [pick, max])

    return grid
}

function AsteroidMediumBlock({ z, depth }) {
    let grid = useGrid({ width: 20, depth, size: 15 })
    let [scaleZ] = useState(random.pick(-1, 1))
    let [scaleX] = useState(random.pick(-1, 1))
    let deco = useMemo(() => random.pick(null, "wall3", "building1", "wall3"), [])
    let turrets = useMemo(() => {
        let res = []

        for (let i = 0; i < 2; i++) {
            let position = grid.pick()

            if (!position) {
                break
            }

            res.push({
                x: position.x,
                z: position.z + z,
                y: random.pick(0, -2, 0),
            })
        }

        return res
    }, [grid, z])
    let tanks = useMemo(() => {
        let res = []

        for (let i = 0; i < 3; i++) {
            let position = grid.pick()

            if (!position) {
                break
            }

            res.push({
                x: position.x,
                z: position.z + z,
                y: 0
            })
        }

        return res
    }, [grid, z])

    return (
        <>
            <Model name={"floor1"} position={[-18, 0, z + (scaleZ === -1 ? depth : 0)]} scale={[scaleX, 1, scaleZ]} />
            {deco ? <Model name={deco} position={[22, 0, z]} /> : null}

            {turrets.map((i, index) => <SpawnTurret key={index} {...i} />)}
            {tanks.map((i, index) => <SpawnTank key={index} {...i} />)}
        </>
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
        let { width, height } = viewport()
        let diagonal = Math.sqrt(width ** 2 + height ** 2)
        let id = setInterval(() => {
            if (!document.hidden) {
                generateWorld(diagonal)
            }
        }, 350)

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
                    case "asteroid-start":
                        return <AsteroidStart {...i} key={i.id} />
                    case "asteroid-wall":
                        return <AsteroidWall {...i} key={i.id} />
                    case "asteroid-medium-block":
                        return <AsteroidMediumBlock {...i} key={i.id} />
                    case "forcefield":
                        return <Forcefield {...i} key={i.id} />
                }
            })}
        </>
    )
}