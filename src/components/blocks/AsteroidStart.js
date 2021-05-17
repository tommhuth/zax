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

export default function AsteroidStart({ z, depth }) {
    const [x] = useState(() => random.integer(-8, 8))

    return (
        <>
            <SpawnTurret x={x} y={0} z={z + depth / 2} />
            <Model name="asttop" receiveShadow={true} castShadow={false} position={[2, 0, z + depth]} />
            <Model name="astbottom" receiveShadow={false} position={[2, 0, z + depth]} />
        </>
    )
}
