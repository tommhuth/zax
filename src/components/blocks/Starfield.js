import { useFrame } from "react-three-fiber"
import { useEffect, useMemo, useRef } from "react"
import useStore from "../../data/store"
import random from "@huth/random" 
import { Matrix4, Quaternion, Vector3 } from "three"

let matrix = new Matrix4()
let quaternion = new Quaternion()
let scaling = new Vector3(1, 1, 1)
let translation = new Vector3(0, 0, 0)

export default function Starfield({ z = 0, depth = 200, count = 150 }) {
    let warp = useStore(i => i.player.warp)
    let ref = useRef()
    let stars = useMemo(() => {
        return new Array(200).fill().map(() => {
            let height = random.float(0, 30)
            let scale = (1 - height / 30) * .25

            return {
                id: random.id(),
                x: random.float(0, 55),
                y: -height - 5,
                z: z + random.float(-depth / 2, depth / 2),
                depth: height,
                scale: [scale, scale, scale]
            }
        })
    }, [z, depth])
    let playerPosition = useRef([0, 0, 0])

    useEffect(() => {
        return useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useFrame(() => {
        let buffer = 100

        for (let [index, star] of stars.entries()) {
            let scale = ((30 - star.depth) * 1) -3

            if (star.z - playerPosition.current[2] < -buffer) {
                star.z = random.integer(
                    playerPosition.current[2] + buffer,
                    playerPosition.current[2] + buffer * 1.25
                )
            } else {
                star.z -= star.depth * .0035 + (warp ? .25 * star.depth/30  : 0)
            }

            star.scale[2] += ((warp ? scale : star.scale[0]) - star.scale[2]) * (.075 - ((star.depth / 30) * .065))

            ref.current.setMatrixAt(
                index,
                matrix.compose(
                    translation.set(star.x, star.y, star.z + star.scale[2] / 2),
                    quaternion,
                    scaling.set(...star.scale)
                )
            )
        }

        ref.current.instanceMatrix.needsUpdate = true
    }) 

    return (
        <instancedMesh receiveShadow ref={ref} args={[null, null, count]} >
            <boxBufferGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="white" />
        </instancedMesh>
    )
} 