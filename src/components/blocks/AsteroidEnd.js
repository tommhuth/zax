import { useFrame, useThree } from "react-three-fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useStore, { generateWorld, createTurret, createObstacle, removeObstacle, removeTurret, createTank, removeTank, createFighter, removeFighter, BlockType, removeBullet } from "../../data/store"
import random from "@huth/random"
import Model, { mat } from "../../Model"
import Wall from "../Wall"
import { Matrix4, PlaneBufferGeometry, Vector3 } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { Only } from "../../utils"
import { useMeteor } from "../Models"
import { SpawnTank, SpawnTurret } from "../World"


export default function AsteroidEnd({ z }) {
    return (
        <>
            <Model name="asttop" receiveShadow={true} castShadow={false} position={[0, 0, z]} scale={[1, 1, -1]} />
            <Model name="astbottom" receiveShadow={false} position={[0, 0, z]} scale={[1, 1, -1]} />
        </>
    )
}