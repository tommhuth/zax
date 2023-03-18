import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { Group, Mesh, Vector3 } from "three"
import { createBullet, damageBarrel, damagePlane, damagePlayer, damageTurret, dpr, setPlayerObject, useStore } from "../data/store"
import { Tuple3 } from "../types"
import { WORLD_BOTTOM_EDGE, WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "./world/World"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { clamp, ndelta } from "../utils/utils"
import { useCollisionDetection } from "../utils/hooks"
import { Owner } from "../data/types" 

let _edgemin = new Vector3(WORLD_LEFT_EDGE, WORLD_BOTTOM_EDGE, -100)
let _edgemax = new Vector3(WORLD_RIGHT_EDGE, WORLD_TOP_EDGE, 100)

let depth = 2

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

export default function Player({
    size = [1.5, .5, depth],
    z = WORLD_CENTER_X,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let hitboxRef = useRef<Mesh>(null)
    let lastShotAt = useRef(0) 
    let grid = useStore(i => i.world.grid)
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let weapon = useStore(i => i.player.weapon)
    let targetPosition = useMemo(() => new Vector3(WORLD_CENTER_X, _edgemin.y, z), [])
    let models = useLoader(GLTFLoader, "/models/space.glb")
    let position = useMemo(() => new Vector3(WORLD_CENTER_X, y, z), [])
    let client = useMemo(() => {
        return grid.newClient([0, 0, z], size, {
            type: "player",
            id: "player",
            size,
            position,
        })
    }, [grid])
    let startPosition = useMemo(() => new Vector3(), [])
    let {viewport} = useThree()
    let pixelSize = (window.innerWidth) / (window.innerWidth * dpr)
    let unitPixel = pixelSize * (viewport.width / window.innerWidth) 

    useCollisionDetection({
        position,
        size,
        interval: 3,
        source: {
            size,
            position,
        },
        actions: {
            building: () => {
                //setCameraShake(.3)
                damagePlayer(100)
            },
            turret: (data) => {
                //setCameraShake(.3)
                damagePlayer(100)
                damageTurret(data.id, 100)
            },
            barrel: (data) => {
                damageBarrel(data.id, 100)
            },
            plane: (data) => {
                //  setCameraShake(.3)
                damagePlayer(100)
                damagePlane(data.id, 100)
            }
        }
    })

    useEffect(() => {
        let shootDiv = document.getElementById("shoot") as HTMLElement
        let onKeyDown = (e: KeyboardEvent) => {
            keys[e.code] = true
        }
        let onKeyUp = (e: KeyboardEvent) => {
            delete keys[e.code] 
        }
        // shoot 
        let onTouchStartShoot = () => {
            keys.Space = true
        }
        let onTouchEndShoot = () => {
            delete keys.Space
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            shootDiv.removeEventListener("touchstart", onTouchStartShoot)
            shootDiv.removeEventListener("touchend", onTouchEndShoot)
            shootDiv.removeEventListener("touchcancel", onTouchEndShoot)
        }
    }, [])

    // input
    useFrame((state, delta) => {
        let speedx = 12
        let speedy = 10
        let nd = ndelta(delta)

        if (Object.entries(keys).length) {
            if (keys.KeyA) {
                targetPosition.x -= speedx * nd 
            } else if (keys.KeyD) {
                targetPosition.x += speedx * nd
            }

            if (keys.KeyW) {
                targetPosition.y += speedy * nd
            } else if (keys.KeyS) {
                targetPosition.y -= speedy * nd
            }

            targetPosition.clamp(_edgemin, _edgemax)
        }
 
        if (Date.now() - lastShotAt.current > weapon.fireFrequency && keys.Space) {
            createBullet({
                position: [position.x, position.y, position.z - 2],
                owner: Owner.PLAYER,
                damage: weapon.damage,
                color: weapon.color,
                rotation: Math.PI,
                speed: [0, 0, -weapon.speed], 
            })
            lastShotAt.current = Date.now() 
        }
    })

    // movement
    useFrame((state, delta) => {
        if (playerGroupRef.current && hitboxRef.current) {
            let nd = ndelta(delta)
            let playerGroup = playerGroupRef.current
            let speed  = useStore.getState().player.speed
            let y = clamp(targetPosition.y, _edgemin.y, _edgemax.y)

            playerGroup.position.x += (targetPosition.x - playerGroup.position.x) * (.08 * 60 * nd)
            playerGroup.position.y += (y - playerGroup.position.y) * (.065 * 60 * nd)
            playerGroup.position.z -= speed * nd

            startPosition.z -= speed * nd  
            hitboxRef.current.position.z = playerGroup.position.z 
            position.copy(playerGroup.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    return (
        <>
            <group
                ref={(object: Group) => {
                    playerGroupRef.current = object
                    setPlayerObject(object)
                }}
                scale={.75}
                rotation-y={Math.PI}
            >
                <primitive
                    object={models.nodes.plane}
                    receiveShadow
                    castShadow
                    userData={{ type: "player" }}
                    position={[0, 0, 0]}
                />
                <mesh userData={{ type: "player" }} visible={false}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial color="red" wireframe />
                </mesh>

            </group>
            <mesh
                ref={hitboxRef}
                position={[0, .1, 0]}
                rotation-x={-Math.PI / 2}
                onPointerMove={(e) => {
                    if (e.pointerType === "touch") {
                        targetPosition.y += (startPosition.z - e.point.z) * 1
                        targetPosition.x += (e.point.x - startPosition.x) * 1.5

                        targetPosition.clamp(_edgemin, _edgemax)
                        startPosition.copy(e.point)
                    }
                }}
                onPointerDown={(e) => {
                    if (e.pointerType === "touch") {
                        startPosition.set(e.point.x, 0, e.point.z)
                    }
                }}
            >
                <planeGeometry args={[20, 20, 1, 1]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </>
    )
}