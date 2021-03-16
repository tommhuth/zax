import random from "@huth/random";
import { useLayoutEffect, useMemo, useRef } from "react"
import { useFrame } from "react-three-fiber"
import { clamp, easeInOutSine } from "../utils"



function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2)
}


export default function Explosion({
    x = 2,
    y = 3,
    z = -16,
    height = 6,
    depth = 6,
    width = 6,
    count = 5,
    radius = 7, 
}) {
    let parts = useMemo(() => {
        let res = []

        for (let i = 0; i < count; i++) {
            res.push({
                y: random.float(-height / 2, height / 2),
                x: random.float(-width / 2, width / 2),
                z: random.float(-depth / 2, depth / 2),
                delay: i * 4,
                radius: i + .5,
                id: random.id()
            })
        }

        return res
    }, [count, width, height, depth])

    return (
        <group position={[x, y, z]}>
            {parts.map((i) => {
                return (
                    <Part
                        key={i.id}
                        {...i}
                    />
                )
            })}

            <Part
                y={0}
                radius={radius}
                lifetime={40}
                z={0}
                x={0}
                delay={30}
            />
        </group>
    )
}

function Part({ x = 0, y = 0, z = 0, radius = 4, lifetime = 18, start = 0, delay }) {
    let ref = useRef()
    let tid = useRef(start)

    useLayoutEffect(() => {
        ref.current.scale.set(0, 0, 0)
    }, [])

    useFrame(() => {
        tid.current++

        if (tid.current < delay) {
            return
        }

        let s = 1 - easeInSine(clamp((tid.current - delay) / lifetime, 0, 1))

        ref.current.scale.set(s, s, s)

    })


    return (
        <mesh ref={ref} position={[x, y, z]}>
            <sphereBufferGeometry args={[Math.max(0, radius), 10, 10]} />
            <meshBasicMaterial color="orange" />
        </mesh>
    )
}