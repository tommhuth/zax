import { useFrame, useThree } from "@react-three/fiber"
import { removeParticle, store } from "../data/store"
import { ndelta, roundToNearest, setColorAt, setMatrixAt } from "../utils/utils"

export default function ParticleHandler() {
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame((state, delta) => {
        let { particles, player } = store.getState()
        let dead: string[] = []

        for (let i = 0; i < particles.length; i++) {
            let {
                position, velocity, radius, acceleration,
                friction, restitution, index, instance,
                mounted, color, id, rotation
            } = particles[i]

            if (!mounted) {
                setColorAt(instance.mesh, index, color)
                particles[i].mounted = true
            }

            if (position.z > diagonal * .75) {
                dead.push(id)
            }

            position.x += velocity.x * ndelta(delta)
            position.y += velocity.y * ndelta(delta)
            position.z += (velocity.z + player.speed) * ndelta(delta) 

            if (position.y > radius) {
                velocity.multiplyScalar(friction)
                velocity.add(acceleration)
            } else {
                velocity.multiplyScalar(.85)
                acceleration.multiplyScalar(.6)
                velocity.y *= -restitution
                position.y = radius
            }

            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position.toArray(),
                scale: [radius, radius, radius],
                rotation: [
                    rotation + velocity.x * .25,
                    rotation + velocity.y * .25,
                    rotation + velocity.z * .25
                ]
            })
        }

        removeParticle(dead)
    })

    return null
}