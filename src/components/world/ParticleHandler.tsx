import { useFrame, useThree } from "@react-three/fiber"
import { memo } from "react"
import { removeParticle, store } from "../../data/store"
import { Particle } from "../../data/types"
import { ndelta, setColorAt, setMatrixAt } from "../../utils/utils"

function ParticleHandler() {
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame((state, delta) => {
        let { particles } = store.getState()
        let dead: Particle[] = []
        let nd = ndelta(delta)

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i]
            let floorY = 0
            let {
                position, velocity, radius, acceleration,
                friction, restitution, index, instance,
                mounted, color, rotation,
            } = particle

            if (particle.lifetime > particle.maxLifetime || position.z > diagonal * .75) {
                dead.push(particle)
                continue
            }

            if (!mounted) {
                setColorAt(instance.mesh, index, color)
                particles[i].mounted = true
            }

            position.x += velocity.x * nd
            position.y = Math.max(floorY + radius, position.y + velocity.y * nd)
            position.z += velocity.z  * nd

            if (position.y <= floorY + radius) {
                velocity.y *= -restitution
            }

            velocity.x *= friction
            velocity.z *= friction

            velocity.x += acceleration.x * nd
            velocity.y += acceleration.y * nd
            velocity.z += acceleration.z * nd

            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position.toArray(),
                scale: [radius, radius, radius],
                rotation: [
                    rotation + velocity.x * -.1,
                    rotation + velocity.y * -.1,
                    rotation + velocity.z * -.1
                ]
            })

            particles[i].lifetime++
        }

        if (dead.length) {
            removeParticle(dead.map(i => i.id)) 
        }
    })

    return null
}

export default memo(ParticleHandler)