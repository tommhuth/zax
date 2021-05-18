import Model from "../../Model" 

export default function AsteroidEnd({ z }) {
    return (
        <>
            <Model name="asttop" receiveShadow={true} castShadow={false} position={[0, 0, z]} scale={[1, 1, -1]} />
            <Model name="astbottom" receiveShadow={false} position={[0, 0, z]} scale={[1, 1, -1]} />
        </>
    )
}