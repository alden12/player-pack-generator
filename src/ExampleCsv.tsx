import { FC, useState } from "react";

export const CsvExample: FC = () => {
  const [showExample, setShowExample] = useState(false);

  return (
    <div onClick={() => setShowExample(!showExample)}>
      <div className="example-toggle">
        ⓘ {showExample ? "Hide" : "Show"} Example CSV
      </div>
      {showExample && <ExampleCsvTable />}
    </div>
  );
};

const ExampleCsvTable: FC = () => (
  <>
    <div className="example-text">
      <ul>
        <li>
          Each column header represents page numbers (comma separated for
          multiple pages) in the PDF.
        </li>
        <li>
          Each subsequent row represents a player. Use "TRUE" to include the
          corresponding page(s) in that player pack, or "FALSE" to append the
          page(s) at the end. Leave blank to exclude the page(s) from the pack.
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
          <td>TRUE</td>
          <td>FALSE</td>
          <td>TRUE</td>
          <td></td>
        </tr>
        <tr>
          <td>Bob</td>
          <td></td>
          <td>TRUE</td>
          <td>FALSE</td>
          <td>TRUE</td>
        </tr>
        <tr>
          <td>Charlie</td>
          <td>TRUE</td>
          <td></td>
          <td></td>
          <td>FALSE</td>
        </tr>
      </tbody>
    </table>
  </>
);
