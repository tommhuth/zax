
import ReactDOM from "react-dom"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import Config from "../data/Config"
import { clamp } from "../utils"
import random from "@huth/random"
import Model, { useGeometry } from "../Model"


export default function Lights() {
    let { scene, viewport } = useThree()
    let ref = useRef()
    let ref2 = useRef()

    useEffect(() => {
        ref.current.target.position.set(0, -1, 0)
        scene.add(ref.current.target)

        ref2.current.target.position.set(5, -1, 1)
        scene.add(ref2.current.target)

        ref2.current.updateMatrixWorld()
    }, [scene])

    useEffect(() => {
        return useStore.subscribe(([x, , z]) => {
            ref.current.position.z = z
            ref.current.target.position.z = z
            //ref.current.target.position.y =
            ref.current.shadow.camera.updateMatrixWorld()
            ref.current.updateMatrixWorld()
        }, store => store.player.position)
    }, [])

    useEffect(() => {
        let size = 38
        let { width, height } = viewport()
        let diag = Math.sqrt(width ** 2 + height ** 2)

        ref.current.shadow.camera.near = -size * .5
        ref.current.shadow.camera.far = size * .5
        ref.current.shadow.camera.left = -size * .65
        ref.current.shadow.camera.right = size * .65
        ref.current.shadow.camera.top = diag * .45
        ref.current.shadow.camera.bottom = -diag * .85
        ref.current.shadow.bias = .001
        ref.current.shadow.mapSize.set(512, 512)

        ref.current.shadow.camera.updateMatrixWorld()
        ref.current.updateMatrixWorld()
        /*
        let g = new CameraHelper(ref.current.shadow.camera)
 
        scene.add(g)
        */
    }, [viewport])


    return (
        <>
            <directionalLight
                castShadow
                ref={ref}
                onUpdate={(self) => self.updateMatrixWorld()}
                intensity={.1}
                color={0xffffff}
            />
            <directionalLight
                ref={ref2}
                onUpdate={(self) => self.updateMatrixWorld()}
                intensity={1.9}
                color={"blue"}
            />
            <hemisphereLight intensity={.6} groundColor={"#0000ff"} color={"#77eeff"} />
        </>
    )
}
