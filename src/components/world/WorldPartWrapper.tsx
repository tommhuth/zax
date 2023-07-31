import { useFrame } from "@react-three/fiber"
import React, { startTransition, useEffect, useRef } from "react"
import { Box3, Vector3 } from "three"
import { removeWorldPart, useStore } from "../../data/store"
import { Tuple2 } from "../../types"
import { Only, setColorAt, setMatrixAt } from "../../utils/utils"
import { useInstance } from "../InstancedMesh"
import random from "@huth/random"
import { WORLD_CENTER_X } from "./World"
import Config from "../../Config"

interface Asset {
    release: () => void
}

interface WorldPartWrapperProps {
    position: Vector3
    id: string
    children?: React.ReactNode
    size: Tuple2
    assets?: (Asset | null)[]
}

let _box = new Box3()
let _center = new Vector3()
let _size = new Vector3()

export default function WorldPartWrapper({
    position,
    children,
    size: [width, depth],
    id,
}: WorldPartWrapperProps) {
    let [index, instance] = useInstance("box")
    let dead = useRef(false)
    let i = useRef(random.integer(0, 100))

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setColorAt(instance, index, 0xdddddd)
        }
    }, [index, instance])

    useFrame(() => {
        if (typeof index === "number" && instance) {
            setMatrixAt({
                instance,
                index,
                position: [position.x, position.y - 5, position.z + depth / 2],
                scale: [30, 10, depth + .1],
            })
        }
    })

    useFrame(() => {
        i.current++

        if (dead.current || i.current % 6 > 0) {
            return
        }

        let { player, world } = useStore.getState()
        let height = 6

        _center.set(position.x, position.y + height / 2, position.z + depth / 2)
        _box.setFromCenterAndSize(_center, _size.set(width, height, depth))

        if (!world.frustum.intersectsBox(_box) && player.object && position.z > player.object.position.z) {
            dead.current = true
            startTransition(() => removeWorldPart(id))
        }

    })

    return (
        <>
            {children}

            <Only if={Config.DEBUG}>
                <mesh position-y={-1} position-z={position.z + depth / 2} position-x={WORLD_CENTER_X}>
                    <boxGeometry args={[width, 2, depth, 1, 1, 1]} />
                    <meshBasicMaterial wireframe color="black" />
                </mesh>
            </Only>
        </>
    )
}