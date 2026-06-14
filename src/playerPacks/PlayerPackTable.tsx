import { useMemo, FC } from "react";
import { Pdf, Csv } from "../types";
import { PlayerPackTableRow } from "./PlayerPackTableRow";
import { computePlayerPacks } from "./computePlayerPacks";

export const PlayerPackTable: FC<{ pdf: Pdf; csv: Csv }> = ({ pdf, csv }) => {
  const playerPacks = useMemo(
    () => computePlayerPacks(csv, pdf.pageCount),
    [csv, pdf]
  );

  return (
    <div>
      {playerPacks.map((pack, i) => (
        <PlayerPackTableRow key={i} playerPack={pack} pdf={pdf} />
      ))}
    </div>
  );
};
