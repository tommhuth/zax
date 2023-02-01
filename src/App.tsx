
import Camera from "./components/Camera"
import { Suspense, useEffect, useState } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { BasicShadowMap } from "three"
import { Perf } from "r3f-perf"
import InstancedMesh from "./components/InstancedMesh"
import RepeaterMesh from "./components/RepeaterMesh"
import Player from "./components/Player"
import World from "./components/World"
import { Only } from "./utils/utils"
import Config from "./Config"
import { useStore } from "./data/store"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

let isSmall = window.matchMedia("(max-height: 400px)").matches || window.matchMedia("(max-width: 600px)").matches
let frc = isSmall ? 4 : 7

export const dpr = 1 / frc

function Ui() {
    let player = useStore(i => i.player)

    return (
        <div
            style={{
                position: "fixed",
                left: "2em",
                right: "2em",
                bottom: "2em",
                display: "flex",
                gap: "1.5em",
                color: "white",
                fontSize: "1.5em",
                zIndex: 100
            }}
        >
            {player.health.toFixed(0)}%

            <div>{player.score.toLocaleString("en")}</div>

        </div>
    )
}

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
                    // type: BasicShadowMap,
                }}
                orthographic
                camera={{
                    zoom: isSmall ? 35 : 80,
                    near: -20,
                    far: 50
                }}
                dpr={dpr}
            >
                <Only if={Config.DEBUG}>
                    <Perf deepAnalyze />
                </Only>
                <App /> 
            </Canvas>
        </div>

    )
}

function Models() {
    let [building1, building2, building3, hangar] = useLoader(GLTFLoader, ["/models/building1.glb", "/models/building2.glb", "/models/building3.glb", "/models/hangar.glb"])
 
    return (
        <>
            <RepeaterMesh
                name="building1"
                count={10}
                object={building1.nodes.building1}
            />
            <RepeaterMesh
                name="building2"
                count={10}
                object={building2.nodes.building2}
            />
            <RepeaterMesh
                name="building3"
                count={10}
                object={building3.nodes.building3}
            />
            <RepeaterMesh
                name="hangar"
                count={10}
                object={hangar.nodes.hangar}
            />
        </>
    )
}


function App() { 
    return (
        <Suspense fallback={null}> 
            <Camera />
            <InstancedMesh name="box" count={250}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshLambertMaterial color="white" attach={"material"} />
            </InstancedMesh>
            <InstancedMesh name="sphere" count={150}>
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <meshLambertMaterial color="white" attach={"material"} />
            </InstancedMesh>

            <InstancedMesh name="line" count={100}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshBasicMaterial attach={"material"} />
            </InstancedMesh>

            <Models />

            <directionalLight
                color={0xffffff}
                position={[4, 14, 10]}
                intensity={.45}
            />
            <directionalLight
                color={0xffffff}
                position={[0, 15, 0]}
                intensity={.75}
                castShadow
                shadow-radius={1.5}
                shadow-camera-near={-1}
                shadow-camera-far={20}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-mapSize={[256, 256]}
                shadow-bias={-0.001}
            />
            <ambientLight intensity={.25} />

            <World />
            <Player />

            <mesh rotation-x={-Math.PI / 2} position-y={8} position-x={-8}>
                <planeGeometry args={[10, 100]} />
                <meshBasicMaterial color="black" />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={8} position-x={22}>
                <planeGeometry args={[10, 100]} />
                <meshBasicMaterial color="black" />
            </mesh>
        </Suspense>
    )
}