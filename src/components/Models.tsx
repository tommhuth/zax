import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import RepeaterMesh from "./RepeaterMesh"
import InstancedMesh from "./InstancedMesh" 
import { Mesh } from "three"

export default function Models() {
    let [
        building1, building2, building3, hangar, barrel1, barrel2, 
        barrel3, barrel4, turret2, rocket, platform, device
    ] = useLoader(GLTFLoader, [
        "/models/building1.glb",
        "/models/building2.glb",
        "/models/building3.glb",
        "/models/hangar.glb",
        "/models/barrel1.glb",
        "/models/barrel2.glb",
        "/models/barrel3.glb",
        "/models/barrel4.glb",
        "/models/turret2.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
    ]) 

    return (
        <>
            <InstancedMesh name="box" count={30}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshPhongMaterial color="white" attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="sphere" count={100}>
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <meshPhongMaterial color="white" attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="line" count={35} colors={false}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <meshBasicMaterial
                    color={"#00f"}
                    attach={"material"} 
                />
            </InstancedMesh>

            <InstancedMesh name="cylinder" count={20}>
                <cylinderGeometry args={[.5, .5, 1, 10, 1]} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="barrel1" count={15}>
                <primitive object={(barrel1.nodes.barrel as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="barrel2" count={15}>
                <primitive object={(barrel2.nodes.barrel2 as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="barrel3" count={15}>
                <primitive object={(barrel3.nodes.barrel3 as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="barrel4" count={15}>
                <primitive object={(barrel4.nodes.barrel4 as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="turret" count={15}>
                <primitive object={(turret2.nodes.turret2 as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering color="#fff" />
            </InstancedMesh>

            <InstancedMesh name="rocket" count={15}>
                <primitive object={(rocket.nodes.rocket as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="platform" count={15}>
                <primitive object={(platform.nodes.platform as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

            <InstancedMesh name="device" count={50}>
                <primitive object={(device.nodes.device as Mesh).geometry} attach="geometry" />
                <meshPhongMaterial attach={"material"} dithering />
            </InstancedMesh>

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