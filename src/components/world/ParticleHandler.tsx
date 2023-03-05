import { useFrame, useThree } from "@react-three/fiber"
import { memo } from "react"
import { Vector3 } from "three"
import { removeParticle, store } from "../../data/store"
import { Particle, WorldPart } from "../../data/types"
import { setColorAt, setMatrixAt } from "../../utils/utils"

function ParticleHandler() {
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame((state, delta) => {
        let { particles, player } = store.getState()
        let dead: Particle[] = []

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

            position.x += velocity.x * delta
            position.y = Math.max(floorY + radius, position.y + velocity.y * delta)
            position.z += (velocity.z + player.speed) * delta

            if (position.y <= floorY + radius) {
                velocity.y *= -restitution
            }

            velocity.x *= friction
            velocity.z *= friction

            velocity.x += acceleration.x * delta
            velocity.y += acceleration.y * delta
            velocity.z += acceleration.z * delta

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

            for (let i = 0; i < dead.length; i++) {
                let particle = dead[i]

                setMatrixAt({
                    instance: particle.instance.mesh,
                    index: particle.index,
                    position: [0, 0, -1000],
                    scale: [0, 0, 0],
                })
            }
        }
    })

    return null
}

export default memo(ParticleHandler)