import { useStore } from "../../data/store"

import "./Ui.scss"

export default function Ui() {
    let player = useStore(i => i.player)

    return (
        <div className="ui">
            {player.health.toFixed(0)}%

            <div>{player.score.toLocaleString("en")}</div> 
        </div>
    )
}