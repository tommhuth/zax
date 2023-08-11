import { clamp, ndelta, setMatrixAt } from "../../utils/utils"
import { removeShimmer, useStore } from "../../data/store"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { startTransition } from "react"

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export default function ShimmerHandler() {
    let instance = useStore(i => i.instances.shimmer?.mesh)
    let player = useStore(i => i.player.object)
    let getDistanceTo = (value: number, prop: "x" | "y" | "z", threshold = 3.5) => {
        return player ? 1 - clamp(Math.abs(value - player.position[prop]) / threshold, 0, 1) : 0
    }

    useFrame((state, delta) => {
        if (!instance || !player) {
            return
        }

        let shimmers = useStore.getState().shimmer
        let d = ndelta(delta)
        let dead: string[] = []

        for (let shimmer of shimmers) {
            if (shimmer.time > shimmer.lifetime || shimmer.position.y === shimmer.radius) {
                dead.push(shimmer.id)
                continue
            }

            let scale = (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1)) * shimmer.radius
            let dragEffect = getDistanceTo(shimmer.position.x, "x")
                * getDistanceTo(shimmer.position.y, "y")
                * getDistanceTo(shimmer.position.z, "z")

            shimmer.position.y = Math.max(shimmer.position.y - d * shimmer.speed, shimmer.radius)
            shimmer.position.z -= easeInOutCubic(dragEffect) * d * shimmer.speed * 6
            shimmer.time += d * 1000

            if (shimmer.time < 0) {
                scale = 0
            }

            setMatrixAt({
                instance,
                index: shimmer.index,
                position: shimmer.position.toArray(),
                scale
            })
        }

        if (dead.length) {
            startTransition(() => removeShimmer(dead))
        }
    })

    return (
        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            name="shimmer"
            count={100}
            colors={false}
        >
            <meshBasicMaterial
                attach={"material"}
                color={"blue"}
            />
            <sphereGeometry args={[1, 6, 6]} />
        </InstancedMesh>
    )
}