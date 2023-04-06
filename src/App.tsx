
import Camera from "./components/Camera"
import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import InstancedMesh from "./components/InstancedMesh"
import Player from "./components/Player"
import World, { WORLD_CENTER_X } from "./components/world/World"
import { clamp, glsl, Only, setMatrixAt } from "./utils/utils"
import Config from "./Config"
import { useShader } from "./utils/hooks"
import Ui from "./components/ui/Ui"
import Models from "./components/Models"
import Lights from "./components/Lights"
import { BasicShadowMap, InstancedMesh as ThreeInstacedMesh } from "three"
import { dpr, isSmallScreen, removeExplosion, useStore } from "./data/store" 

export default function Wrapper() {
    return (
        <div
            style={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                position: "fixed",
            }}
        >
            <Ui />
            <Canvas
                gl={{
                    antialias: false,
                    depth: true,
                    stencil: false,
                    alpha: false,
                }}
                style={{
                    height: "100%",
                    width: "100%",
                }}
                shadows={{
                    type: BasicShadowMap,
                }}
                orthographic
                camera={{
                    zoom: isSmallScreen ? 40 : 70,
                    near: -30,
                    far: 50
                }}
                dpr={dpr}
            >
                <Only if={Config.DEBUG}>
                    <Perf deepAnalyze />
                </Only>

                <mesh position-x={WORLD_CENTER_X}>
                    <boxGeometry />
                    <meshBasicMaterial color="black" />
                </mesh>
                <Suspense fallback={null}>
                    <App />
                </Suspense>
            </Canvas>
        </div>

    )
}

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

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

function easeInBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return c3 * x * x * x - c1 * x * x
} 

function Explosions() {
    let ref = useRef<ThreeInstacedMesh>(null)

    useFrame(() => {
        let explosions = useStore.getState().explosions  

        for (let explosion of explosions) {
            if (explosion.fireballs[0].time >= explosion.fireballs[0].lifetime ) {
                removeExplosion(explosion.id)
                continue
            }

            for (let sphere of explosion.fireballs) {
                let t = easeOutQuart(clamp(sphere.time / sphere.lifetime, 0, 1))
                let s = blend([sphere.startRadius, sphere.maxRadius, 0], t)

                if (sphere.time < 0) {
                    s = 0
                } 

                setMatrixAt({
                    instance: ref.current as ThreeInstacedMesh,
                    index: sphere.index,
                    position: [
                        sphere.position[0],
                        sphere.position[1] + (clamp(sphere.time / sphere.lifetime, 0, 1)) * 2,
                        sphere.position[2],
                    ],
                    scale: [s, s, s]
                })


                sphere.time++
            }
        }
    })

    return (
        <instancedMesh castShadow receiveShadow args={[undefined, undefined, 100]} ref={ref}>
            <sphereGeometry args={[1, 16, 16, 16]} />
            <meshLambertMaterial color={"white"} />
        </instancedMesh>
    )
}

function App() {
    let { onBeforeCompile } = useShader({
        uniforms: {

        },

        vertex: {
            head: glsl`
                varying vec3 vPosition;
            `,
            main: glsl`
                vPosition = position;
            `,
        },
        fragment: {
            head: glsl`
                varying vec3 vPosition;
            `,
            main: glsl`
                float opacity = clamp((vPosition.z + .75) / 1.5, 0., 1.);

                gl_FragColor = vec4(0., 0., 1, opacity);
            `,
        }
    })


    return (
        <>
            <Camera />

            <InstancedMesh name="box" count={250}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshPhongMaterial color="white" attach={"material"} />
            </InstancedMesh>

            <InstancedMesh name="sphere" count={150}>
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <meshPhongMaterial color="white" attach={"material"} />
            </InstancedMesh>

            <InstancedMesh name="line" count={100}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshBasicMaterial onBeforeCompile={onBeforeCompile} transparent attach={"material"} />
            </InstancedMesh>

            <InstancedMesh name="cylinder" count={40}>
                <cylinderGeometry args={[.5, .5, 1, 10, 1]} attach="geometry" />
                <meshPhongMaterial color="red" attach={"material"} />
            </InstancedMesh>

            <Models />
            <Lights />
            <World />
            <Player />
            <Explosions />

            <mesh rotation-x={-Math.PI / 2} position-y={8} position-x={-6}>
                <planeGeometry args={[10, 10000, 1, 1]} />
                <meshBasicMaterial color="black" />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={8} position-x={22}>
                <planeGeometry args={[10, 10000, 1, 1]} />
                <meshBasicMaterial color="black" />
            </mesh>
        </>
    )
}