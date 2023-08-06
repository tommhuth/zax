import { useEffect, useMemo } from "react"
import { BufferAttribute } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../utils/utils"
import { useShader } from "../../utils/hooks"
import { removeExplosion, removeShimmer, useStore } from "../../data/store"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"

function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

function blend(values = [75, 100, 0], t = 0, threshold = .5) {
    let left = t >= threshold ? 1 : 0
    let right = left + 1

    if (t <= threshold) {
        return (1 - t / (1 - threshold)) * values[left] + t / (1 - threshold) * values[right]
    }

    return (1 - (t - threshold) / (1 - threshold)) * values[left] + (t - threshold) / (1 - threshold) * values[right]
}

export default function ShimmerHandler() { 
    let instance = useStore(i => i.instances.shimmer?.mesh) 

    useFrame((state, delta) => {
        if (!instance) {
            return
        }

        let shimmers = useStore.getState().shimmer
        let d = ndelta(delta)
        let dead: string[] = [] 

        for (let shimmer of shimmers) {
            let scale = (1 - clamp(shimmer.time / shimmer.lifetime, 0, 1)) * shimmer.radius

            shimmer.position.y = Math.max(shimmer.position.y - d * shimmer.speed, shimmer.radius)
            shimmer.time += d * 1000

            if (shimmer.time > shimmer.lifetime || shimmer.position.y === shimmer.radius) {
                dead.push(shimmer.id)
                continue
            }

            if (shimmer.time < 0) {
                scale = 0
            }

            setMatrixAt({
                instance,
                index: shimmer.index,
                position: shimmer.position.toArray(),
                scale: [scale, scale, scale]
            })
        }

        if (dead.length) {
            removeShimmer(dead)
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
                precision={"lowp"}
                color={"blue"}
            />
            <sphereGeometry args={[1, 6, 6]} />
        </InstancedMesh>
    )
}