
import ReactDOM from "react-dom"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import Config from "../data/Config"
import { clamp } from "../utils"
import random from "@huth/random"
import Model, { useGeometry } from "../Model"
 
export default function Wall({ x, y = 0, z, width, height }) {
    useEffect(() => {
        let id = createObstacle({
            width,
            height,
            depth: 2,
            position: [x, y, z],
        })

        return () => {
            removeObstacle(id)
        }
    }, [width, height, x, y, z])

    return <Model name="wall1" position={[x, y, z]} />
}