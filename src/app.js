import "../assets/styles/app.scss"

import ReactDOM from "react-dom"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "./data/store"
import Config from "./data/Config"
import { clamp } from "./utils"
import random from "@huth/random"
import Model, { useGeometry } from "./Model"
import Turrets from "./components/Turrets"
import Particles from "./components/Particles"
import Bullets from "./components/Bullets"
import Fighters from "./components/Fighters"
import Player from "./components/Player"
import World from "./components/World"
import Lights from "./components/Lights"
import Camera from "./components/Camera"
import Tanks from "./components/Tanks"
import Explosion from "./components/Explosion"
  
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
                health={(health* 100).toFixed(0)}<br /> 
            </div>
            <Canvas
                orthographic
                webgl1
                pixelRatio={window.devicePixelRatio * (.2 + (window.devicePixelRatio > 1 ? -.1 : 0))}
                style={{
                    width: window.innerWidth + (window.innerWidth%2 === 0 ? 0: 1),
                    height: window.innerHeight + (window.innerHeight%2 === 0 ? 0: 1)
                }}
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
                    alpha: true,
                    
                }}
                shadowMap={{
                    type: BasicShadowMap
                }}
            >
                {obstacles.map(i => { 
                    return null 
                    
                    return <mesh key={i.id} receiveShadow position={[i.position[0], i.position[1] + i.height / 2, i.position[2]]}>
                        <boxBufferGeometry args={[i.width, i.height, i.depth]} />
                        <meshLambertMaterial wireframe color="red" />
                    </mesh>
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
            </Canvas>
        </>
    )
}


ReactDOM.render(<App />, document.getElementById("root"))