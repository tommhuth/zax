import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Group, Vector3 } from "three"
import { createBullet, damagePlane, damagePlayer, damageTurret, Owner, setPlayerObject, setPlayerSpeed, useStore } from "../data/store"
import { Tuple3 } from "../types"
import { WORLD_BOTTOM_EDGE, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "./World"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { clamp, roundToNearest } from "../utils/utils"
import { useCollisionDetection } from "../utils/hooks"

let _edgemin = new Vector3(WORLD_LEFT_EDGE, WORLD_BOTTOM_EDGE, 0)
let _edgemax = new Vector3(WORLD_RIGHT_EDGE, WORLD_TOP_EDGE, 0)

let depth = 2

interface PlayerProps {
    size?: Tuple3
    z?: number
}

export default function Player({ size = [1.5, .5, depth], z = 7 }: PlayerProps) {
    let ref = useRef<Group | null>(null)
    let lastShotAt = useRef(0)
    let hasFired = useRef(false)
    let grid = useStore(i => i.world.grid)
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let position = useStore(i => i.player.position) 
    let activeWeapon = useStore(i => i.player.activeWeapon)
    let targetPosition = useMemo(() => new Vector3(0, _edgemin.y, 0), [])
    let models = useLoader(GLTFLoader, "/models/space.glb")
    let { viewport } = useThree()
    let client = useMemo(() => {
        return grid.newClient([0, z], [size[0], size[2]], {
            type: "player",
            id: "player",
            size,
            position,
        })
    }, [grid])
    let pixelSize = (window.innerWidth) / (window.innerWidth * (1 / 7))
    let unitPixel = pixelSize * (viewport.width / window.innerWidth)
 
    useCollisionDetection({
        position,
        size: [size[0], size[2]],
        interval: 2,
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
            plane: (data) => {
                //  setCameraShake(.3)
                damagePlayer(100)
                damagePlane(data.id, 100)
            }
        }
    })

    useEffect(() => {
        setPlayerSpeed(unitPixel * 50, unitPixel)
    }, [unitPixel])

    useEffect(() => {
        let startX: number | null = null
        let startY: number | null = null
        let shootDiv = document.getElementById("shoot") as HTMLElement
        let moveDiv = document.getElementById("move") as HTMLElement
        let onKeyDown = (e: KeyboardEvent) => {
            keys[e.code] = true

            if (e.code === "KeyW") {
                targetPosition.y = clamp(targetPosition.y + 1, _edgemin.y, _edgemax.y)
            } else if (e.code === "KeyS") {
                targetPosition.y = clamp(targetPosition.y - 1, _edgemin.y, _edgemax.y)
            }
        }
        let onKeyUp = (e: KeyboardEvent) => {
            delete keys[e.code]
            hasFired.current = false
        }
        // move 
        let onTouchStartMove = (e: TouchEvent) => {
            startX = e.changedTouches[0].clientX
            startY = e.changedTouches[0].clientY

        }
        let onTouchMoveMove = (e: TouchEvent) => {
            if (startX && startY) {
                let dx = startX - e.changedTouches[0].clientX
                let dy = startY - e.changedTouches[0].clientY

                startX = e.changedTouches[0].clientX
                startY = e.changedTouches[0].clientY

                targetPosition.x += -dx * .1
                targetPosition.y += dy * .1
                targetPosition.clamp(_edgemin, _edgemax)
            }
        }
        let onTouchEndMove = () => {
            startX = null
            startY = null
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

        moveDiv.addEventListener("touchstart", onTouchStartMove)
        moveDiv.addEventListener("touchmove", onTouchMoveMove)
        moveDiv.addEventListener("touchend", onTouchEndMove)
        moveDiv.addEventListener("touchcancel", onTouchEndMove)

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            moveDiv.removeEventListener("touchstart", onTouchStartMove)
            moveDiv.removeEventListener("touchmove", onTouchMoveMove)
            moveDiv.removeEventListener("touchend", onTouchEndMove)
            moveDiv.removeEventListener("touchcancel", onTouchEndMove)

            shootDiv.removeEventListener("touchstart", onTouchStartShoot)
            shootDiv.removeEventListener("touchend", onTouchEndShoot)
            shootDiv.removeEventListener("touchcancel", onTouchEndShoot)
        }
    }, [])

    useLayoutEffect(() => {
        position.z = z
        position.y = 1
        position.x = 0
    }, [z])

    useFrame(() => {
        let speedx = .25

        if (keys.KeyA) {
            targetPosition.x -= speedx
        } else if (keys.KeyD) {
            targetPosition.x += speedx
        }

        targetPosition.clamp(_edgemin, _edgemax)

        if (Date.now() - lastShotAt.current > activeWeapon.fireFrequency && keys.Space) {
            createBullet({
                position: [position.x, position.y, z - 2],
                owner: Owner.PLAYER,
                damage: activeWeapon.damage,
                color: activeWeapon.color,
                rotation: 0,
                speed: [0, 0, -activeWeapon.speed],
                size: activeWeapon.bulletSize
            })
            lastShotAt.current = Date.now()
            hasFired.current = true
        }
    })

    useFrame(() => {
        if (ref.current) {
            let y = clamp(targetPosition.y, _edgemin.y, _edgemax.y)

            ref.current.position.x += (targetPosition.x - ref.current.position.x) * .1
            ref.current.position.y += (y - ref.current.position.y) * .1
            ref.current.position.z = z

            position.copy(ref.current.position)

            client.position = [ref.current.position.x, z]
            grid.updateClient(client)
        }
    })

    return (
        <>
            <group
                ref={(object: Group) => {
                    ref.current = object
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
        </>
    )
}