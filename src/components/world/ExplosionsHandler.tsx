import { startTransition, useEffect, useMemo, useRef } from "react"
import { AdditiveBlending, BufferAttribute, MultiplyBlending, Sprite } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../utils/utils"
import { useShader } from "../../utils/hooks"
import { removeExplosion, useStore } from "../../data/store"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import InstancedMesh from "../InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader"

function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

function blend(values = [75, 100, 0], t = 0, threshold = .5) {
    let left = t >= threshold ? 1 : 0
    let right = left + 1

    if (t <= threshold) {
        return (1 - t / (1 - threshold)) * values[left] + t / (1 - threshold) * values[right]
    }

    return (1 - (t - threshold) / (1 - threshold)) * values[left] + (t - threshold) / (1 - threshold) * values[right]
}

export default function ExplosionsHandler() {
    let latestExplosion = useStore(i => i.explosions[0])
    let glowMap = useLoader(TextureLoader, "/textures/glow.png")
    let ref = useRef<Sprite>(null)
    let centerAttributes = useMemo(() => {
        return new Float32Array(new Array(100 * 3).fill(0))
    }, [])
    let lifetimeAttributes = useMemo(() => {
        return new Float32Array(new Array(100).fill(0))
    }, [])
    let instance = useStore(i => i.instances.fireball?.mesh)
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl` 
                attribute vec3 aCenter;   
                varying float vDistance;
                varying float vLifetime;
                varying vec3 vPosition;
                attribute float aLifetime; 
                
                float easeInOutQuint(float x) {
                    return x < 0.5 ? 16. * x * x * x * x * x : 1. - pow(-2. * x + 2., 5.) / 2.;
                }

                float easeInOutCubic(float x) {
                    return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
                }

                float easeOutQuint(float x) {
                    return 1. - pow(1. - x, 5.);
                }

            `,
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);  
                float radius = 6.;
 
                vDistance = clamp(length(globalPosition.xyz - aCenter) / radius, 0., 1.); // );
                vLifetime = aLifetime;
                vPosition = globalPosition.xyz; 
            `
        },
        fragment: {
            head: glsl`  
                varying float vDistance; 
                varying float vLifetime;
                varying vec3 vPosition; 
                
                float easeInOutCubic(float x) {
                    return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
                }

                float easeOutQuart(float x) {
                    return 1. - pow(1. - x, 2.);
                }

                float easeInCubic(float x) {
                    return x * x * x;
                }
            `,
            main: glsl`   
                vec3 start = vec3(.0, 0.3, 1.); 
                vec3 mid = vec3(0.05, .9, 1.)  ; 
                vec3 end = vec3(0., 0.1, .450); // vec3(.0, .3, .85)  ; 

                vec3 c1 = mix(start, mid, easeInOutCubic(vDistance));
                vec3 c2 = mix(c1, end,   (vLifetime));

                gl_FragColor = vec4(c2, 1.);
            `
        }
    })

    useEffect(() => {
        if (!instance || !latestExplosion) {
            return
        }

        let attribute = instance.geometry.attributes.aCenter as BufferAttribute

        for (let fireball of latestExplosion.fireballs) {
            attribute.setXYZ(fireball.index, ...latestExplosion.position)
            attribute.needsUpdate = true
        }
    }, [latestExplosion])

    useFrame((state, delta) => {
        if (!instance) {
            return
        }

        let explosions = useStore.getState().explosions
        let dead: string[] = []

        for (let explosion of explosions) {
            if (explosion.fireballs[0].time > explosion.fireballs[0].lifetime) {
                dead.push(explosion.id)
                continue
            }

            for (let sphere of explosion.fireballs) {
                let t = clamp(sphere.time / sphere.lifetime, 0, 1)
                let scale = blend([sphere.startRadius, sphere.maxRadius, 0], easeOutQuart(t))

                if (sphere.time < 0) {
                    scale = 0
                }

                let attribute = instance.geometry.attributes.aLifetime as BufferAttribute

                attribute.set([t], sphere.index)
                attribute.needsUpdate = true

                setMatrixAt({
                    instance: instance,
                    index: sphere.index,
                    position: [
                        sphere.position[0],
                        sphere.position[1] + t * (sphere.index % 3 + 1),
                        sphere.position[2],
                    ],
                    scale
                })

                sphere.time += ndelta(delta) * 1000
            }
        }

        if (dead.length) {
            startTransition(() => removeExplosion(dead))
        }
    })

    useEffect(() => {
        if (ref.current && latestExplosion) {
            ref.current.position.set(...latestExplosion.position)
            ref.current.position.y += 6
            ref.current.position.x += 5
            ref.current.position.z += 5
            ref.current.material.opacity = 1
        }
    }, [latestExplosion])

    useFrame(() => {
        if (ref.current) {
            ref.current.material.opacity *= .95
        }
    })

    return (
        <>
            <InstancedMesh castShadow={false} receiveShadow={false} count={100} name="fireball">
                <sphereGeometry args={[1, 12, 12]} >
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aCenter"
                        args={[centerAttributes, 3, false, 1]}
                    />
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aLifetime"
                        args={[lifetimeAttributes, 1, false, 1]}
                    />
                </sphereGeometry>
                <meshBasicMaterial onBeforeCompile={onBeforeCompile} color={"white"} />
            </InstancedMesh>

            <sprite ref={ref} scale={10}>
                <spriteMaterial color="blue" map={glowMap} transparent blending={AdditiveBlending} />
            </sprite>
        </>
    )
}