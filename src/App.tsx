
import Camera from "./components/Camera"
import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import Player from "./components/Player"
import World from "./components/world/World"
import { Only } from "./utils/utils"
import Config from "./Config"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import { BasicShadowMap, Group, NoToneMapping } from "three"
import { dpr, isSmallScreen, useStore } from "./data/store"
import ExplosionsHandler from "./components/world/ExplosionsHandler"
import Models from "./components/Models"
import ShimmerHandler from "./components/world/ShimmerHandler"

export default function Wrapper() { 
    let pixelSize = 6
    let getSize = () => [
        Math.ceil(window.innerWidth / pixelSize) * pixelSize,
        Math.ceil(window.innerHeight / pixelSize) * pixelSize
    ]
    let [size, setSize] = useState(() => getSize())

    useEffect(() => {
        let tid: ReturnType<typeof setTimeout>
        let onResize = () => {
            clearTimeout(tid)
            setTimeout(() => setSize(getSize()), 200)
        }

        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

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
                    height: size[1],
                    width: size[0],
                }}
                shadows={{
                    type: BasicShadowMap,
                }}
                orthographic
                camera={{
                    zoom: isSmallScreen ? 40 : 70,
                    near: 0,
                    far: 150
                }}
                dpr={dpr}
            >
                <Only if={Config.DEBUG}>
                    <Perf deepAnalyze />
                </Only>

                <EdgeOverlay />

                <Suspense fallback={null}>
                    <Camera />
                    <Lights />

                    <Models />
                    <World />
                    <Player />
                    <ExplosionsHandler />
                    <ShimmerHandler />
                </Suspense>
            </Canvas>
        </div>

    )
}

function EdgeOverlay() {
    let groupRef = useRef<Group>(null)
    let r = useThree()


    useEffect(() => {
        r.setSize

        let w = window.innerWidth * dpr

    }, [])

    useFrame(() => {
        let player = useStore.getState().player.object

        if (player && groupRef.current) {
            groupRef.current.position.setZ(player.position.z)
        }
    })

    return (
        <group ref={groupRef}>
            <mesh rotation-x={-Math.PI / 2} position-y={12} position-x={-4} >
                <planeGeometry args={[12, 100, 1, 1]} />
                <meshBasicMaterial color="black" />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={12} position-x={28}>
                <planeGeometry args={[12, 100, 1, 1]} />
                <meshBasicMaterial color="#000" />
            </mesh>
        </group>

    )
}