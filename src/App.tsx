
import Camera from "./components/Camera"
import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import InstancedMesh from "./components/InstancedMesh"
import Player from "./components/Player"
import World, { WORLD_CENTER_X } from "./components/world/World"
import { glsl, Only } from "./utils/utils"
import Config from "./Config"
import { useShader } from "./utils/hooks"
import Ui from "./components/ui/Ui"
import Models from "./components/Models"
import Lights from "./components/Lights"
import { BasicShadowMap } from "three"
import { dpr, isSmallScreen } from "./data/store"

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