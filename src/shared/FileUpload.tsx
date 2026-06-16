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
  const [error, setError] = useState<string>();

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
          // Prefer the handler's own message (handlers throw human-readable
          // errors); fall back to a generic line for anything unexpected.
          setError(
            error instanceof Error
              ? error.message
              : "Could not read this file. Please check it and try again."
          );
        }
        setLoading(false);
      }
    },
    [handleUpload]
  );

  return (
    <div className="m-2 w-1/2 min-w-[275px] border-b border-slate-700 p-2">
      {children}
      <input type="file" accept={accept} onChange={handleFileChange} />
      {loading && <p className="mt-1 text-sm text-slate-400">Loading...</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
