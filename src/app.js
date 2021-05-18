import "../assets/styles/app.scss"

import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { BasicShadowMap, Vector3 } from "three"
import useStore from "./data/store"
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


function App() {
    let obstacles = useStore(i => i.obstacles)
    let health = useStore(i => i.player.health)


    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 1000
                }}
            >
                health={(health).toFixed(0)}<br />
            </div>
            <Canvas
                orthographic
                webgl1
                dpr={window.devicePixelRatio * (.2 + (window.devicePixelRatio > 1 ? -.1 : 0))} 
                camera={{
                    zoom: 24, // 24,
                    position: new Vector3(0, 15, -40),
                    near: -100,
                    far: 200
                }}
                colorManagement
                gl={{
                    antialias: false,
                    depth: true,
                    stencil: false,
                    alpha: true
                }}
                shadows={{
                    type: BasicShadowMap
                }}
            >
                <ModelsProvider> 
                    {obstacles.map(i => {  
                        return null 
                        
                        return (
                            <mesh key={i.id} receiveShadow position={[i.position[0], i.position[1] + (i.height ?  i.height / 2:0), i.position[2]]}>
                                {i.radius ? <sphereBufferGeometry args={[i.radius, 8,8,8]} /> :<boxBufferGeometry args={[i.width, i.height, i.depth]} />}
                                <meshLambertMaterial wireframe color="red" />
                            </mesh>
                        )
                    })}
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