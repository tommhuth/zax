import { useFrame } from "@react-three/fiber"
import React, { Ref, useLayoutEffect, useMemo, useRef } from "react"
import { Box3, IUniform, Matrix4, Object3D, Quaternion, Shader, Vector3 } from "three"
import { OBB } from "three/examples/jsm/math/OBB"
import SpatialHashGrid, { Client, ClientData } from "../data/SpatialHashGrid"
import { useStore } from "../data/store"
import { Tuple2, Tuple3 } from "../types"
import { glsl, ndelta, roundToNearest } from "./utils"

interface ShaderPart {
    head?: string
    main?: string
}

interface UseShaderParams {
    uniforms?: Record<string, IUniform<any>>
    vertex?: ShaderPart
    fragment?: ShaderPart
}

export function useShader({
    uniforms: incomingUniforms = {},
    vertex = {
        head: "",
        main: "",
    },
    fragment = {
        head: "",
        main: "",
    }
}: UseShaderParams) {
    let uniforms = useMemo(() => {
        return Object.entries(incomingUniforms)
            .map(([key, value]) => ({ [key]: { needsUpdate: false, ...value } }))
            .reduce((previous, current) => ({ ...previous, ...current }), {})
    }, [])

    return {
        uniforms,
        onBeforeCompile(shader: Shader) {
            shader.uniforms = {
                ...shader.uniforms,
                ...uniforms
            }

            shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
                #include <common>
         
                ${vertex.head}  
            `)
            shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
                #include <begin_vertex>
        
                ${vertex?.main}  
            `)
            shader.fragmentShader = shader.fragmentShader.replace("#include <common>", glsl`
                #include <common>

                ${fragment?.head}  
            `)
            shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", glsl`
                #include <dithering_fragment> 

                ${fragment?.main}  
            `)
        }
    }
}

export function useForwardMotion(
    object?: Vector3 | React.MutableRefObject<Object3D | null>,
    ownSpeed: React.RefObject<number> = { current: 0 },
    base?: Tuple3
) {
    useLayoutEffect(() => {
        if (!base) {
            return
        }

        if (object instanceof Vector3) {
            object.set(...base)
        } else if (object && object.current) {
            object.current.position.set(...base)
        }
    }, [])

    useFrame((state, delta) => {
        let player = useStore.getState().player

        if (object instanceof Vector3) {
           // object.z += (player.speed + (ownSpeed.current || 0)) * ndelta(delta)
        } else if (object && object.current) {
           // object.current.position.z += (player.speed + (ownSpeed.current || 0)) * ndelta(delta)
        }
    })
}
interface CollisionObject {
    position: Vector3
    size: Tuple3
    rotation?: number
    obb?: OBB
}


interface UseCollisionDetectionParams {
    position: Vector3
    size: Tuple2
    interval?: number
    source: CollisionObject
    predicate?: () => boolean
    actions: Record<string, (data: ClientData) => void>
}


let _box1 = new Box3()
let _box2 = new Box3()
let _size1 = new Vector3()
let _size2 = new Vector3()
let _matrix = new Matrix4()
let _quat = new Quaternion()
let _y = new Vector3(0, 1, 0)
let _scale = new Vector3(1, 1, 1)

export function getCollisions({
    grid,
    position,
    size,
    source,
    debug,
}: Omit<UseCollisionDetectionParams, "actions" | "predicate" | "interval"> & { grid: SpatialHashGrid }) {
    let near = grid.findNear([position.x, position.z], size)
    let result: Client[] = []  

    for (let i = 0; i < near.length; i++) {
        let client = near[i]

        _box1.setFromCenterAndSize(client.data.position, _size1.set(...client.data.size as Tuple3))
        _box2.setFromCenterAndSize(source.position, _size2.set(...source.size))

        // broadphase
        if (_box1.intersectsBox(_box2)) {
            // has narrowphase
            if (source.obb && typeof source.rotation === "number") {
                source.obb.center.set(0, 0, 0)
                source.obb.rotation.identity()
                source.obb.applyMatrix4(
                    _matrix.compose(
                        source.position,
                        _quat.setFromAxisAngle(_y, source.rotation),
                        _scale
                    )
                )

                // narrowphase
                if (source.obb.intersectsBox3(_box1)) {
                    result.push(client)
                }
            } else {
                // if no narrowphase, assume broadphase is enough
                result.push(client)
            }
        }
    }

    return result
}

export function useCollisionDetection({
    position,
    interval = 1,
    size,
    source,
    actions,
    predicate = () => true, 
}: UseCollisionDetectionParams) {
    let grid = useStore(i => i.world.grid)
    let tick = useRef(0)
    let types = Object.keys(actions)

    useFrame(() => {
        if (predicate() && tick.current % interval === 0) {
            let collisions = getCollisions({
                grid,
                position,
                size,
                source
            }) 

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]
                let action = actions[client.data.type]

                if (!types.includes(client.data.type)) { 
                    continue
                }

                action(client.data)
            }
        }

        tick.current++
    })
}