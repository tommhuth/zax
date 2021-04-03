import { useFrame, useThree } from "react-three-fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useStore, { generateWorld, createTurret, createObstacle, removeObstacle, removeTurret, createTank, removeTank, createFighter, removeFighter, BlockType, removeBullet } from "../../data/store"
import random from "@huth/random"
import Model, { mat } from "../../Model"
import Wall from "../Wall"
import { Matrix4, PlaneBufferGeometry, Vector3 } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { Only } from "../../utils"
import { useMeteor } from "../Models"
import { SpawnTank, SpawnTurret } from "../World"

function useGrid({ width = 24, depth = 65, size = 8 }) {
    let occupied = useRef([])
    let max = (Math.floor(width / size) + 1) * Math.floor(depth / size)
    let pick = useCallback((tick = 0) => {
        let xMax = Math.floor(width / (size))
        let zMax = Math.floor(depth / size)
        let x = random.integer(0, xMax) * size
        let z = random.integer(1, zMax - 1) * size
        let key = x + "." + z

        if (occupied.current.length === max) {
            return null
        }

        if (!occupied.current.includes(key)) {
            occupied.current.push(key)

            return {
                x: x - (size / 2) - width / 2 + 5,
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

export default function AsteroidMediumBlock({ z, depth }) {
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
            <Model
                name={"floor1"}
                position={[-18, 0, z + (scaleZ === -1 ? depth : 0)]}
                scale={[scaleX, 1, scaleZ]}
            />
            {deco ? <Model name={deco} position={[22, 0, z]} /> : null}

            {turrets.map((i, index) => <SpawnTurret key={index} {...i} />)}
            {tanks.map((i, index) => <SpawnTank key={index} {...i} />)}
        </>
    )
}