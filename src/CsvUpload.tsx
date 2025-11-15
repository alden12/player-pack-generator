import { ChangeEvent, FC, useCallback, useState } from "react";
import { parse } from "papaparse";

export type Csv = string[][];

export interface CsvUploadProps {
  handleUpload: (csv?: Csv) => void;
}

export const CsvUpload: FC<CsvUploadProps> = ({ handleUpload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleUpload(undefined);
        setLoading(true);
        setError(undefined);
        const file = e.target.files[0];
        parse(file, {
          complete: ({ data }) => handleUpload(data as Csv),
          error: (error) => {
            setError(error);
            setLoading(false);
          },
        });
        setLoading(false);
      }
    },
    [handleUpload]
  );

  return (
    <div className="upload">
      Upload CSV
      <input type="file" accept="application/csv" onChange={handleFileChange} />
      {loading && "Loading..."}
      {error && `Error parsing CSV: ${error}`}
    </div>
  );
};
