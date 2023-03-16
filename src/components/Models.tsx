import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import RepeaterMesh from "./RepeaterMesh"

export default function Models() {
    let [building1, building2, building3, hangar] = useLoader(GLTFLoader, [
        "/models/building1.glb",
        "/models/building2.glb",
        "/models/building3.glb",
        "/models/hangar.glb"
    ])

    return (
        <>
            <RepeaterMesh
                name="building1"
                count={10}
                object={building1.nodes.building1}
            />
            <RepeaterMesh
                name="building2"
                count={10}
                object={building2.nodes.building2}
            />
            <RepeaterMesh
                name="building3"
                count={10}
                object={building3.nodes.building3}
            />
            <RepeaterMesh
                name="hangar"
                count={10}
                object={hangar.nodes.hangar}
            />
        </>
    )
}