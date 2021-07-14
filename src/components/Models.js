
import React, { useState, useRef, useContext, useMemo, useEffect, useCallback } from "react"
import { Euler, Matrix4, MeshLambertMaterial, Quaternion, Vector3 } from "three"
import { useGeometry } from "../Model"

let meteorIndex = 0
const meteorIndexMax = 150
const context = React.createContext()

export function ModelsProvider({ children, }) {
    let meteor = useRef()
    let meteorMaterial = useMemo(() => new MeshLambertMaterial({ color: "brown" }), [])
    let meteorGeometry = useGeometry("meteor")
    let [models, setModels] = useState({}) 

    useEffect(() => {
        setModels(i => ({ ...i, meteor: meteor.current }))
    }, [meteorGeometry])
 

    return (
        <context.Provider value={models}>
            <instancedMesh
                receiveShadow
                ref={meteor}
                args={[meteorGeometry, meteorMaterial, meteorIndexMax]}
            />
            {children}
        </context.Provider>
    )
}

export function useModels() {
    return useContext(context)
}

export function useMeteor() {
    let [index] = useState(() => {
        if (meteorIndex < meteorIndexMax) {
            meteorIndex += 1

            return meteorIndex
        } else {
            meteorIndex = 0

            return meteorIndex
        }
    })
    let { meteor } = useModels()
    let translation = useMemo(() => new Vector3(), [])
    let scaling = useMemo(() => new Vector3(), [])
    let euler = useMemo(() => new Euler(), [])
    let matrix = useMemo(() => new Matrix4(), [])
    let quaternion = useMemo(() => new Quaternion(), [])
    let update = useCallback(({
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        scale = [1, 1, 1],
        color
    }) => {
        if (!meteor) {
            return
        }

        meteor.setMatrixAt(
            index,
            matrix.compose(
                translation.set(...position),
                quaternion.setFromEuler(euler.set(...rotation)),
                scaling.set(...scale)
            )
        )
        meteor.instanceMatrix.needsUpdate = true

        if (color) {
            meteor.setColorAt(index, color)
            meteor.instanceColor.needsUpdate = true
        }
    }, [index, translation, matrix, quaternion, meteor, euler, scaling])

    useEffect(()=> {
        return () => {
            //update({position: [0,0, -1000]})
        }
    }, [])

    return update
}