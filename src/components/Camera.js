
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter, MathUtils } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import Config from "../data/Config"
import { clamp } from "../utils"
import random from "@huth/random"
import Model, { useGeometry } from "../Model"


export default function Camera() {
    let { camera } = useThree()
    let playerPosition = useRef([0, 15, -40])

    useLayoutEffect(() => {
        // magic numbers!!, only works to right :/
        camera.position.set(-10, 8.2925, -30) //set(-10, 8.2925, -30) // 8.2925
        camera.lookAt(0, 0, -20)  // 20.17 
    }, [camera])

    useEffect(() => {
        useStore.subscribe(position => {
            playerPosition.current = position
        }, store => store.player.position)
    }, [])

    useFrame(() => {
        camera.position.z += (playerPosition.current[2] + 10 - camera.position.z) * .1

    })

    return null
}