 
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { Box3, BoxBufferGeometry, Quaternion, Sphere, BasicShadowMap, Vector3, CameraHelper, Matrix4, MeshLambertMaterial, TextureLoader, RepeatWrapping, NearestFilter, CubeReflectionMapping, CubeUVReflectionMapping, LinearMipmapLinearFilter, LinearMipMapLinearFilter } from "three"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import useStore, { createBullet, setPlayerPosition, createFighter, hitPlayer, removeBullet, removeFighter, createObstacle, hitObstacle, generateWorld, updateStats, removeParticle, createParticle, removeObstacle, createTurret, removeTurret } from "../data/store"
import random from "@huth/random" 
 
export default function Particles() {
    let particles = useStore(i => i.particles.list)
    let count = 400
    let ref = useRef()
    let matrix = useMemo(()=> new Matrix4(), [])
    let scaling = useMemo(()=> new Vector3(), [])
    let quaternion = useMemo(()=> new Quaternion(), [])
    let setPosition = useCallback((index, position, scale = 1) => {  
        scaling.set(scale, scale, scale) 
        ref.current.setMatrixAt(index, matrix.compose(position, quaternion, scaling))
    }, [matrix, quaternion, scaling])

    useFrame(() => {
        ref.current.instanceMatrix.needsUpdate = true
    })

    return (

        <>
            {particles.map((i) => <Particle setPosition={setPosition} {...i} key={i.id} />)}
            <instancedMesh castShadow ref={ref} args={[null, null, count]}>
                <sphereBufferGeometry args={[1, 6, 6, 5]} />
                <meshBasicMaterial color="white" />
            </instancedMesh>
        </>
    )
}

function Particle({ origin = [0, 0, 0], setPosition, id, index, position, velocity: incomingVelocity = [1, 1, 1], radius = .5 }) {
    let [grounded, setGrounded] = useState(false)
    let [decay] = useState(random.float(.92, .96))
    let acceleration = useMemo(() => new Vector3(0, -.05, 0), [])
    let velocity = useMemo(() => new Vector3(...incomingVelocity), [])

    useLayoutEffect(() => {
        position.set(...origin)
    }, [position])

    useEffect(() => {
        if (grounded) {
            setTimeout(() => removeParticle(id, index), Math.floor(Math.random() * 1000 + 5000))
        }
    }, [grounded, index, id])

    useEffect(() => {
        return () => setPosition(index, new Vector3(0, 0, -1000), radius)
    }, [])

    useFrame(() => {
        position.add(velocity)
        velocity.multiplyScalar(grounded.current ? .6 : decay)

        if (position.y > radius) {
            velocity.add(acceleration)
        } else {
            position.y = radius

            if (!grounded) {
                setGrounded(true)
            }
        }

        setPosition(index, position, radius)
    })

    return (null
    )
}