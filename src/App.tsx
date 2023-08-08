
import Camera from "./components/Camera"
import { Suspense, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import Player from "./components/Player"
import World from "./components/world/World"
import { Only } from "./utils/utils"
import Config from "./Config"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import { BasicShadowMap, NoToneMapping, Vector2 } from "three"
import { dpr, isSmallScreen } from "./data/store"
import ExplosionsHandler from "./components/world/ExplosionsHandler"
import Models from "./components/Models"
import ShimmerHandler from "./components/world/ShimmerHandler"

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
                    powerPreference: "high-performance",
                    toneMapping: NoToneMapping
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
                    near: 0,
                    far: 50
                }}
                dpr={dpr}
            >
                <Only if={Config.DEBUG}>
                    <Perf deepAnalyze />
                </Only>

                <Suspense fallback={null}>
                    <Camera />
                    <Lights />

                    <Models />
                    <World />
                    <Player />
                    <ExplosionsHandler />
                    <ShimmerHandler />

                    <mesh rotation-x={-Math.PI / 2} position-y={12} position-x={-7} >
                        <planeGeometry args={[12, 10000, 1, 1]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh rotation-x={-Math.PI / 2} position-y={12} position-x={23}>
                        <planeGeometry args={[12, 10000, 1, 1]} />
                        <meshBasicMaterial color="#000" />
                    </mesh>
                </Suspense>
            </Canvas>
        </div>

    )
} 