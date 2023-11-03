import { useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import RepeaterMesh from "./RepeaterMesh"
import InstancedMesh from "./InstancedMesh"
import { Color, DoubleSide, Group, Mesh } from "three"
import { useShader } from "../data/hooks"
import { glsl } from "../data/utils"
import { useGLTF } from "@react-three/drei"
import noise from "./../shaders/noise.glsl"
// import { OBJExporter } from "three/addons/exporters/OBJExporter.js"
import easings from "./../shaders/easings.glsl"
import { barellcolor, bcolor, buildingBase, turretColor, buildingHi, floorColor, floorColorHi, fogColorStart, fogColorEnd, deviceColor, platformColor, rocketColor, plantColor, plantColorStart, plantColorEnd } from "../data/theme"
import random from "@huth/random"
import { useEffect, useRef } from "react"


console.log(plantColorStart.toArray().join(", "))

export function FogMat({
    color = bcolor,
    isInstance = true,
    fragmentShader = "",
    vertexShader = "",
    ...rest
}) {
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uFogColorStart: { value: new Color(fogColorStart) },
            uFogColorEnd: { value: new Color(fogColorEnd) },
        },
        vertex: {
            head: glsl`
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 

                ${easings}
            `,
            main: glsl` 
                vec4 globalPosition = ${isInstance ? "instanceMatrix" : "modelMatrix"}  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz;

                ${vertexShader}
            `
        },
        fragment: {
            head: glsl` 
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 
                uniform vec3 uFogColorStart; 
                uniform vec3 uFogColorEnd; 
                ${noise}
                ${easings}
            `,
            main: glsl` 
                ${fragmentShader}

                float fogDensity = .75;
                vec3 bottomColor = mix(uFogColorStart, gl_FragColor.rgb , 1. - fogDensity); 
                float heightDistance = 2.8;
                
                
                gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, easeOutCubic(clamp(vGlobalPosition.y / heightDistance, .0, 1.)));
            
                  /*

                float fogScale = .095;
                float verticalScale = .1;
                vec3 pos = vec3(
                    vPosition.x * fogScale + uTime, 
                    vPosition.y * verticalScale + uTime, 
                    vPosition.z * fogScale * 1.2
                );
                float fogDensity = 1.;
                float heightRange = 8.;
                float heightOffset = 0.;
                float heightEffect = easeInQuad(1. - clamp((vPosition.y - heightOffset) / heightRange, 0., 1.));
                float fogEffect = easeInOutCubic((noise(pos) + 1.) / 2.) * 1.;

                vec3 baseColor = gl_FragColor.rgb; 
                vec3 fogColor = mix(uFogColorStart, uFogColorStart, easeInOutCubic(clamp(vPosition.y / heightRange, 0., 1.)));

                gl_FragColor = vec4(mix(baseColor, fogColor, heightEffect * fogEffect * fogDensity), 1.);
              */
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += delta * .2
        uniforms.uTime.needsUpdate = true
    })

    return (
        <meshLambertMaterial
            onBeforeCompile={onBeforeCompile}
            color={color}
            attach={"material"}
            dithering
            {...rest}
        />
    )
}

/*
function Grass2({
    position = [0, 0, -20],
    bladeSize = [.25, 2],
    bladeGap = .15,
    size = [30, 40],
}) {
    let totalWidth = size[0] * bladeSize[0] + (size[0] - 1) * bladeSize[0]
    let totalDepth = size[1] * bladeSize[0] + (size[1] - 1) * bladeSize[0]
    let ref = useRef<Group>(null)

    useEffect(() => {
        let e = new OBJExporter()
        let l = document.createElement("a")

        l.href = "data:text/obj," +  e.parse(ref.current), {type: "text/obj"}
        l.download = "grss.obj" 

        l.click()
        


    }, [])

    return (
        <group ref={ref}>
            {new Array(size[0]).fill(null).map((i, xi) => {
                return new Array(size[1]).fill(null).map((i, zi) => {
                    return (
                        <mesh
                            position={[
                                position[0] + xi * bladeSize[0] + (xi - 1) * bladeGap - totalWidth / 2 + random.float(-.05, .05),
                                position[1] + bladeSize[1] / 2,
                                position[2] + zi * bladeSize[0] + (zi - 1) * bladeGap - totalDepth / 2,
                            ]}
                            key={xi + "-" + zi}
                            rotation-y={Math.PI / 4 + random.float(-.05, .05)}
                        >
                            <planeGeometry args={[bladeSize[0], bladeSize[1] + random.float(-.5, .5), 1, 4]} />
                            <FogMat
                                color={plantColor}
                                isInstance={false}
                                transparent
                                vertexShader={glsl`
                                    float heightScale = clamp(globalPosition.y / 10., 0., 1.);
                                    float offsetSize = 1.;
                                    float timeScale = 7.;

                                    transformed.x += cos( (globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                                    transformed.x += cos( (globalPosition.z) * .4 + uTime * timeScale) * heightScale * 1.1 * offsetSize;
                                    // transformed.z += cos(globalPosition.z * .1 + uTime) * heightScale * offsetSize;
                                `}
                                fragmentShader={glsl`
                                    vec3 start = mix(gl_FragColor.rgb, vec3(${plantColorStart.toArray().map(i => i + .001).join(", ")}), .2);
                                    vec3 end = mix(gl_FragColor.rgb, vec3(${plantColorEnd.toArray().map(i => i + .001).join(", ")}), .9);
            
                                    gl_FragColor.rgb = mix(start, end, (clamp(vGlobalPosition.y / ${bladeSize[1] * .99}, 0., 1.)));
                                    gl_FragColor.a = clamp((vGlobalPosition.y) / .5, 0., 1.);
                                `}
                            />
                        </mesh>
                    )
                })
            })}
        </group>
    )
}
*/

export default function Models() {
    let [
        barrel1, barrel2, barrel3, barrel4,
        turret2, rocket, platform, device, plant, grass,
    ] = useLoader(GLTFLoader, [
        "/models/barrel1.glb",
        "/models/barrel2.glb",
        "/models/barrel3.glb",
        "/models/barrel4.glb",
        "/models/turret2.glb",
        "/models/rocket.glb",
        "/models/platform.glb",
        "/models/device.glb",
        "/models/plant.glb", 
        "/models/grass.glb"
    ])

    return (
        <>  
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
                <meshBasicMaterial color={"white"} />
            </InstancedMesh>

            <InstancedMesh name="cylinder" count={20}>
                <cylinderGeometry args={[.5, .5, 1, 10, 1]} attach="geometry" />
                <FogMat />
            </InstancedMesh>

            <InstancedMesh name="barrel1" count={15}>
                <primitive object={(barrel1.nodes.barrel as Mesh).geometry} attach="geometry" />
                <FogMat color={barellcolor} emissive={barellcolor} emissiveIntensity={.2} />
            </InstancedMesh>

            <InstancedMesh name="barrel2" count={15}>
                <primitive object={(barrel2.nodes.barrel2 as Mesh).geometry} attach="geometry" />
                <FogMat color={barellcolor} emissive={barellcolor} emissiveIntensity={.2} />
            </InstancedMesh>

            <InstancedMesh name="barrel3" count={15}>
                <primitive object={(barrel3.nodes.barrel3 as Mesh).geometry} attach="geometry" />
                <FogMat color={barellcolor} emissive={barellcolor} emissiveIntensity={.2} />
            </InstancedMesh>

            <InstancedMesh name="barrel4" count={15}>
                <primitive object={(barrel4.nodes.barrel4 as Mesh).geometry} attach="geometry" />
                <FogMat color={barellcolor} emissive={barellcolor} emissiveIntensity={.2} />
            </InstancedMesh>

            <InstancedMesh name="plant" count={15} castShadow={false}>
                <primitive object={(plant.nodes.plant as Mesh).geometry} attach="geometry" />
                <FogMat
                    color={plantColor}
                    side={DoubleSide}
                    vertexShader={glsl`
                        float height = 2.75;
                        float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                        float offsetSize = .4;
                        float timeScale = 11.;

                        transformed.x += cos( (globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.x += cos( (globalPosition.z) * .4 + uTime * timeScale) * heightScale * 1.1 * offsetSize;

                        transformed.z += cos( (globalPosition.z) * .35 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.z += cos( (globalPosition.z) * .24 + uTime * timeScale) * heightScale * .9 * offsetSize;

                        transformed.y += cos( (globalPosition.y) * .35 + uTime * timeScale) * heightScale * offsetSize * .4;
                        transformed.y += cos( (globalPosition.y) * .3 + uTime * timeScale) * heightScale * .95 * offsetSize * .35;  
                    `}
                    fragmentShader={glsl`
                        vec3 start = mix(gl_FragColor.rgb, vec3(${plantColorStart.toArray().map(i => i + .001).join(", ")}), .5);
                        vec3 end = mix(gl_FragColor.rgb, vec3(${plantColorEnd.toArray().map(i => i + .001).join(", ")}), .5);
 
                        gl_FragColor.rgb = mix(start, end, easeInOutCubic(clamp(length(vPosition) / 5., 0., 1.)));
                    `}
                />
            </InstancedMesh>

            <InstancedMesh name="turret" count={15}>
                <primitive object={(turret2.nodes.turret2 as Mesh).geometry} attach="geometry" />
                <FogMat color={turretColor} isInstance />
            </InstancedMesh>

            <InstancedMesh name="rocket" count={15}>
                <primitive object={(rocket.nodes.rocket as Mesh).geometry} attach="geometry" />
                <FogMat color={rocketColor} />
            </InstancedMesh>

            <InstancedMesh name="platform" count={15}>
                <primitive object={(platform.nodes.platform as Mesh).geometry} attach="geometry" />
                <FogMat color={platformColor} />
            </InstancedMesh>

            <InstancedMesh castShadow={false} name="device" count={30}>
                <primitive object={(device.nodes.device as Mesh).geometry} attach="geometry" />
                <FogMat color={deviceColor} />
            </InstancedMesh>

            <InstancedMesh
                castShadow={false}
                receiveShadow={false}
                colors={false}
                name="grass"
                count={4}
            >
                <primitive object={(grass.nodes.grass as Mesh).geometry} attach="geometry" />
                <FogMat
                    color={plantColor} 
                    side={DoubleSide}
                    transparent
                    vertexShader={glsl`
                        float height = 1.75;
                        float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                        float offsetSize = .4;
                        float timeScale = 8.;

                        transformed.x += cos( (globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                        transformed.x += cos( (globalPosition.z) * .4 + uTime * timeScale) * heightScale * 1.1 * offsetSize;
                        // transformed.z += cos(globalPosition.z * .1 + uTime) * heightScale * offsetSize;
                    `}
                    fragmentShader={glsl`
                        float height = 1.75;
                        vec3 start = mix(gl_FragColor.rgb, vec3(${plantColorStart.toArray().map(i => i + .001).join(", ")}), .2);
                        vec3 end = mix(gl_FragColor.rgb, vec3(${plantColorEnd.toArray().map(i => i + .001).join(", ")}), .9);

                        gl_FragColor.rgb = mix(start, end, (clamp((vPosition.y) / height, 0., 1.)));
                        gl_FragColor.a = clamp((vPosition.y ) / .35, 0., 1.);
                    `}
                />
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
            <RepeaterMesh
                name="floor1"
                count={10}
            >
                <Floor1 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor2"
                count={10}
            >
                <Floor2 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor3"
                count={10}
            >
                <Floor3 />
            </RepeaterMesh>
            <RepeaterMesh
                name="floor4"
                count={10}
            >
                <Floor4 />
            </RepeaterMesh>

        </>
    )
}


function Floor4(props) {
    const { nodes, materials } = useGLTF("/models/floor4.glb")

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005"] as Mesh).geometry}
            >
                <FogMat color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_1"] as Mesh).geometry}
            >
                <FogMat color={floorColorHi} />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_2"] as Mesh).geometry}
            >
                <FogMat color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_3"] as Mesh).geometry}
            >
                <FogMat color="white" />
            </mesh>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_4"] as Mesh).geometry}
            >
                <FogMat color={floorColor} />
            </mesh>
        </group>
    )
}

export function Floor3(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor3.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                receiveShadow
                geometry={nodes.floor3.geometry}
            >
                <FogMat color={floorColor} />
            </mesh>
        </group>
    )
}

function Floor2(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor2.glb")

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.floor2.geometry}
            >
                <FogMat color={floorColor} />
            </mesh>
        </group>
    )
}

export function Floor1(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor1b.glb")

    return (
        <group {...props} dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001.geometry}
                >
                    <FogMat color={floorColor} />
                </mesh>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001_1.geometry}
                >
                    <FogMat color={floorColorHi} />
                </mesh>
            </group>
        </group>
    )
}

export function Hanger(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/hangar.glb")

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.Cube.geometry}
            >
                <FogMat isInstance={false} color={buildingBase} />
            </mesh>
            <mesh
                receiveShadow
                geometry={nodes.Cube_1.geometry}
            >
                <FogMat isInstance={false} color={buildingHi} />
            </mesh>
        </group>
    )
}


export function Building3(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/building3.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003.geometry}
            >
                <FogMat isInstance={false} color={buildingBase} />
            </mesh>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003_1.geometry}
            >
                <FogMat isInstance={false} color={buildingHi} />
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
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube006.geometry}
                >
                    <FogMat isInstance={false} color={buildingBase} />
                </mesh>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube006_1.geometry}
                >
                    <FogMat isInstance={false} color={buildingHi} />
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
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube007.geometry}
                >
                    <FogMat isInstance={false} color={buildingBase} />
                </mesh>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube007_1.geometry}
                >
                    <FogMat isInstance={false} color={buildingHi} />
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