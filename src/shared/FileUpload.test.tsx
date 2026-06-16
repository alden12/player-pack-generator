import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUpload } from "./FileUpload";

const makeFile = () => new File(["a,b\n1,2"], "test.csv", { type: "text/csv" });

const uploadFile = (container: HTMLElement) => {
  const input = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [makeFile()] } });
};

describe("FileUpload", () => {
  it("renders its children", () => {
    render(<FileUpload handleUpload={async () => {}}>Upload CSV</FileUpload>);
    expect(screen.getByText("Upload CSV")).toBeInTheDocument();
  });

  it("shows a loading indicator while the upload handler is pending", async () => {
    let finish!: () => void;
    // Mirror the real handler contract: undefined (the reset call) resolves
    // immediately; a file returns a promise we control.
    const handleUpload = vi.fn((file?: File) =>
      file ? new Promise<void>((resolve) => (finish = resolve)) : Promise.resolve()
    );

    const { container } = render(
      <FileUpload handleUpload={handleUpload}>x</FileUpload>
    );
    uploadFile(container);

    expect(await screen.findByText(/Loading/)).toBeInTheDocument();

    finish();
    await waitFor(() =>
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
    );
  });

  it("surfaces the handler's error message", async () => {
    const handleUpload = vi.fn(async (file?: File) => {
      if (file) throw new Error("bad csv");
    });

    const { container } = render(
      <FileUpload handleUpload={handleUpload}>x</FileUpload>
    );
    uploadFile(container);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("bad csv");
  });
});
