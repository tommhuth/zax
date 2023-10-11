import { useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import RepeaterMesh from "./RepeaterMesh"
import InstancedMesh from "./InstancedMesh"
import { Mesh } from "three"
import { useShader } from "../data/hooks"
import { glsl } from "../data/utils"
import { useGLTF } from "@react-three/drei"
import noise from "./../shaders/noise.glsl"
import easings from "./../shaders/easings.glsl"


export function FogMat({ color = "white", isInstance = true }) {
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 }
        },
        vertex: {
            head: glsl`
                varying vec4 vPosition;   
                uniform float uTime; 
            `,
            main: glsl` 
                vec4 globalPosition = ${isInstance ? "instanceMatrix" : "modelMatrix"}  * vec4(position, 1.);

                vPosition = globalPosition;
            `
        },
        fragment: {
            head: glsl` 
                varying vec4 vPosition; 
                uniform float uTime; 
                ${noise}
                ${easings}
            `,
            main: glsl`
                float fogScale = .15;
                float verticalScale = .6;
                vec3 pos = vec3(
                    vPosition.x * fogScale + uTime * 2., 
                    vPosition.y * verticalScale + uTime * 1.25, 
                    vPosition.z * fogScale * 1.5
                );
                float fogDensity = .9;
                float heightRange = 3.;
                float heightOffset = .2;
                float heightEffect = easeInQuad(1. - clamp((vPosition.y - heightOffset) / heightRange, 0., 1.));
                float fogEffect = easeInOutCubic((noise(pos ) + 1.) / 2.);

                vec3 baseColor = gl_FragColor.rgb;
                vec3 fogColor = vec3(0.7, .8, 1.); // .7 .8 1

                gl_FragColor = vec4(mix(baseColor, fogColor, heightEffect * fogEffect * fogDensity), 1.);
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += delta * .2
        uniforms.uTime.needsUpdate = true
    })

    return (
        <meshPhongMaterial onBeforeCompile={onBeforeCompile} color={color} attach={"material"} dithering />
    )
}

export default function Models() {
    let [
        barrel1, barrel2, barrel3, barrel4,
        turret2, rocket, platform, device
    ] = useLoader(GLTFLoader, [
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
            <Building1 />
            <InstancedMesh name="box" count={30}>
                <boxGeometry args={[1, 1, 1, 1, 1, 1]} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="sphere" count={100}>
                <sphereGeometry args={[1, 3, 4]} attach="geometry" />
                <FogMat />
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
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="barrel1" count={15}>
                <primitive object={(barrel1.nodes.barrel as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="barrel2" count={15}>
                <primitive object={(barrel2.nodes.barrel2 as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="barrel3" count={15}>
                <primitive object={(barrel3.nodes.barrel3 as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="barrel4" count={15}>
                <primitive object={(barrel4.nodes.barrel4 as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="turret" count={15}>
                <primitive object={(turret2.nodes.turret2 as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="rocket" count={15}>
                <primitive object={(rocket.nodes.rocket as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="platform" count={15}>
                <primitive object={(platform.nodes.platform as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="device" count={50}>
                <primitive object={(device.nodes.device as Mesh).geometry} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <RepeaterMesh
                name="building1"
                count={10}
            >
                <Building1 />
            </RepeaterMesh>

            <RepeaterMesh
                name="building2"
                count={10}
            >
                <Building2 />
            </RepeaterMesh>
            <RepeaterMesh
                name="building3"
                count={10}
            >
                <Building3 />
            </RepeaterMesh>
            <RepeaterMesh
                name="hangar"
                count={10}
            >
                <Hanger />
            </RepeaterMesh>
        </>
    )
}

export function Hanger(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/hangar.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube.geometry}
            >
                <FogMat isInstance={false} color="white" />
            </mesh>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube_1.geometry}
            >
                <FogMat isInstance={false} color="black" />
            </mesh>
        </group>
    )
}

export function Building3(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/building3.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube003.geometry}
            >
                <FogMat isInstance={false} color="white" />
            </mesh>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube003_1.geometry}
            >
                <FogMat isInstance={false} color="black" />
            </mesh>
        </group>
    )
}

export function Building2(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/building2.glb")

    return (
        <group {...props} dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006.geometry}
                >
                    <FogMat isInstance={false} color="white" />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006_1.geometry}
                >
                    <FogMat isInstance={false} color="black" />
                </mesh>
            </group>
        </group>
    )
}

function Building1() {
    const { nodes }: { nodes: any } = useGLTF("/models/building1.glb")

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007.geometry}
                >
                    <FogMat isInstance={false} color="white" />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007_1.geometry}
                >
                    <FogMat isInstance={false} color="black" />
                </mesh>
            </group>
        </group>
    )
}



/*


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
            */