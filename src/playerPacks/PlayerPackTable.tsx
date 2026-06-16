import { useMemo, FC } from "react";
import { Pdf, Csv } from "../types";
import { PlayerPackTableRow } from "./PlayerPackTableRow";
import { computePlayerPacks, PlayerPackOptions } from "./computePlayerPacks";

export const PlayerPackTable: FC<{
  pdf: Pdf;
  csv: Csv;
  options: PlayerPackOptions;
}> = ({ pdf, csv, options }) => {
  const playerPacks = useMemo(
    () => computePlayerPacks(csv, pdf.pageCount, options),
    [csv, pdf, options]
  );

  return (
    <div>
      {playerPacks.map((pack, i) => (
        <PlayerPackTableRow key={i} playerPack={pack} pdf={pdf} />
      ))}
    </div>
  );
};
