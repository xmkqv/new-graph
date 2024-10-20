import { createMemo, Match, Switch } from "solid-js";

import { backupModifier, Query } from "~/store";

import { getNbr } from "./nbr";
import Sec from "./Sec";

type ShowQx = () => boolean;

type TileProps = {
    children?: any;
    query: Query;
};

function TileElement(props: TileProps) {
    const nbr = getNbr({ query: props.query });

    const styles = (props.query?.modifier || backupModifier)(nbr.id, "tile");

    const showQx: ShowQx = createMemo(() => {
        return (
            nbr.hovered.get() && nbr.nbrs().every((nbr) => !nbr.hovered.get())
        );
    });

    return (
        <div class="tile">
            <div
                class={styles.classes()}
                style={styles.style()}
                onmouseenter={() => nbr.hovered.toggle(true)}
                onmouseleave={() => nbr.hovered.toggle(false)}
            >
                <Switch fallback={<Sec {...nbr} />}>
                    {/* <Match when={qxNode.type() === "csv"}>
                        <Table {...qxNode} />
                    </Match> */}
                    <Match when={nbr.type() === "sec"}>
                        <Sec {...nbr} />
                    </Match>
                </Switch>
            </div>
        </div>
    );
}

export default TileElement;

export type { ShowQx };
