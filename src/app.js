import "../assets/styles/app.scss"

import ReactDOM from "react-dom"
import { Canvas } from "@react-three/fiber"
import { BasicShadowMap, Vector3 } from "three"
import useStore, { reset, setFuel, setState } from "./data/store"
import Turrets from "./components/Turrets"
import Particles from "./components/Particles"
import Bullets from "./components/Bullets"
import Fighters from "./components/Fighters"
import Player from "./components/Player"
import World from "./components/World"
import Lights from "./components/Lights"
import Camera from "./components/Camera"
import Tanks from "./components/Tanks"
import { ModelsProvider } from "./components/Models"
import { Only } from "./utils"
import Config from "./data/Config"
import { useEffect, useState } from "react"

const dpr = {
    1: .175,
    2: .15
}

function App() {
    let obstacles = useStore(i => i.obstacles)
    let health = useStore(i => i.player.health)
    let score = useStore(i => i.score)
    let fuel = useStore(i => i.player.fuel)
    let state = useStore(i => i.state)
    let redos = useStore(i => i.redos)
    let [canRestart, setCanRestart] = useState(false)

    useEffect(() => {
        if (state === "active") {
            let id = setInterval(() => setFuel(-1), 1000)

            return () => {
                clearInterval(id)
            }
        }
    }, [state])

    useEffect(() => {
        if (health <= 0 || fuel <= 0) {
            setState("gameover")
        }
    }, [health, fuel])

    useEffect(() => {
        if (state === "gameover") {
            let id = setTimeout(() => setCanRestart(true), 7000)

            return () => {
                clearTimeout(id)
            }
        } else {
            setCanRestart(false)
        }
    }, [state])

    useEffect(() => {
        let onClick = () => {
            switch (state) {
                case "intro":
                    setState("active")
                    break
                case "gameover": {
                    if (canRestart) {
                        reset()
                        setState("active")
                    }

                    break
                }

            }
        }

        window.addEventListener("click", onClick)

        return () => {
            window.removeEventListener("click", onClick)

        }
    }, [state, canRestart])

    return (
        <>
            <Only if={state === "intro"}>
                <div
                    style={{
                        position: "absolute",
                        top: "50%",

                        textAlign: "center",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000
                    }}
                >
                    <h1 style={{ fontSize: "8em", }}>Zaxxypants</h1>
                </div>
            </Only>
            <Only if={state === "gameover"}>
                <div
                    style={{
                        position: "absolute",
                        top: "50%",

                        textAlign: "center",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000
                    }}
                >
                    <h1 style={{ fontSize: "10em", }}>Game over</h1>
                    <p style={{ fontSize: "3em", marginTop: "1em", textTransform: "uppercase" }}> Score {score} </p>
                </div>
            </Only>
            <Only if={state === "active"}>
                <div
                    style={{
                        position: "absolute",
                        top: 20,
                        left: 20,
                        zIndex: 1000
                    }}
                >
                    health={(health).toFixed(0)}<br />
                    fuel={(fuel).toFixed(0)}<br />
                    <span style={{ fontSize: "3em", marginTop: ".5em", letterSpacing: "-.1em" }} >{score}</span>
                </div>
            </Only>
            <Canvas
                orthographic
                dpr={dpr[window.devicePixelRatio]}// (.2 + (window.devicePixelRatio > 1 ? -.1 : 0))}
                camera={{
                    zoom: 24,
                    position: new Vector3(0, 15, -40),
                    near: -100,
                    far: 200
                }}
                linear
                gl={{
                    antialias: false,
                    depth: true,
                    stencil: false,
                    alpha: false
                }}
                shadows={{
                    type: BasicShadowMap
                }}
            >
                <color attach="background" args={["black"]} />
                <fog attach="fog" color="darkblue" near={5} far={90} />

                <ModelsProvider key={redos + "j"} >
                    <Only if={Config.DEBUG}>
                        {obstacles.map(i => {
                            return (
                                <mesh
                                    key={i.id}
                                    position={[
                                        i.position[0],
                                        i.position[1] + (i.height ? i.height / 2 : 0),
                                        i.position[2]
                                    ]}
                                >
                                    {i.radius ? <sphereBufferGeometry args={[i.radius, 8, 8, 8]} /> : <boxBufferGeometry args={[i.width, i.height, i.depth]} />}
                                    <meshLambertMaterial wireframe color="red" />
                                </mesh>
                            )
                        })}
                    </Only>
                    <Camera />
                    <Lights />
                    <Player />
                    <World />

                    <Fighters />
                    <Particles />
                    <Bullets />
                    <Turrets />
                    <Tanks />
                </ModelsProvider>
            </Canvas>
        </>
    )
}


ReactDOM.render(<App />, document.getElementById("root"))