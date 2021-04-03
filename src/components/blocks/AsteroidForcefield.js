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

export default function AsteroidForcefield({ y = 0, z }) {
    let [height] = useState(() => random.integer(6, 10))
    let [active] = useState(() => random.boolean())
    let [x] = useState(-8)
    let ref = useRef()
    let t = useRef(0)
    let totalHeight = 17
    let width = 39
    let wall = useMemo(() => {
        let left = random.integer(6, 10)
        let middle = random.integer(8, 16)
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

        t.current += .25
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
