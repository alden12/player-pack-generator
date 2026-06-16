import { FC, useState } from "react";

export const CsvExample: FC = () => {
  const [showExample, setShowExample] = useState(false);

  return (
    <div onClick={() => setShowExample(!showExample)}>
      <div className="cursor-pointer p-4 text-lg opacity-70">
        ⓘ {showExample ? "Hide" : "Show"} Example CSV
      </div>
      {showExample && <ExampleCsvTable />}
    </div>
  );
};

const ExampleCsvTable: FC = () => (
  <>
    <div className="text-left text-lg">
      <ul className="list-disc pl-5">
        <li>
          Each column header represents page numbers (comma separated for
          multiple pages) in the PDF.
        </li>
        <li>
          Each subsequent row represents a player. Use the include value (
          <code>y</code> by default) to include the corresponding page(s) in
          that player pack, or the append value (<code>n</code> by default) to
          append the page(s) at the end. Any other value (including blank)
          excludes the page(s). The values and case sensitivity are
          configurable below once your files are uploaded.
        </li>
      </ul>
    </div>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>1,2</th>
          <th>3</th>
          <th>4,5</th>
          <th>6</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice</td>
          <td>y</td>
          <td>n</td>
          <td>y</td>
          <td></td>
        </tr>
        <tr>
          <td>Bob</td>
          <td></td>
          <td>y</td>
          <td>n</td>
          <td>y</td>
        </tr>
        <tr>
          <td>Charlie</td>
          <td>y</td>
          <td></td>
          <td></td>
          <td>n</td>
        </tr>
      </tbody>
    </table>
  </>
);
