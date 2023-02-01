import { Tuple3 } from "../types"

export interface Weapon {
    name: string
    damage: number
    bulletSize: Tuple3
    speed: number
    color: string
    automatic: boolean
    fireFrequency: number
    overheatAt: number
    heatIncrease: number
    heatDecreaseFactor: number
}

export const weapons: Weapon[] = [
    {
        name: "Default gun",
        fireFrequency: 175,
        damage: 35,
        color: "yellow",
        automatic: true,
        overheatAt: 100,
        heatIncrease: 14,
        heatDecreaseFactor: 1,
        speed: 40,
        bulletSize: [.125, .125, 1.25]
    },
    {
        name: "Light gun",
        fireFrequency: 125,
        damage: 14,
        color: "white",
        automatic: true,
        overheatAt: 100,
        heatIncrease: 10,
        heatDecreaseFactor: 1,
        speed: 32,
        bulletSize: [.125, .125, .8]
    },
    {
        name: "Heavy gun",
        fireFrequency: 550,
        damage: 65,
        color: "black",
        automatic: false,
        overheatAt: 100,
        heatIncrease: 10,
        heatDecreaseFactor: .751,
        speed: 20,
        bulletSize: [.15, .15, 1.5]
    }
]