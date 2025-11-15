import {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";

export type FileUploadProps = PropsWithChildren<{
  handleUpload: (file?: File) => Promise<void> | void;
  accept?: string;
}>;

export const FileUpload: FC<FileUploadProps> = ({
  handleUpload,
  children,
  accept,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleUpload(undefined);
        setLoading(true);
        setError(undefined);
        const file = e.target.files[0];
        try {
          await handleUpload(file);
        } catch (error) {
          setError(new Error(String(error)));
        }
        setLoading(false);
      }
    },
    [handleUpload]
  );

  return (
    <div className="upload">
      {children}
      <input type="file" accept={accept} onChange={handleFileChange} />
      {loading && "Loading..."}
      {error && `Error parsing file: ${error}`}
    </div>
  );
};
