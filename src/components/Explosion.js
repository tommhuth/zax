import random from "@huth/random"
import { useMemo, useRef, useCallback, useState } from "react"
import { useFrame } from "react-three-fiber"
import { Quaternion, Vector3, Matrix4, SphereBufferGeometry, MeshBasicMaterial, Color } from "three"
import { clamp, easeInSine } from "../utils"


export default function Explosion({
    x = 0,
    y = 0,
    z = 0,
    height = 6,
    depth = 6,
    width = 6,
    count = 5,
    radius = 7,
}) {
    let material = useMemo(() => new MeshBasicMaterial({ color: new Color("orange").convertGammaToLinear() }), [])
    let geometry = useMemo(() => new SphereBufferGeometry(1, 14, 14), [])
    let parts = useMemo(() => {
        let res = []

        for (let i = 0; i < count; i++) {
            let yi = random.float(-height / 2, height / 2)
            let xi = random.float(-width / 2, width / 2)
            let zi = random.float(-depth / 2, depth / 2)

            res.push({
                delay: i * 4,
                radius: i + .5,
                id: random.id(),
                lifetime: random.integer(13, 19),
                position: new Vector3(x + xi, y + yi, z + zi),
                index: i
            })
        }

        return res
    }, [count, width, height, depth, x, y, z])
    let ref = useRef()
    let [visible, setVisible] = useState(true)
    let matrix = useMemo(() => new Matrix4(), [])
    let scaling = useMemo(() => new Vector3(), [])
    let origin = useMemo(() => new Vector3(x, y, z), [x, y, z])
    let quaternion = useMemo(() => new Quaternion(), [])
    let setProperties = useCallback((index, position, scale = 1) => {
        scaling.set(scale, scale, scale)

        ref.current.setMatrixAt(index, matrix.compose(position, quaternion, scaling))
        ref.current.instanceMatrix.needsUpdate = true
    }, [quaternion, matrix, scaling])

    return (
        <>
            {parts.map((i, index) => {
                return (
                    <Part
                        key={i.id}
                        index={index}
                        setProperties={setProperties}
                        visible={visible}
                        {...i}
                    />
                )
            })}
            <Part
                radius={radius}
                lifetime={40}
                setProperties={setProperties}
                delay={30}
                index={count}
                position={origin}
                done={() => setVisible(false)}
                visible={visible}
            />
            <instancedMesh visible={visible} ref={ref} args={[geometry, material, count + 1]} />
        </>
    )
}

function Part({ radius = 4, done, visible, lifetime = 18, start = 0, delay, position, index, setProperties }) {
    let tid = useRef(start)

    useFrame(() => {
        tid.current++

        if (tid.current < delay) {
            return
        }

        let s = 1 - easeInSine(clamp((tid.current - delay) / lifetime, 0, 1))

        setProperties(index, position, s * radius)

        if ((tid.current - delay) >= lifetime && done && visible) {
            done()
        }
    })


    return null
}