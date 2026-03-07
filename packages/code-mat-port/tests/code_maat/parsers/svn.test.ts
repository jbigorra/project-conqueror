import { describe, test, expect } from "bun:test";
import { parseXml, asRows, parseLog, parseReadLog } from "../../../src/code_maat/parsers/svn";

const svnLog = `<?xml version='1.0'?>
<log>
 <logentry
   revision='2'>
  <author>APT</author>
  <date>2013-02-08T11:46:13.844538Z</date>
  <paths>
    <path
      kind='file'
      action='M'>/Infrastrucure/Network/Connection.cs
    </path>
   <path
     kind='file'
     action='M'>/Presentation/Status/ClientPresenter.cs
   </path>
  </paths>
  <msg>[bug] Fixed the connection status </msg>
 </logentry>
 <logentry
   revision='1'>
  <author>XYZ</author>
  <date>2013-02-07T11:46:13.844538Z</date>
  <paths>
    <path
      kind='file'
      action='A'>/Infrastrucure/Network/Connection.cs
    </path>
  </paths>
  <msg>[feature] Report connection status</msg>
 </logentry>
</log>`;

describe("svn parser", () => {
  const logEntries = parseXml(svnLog);
  const firstEntry = logEntries[0];
  const secondEntry = logEntries[1];

  test("retrieves all entries from the given log", () => {
    expect(logEntries.length).toBe(2);
  });

  test("one modified entity per row", () => {
    const [row1, row2] = asRows(firstEntry);
    expect(row1).toEqual({
      entity: "/Infrastrucure/Network/Connection.cs",
      date: "2013-02-08",
      author: "APT",
      action: "M",
      rev: "2",
    });
    expect(row2).toEqual({
      entity: "/Presentation/Status/ClientPresenter.cs",
      date: "2013-02-08",
      author: "APT",
      action: "M",
      rev: "2",
    });
  });

  test("created entities are marked", () => {
    const [row] = asRows(secondEntry);
    expect(row).toEqual({
      entity: "/Infrastrucure/Network/Connection.cs",
      date: "2013-02-07",
      author: "XYZ",
      action: "A",
      rev: "1",
    });
  });

  test("builds complete modification history from log", () => {
    const modifications = parseLog(svnLog);
    expect(modifications.length).toBe(3);
    expect(modifications.map(m => m.author)).toEqual(["APT", "APT", "XYZ"]);
    expect(modifications.map(m => m.entity)).toEqual([
      "/Infrastrucure/Network/Connection.cs",
      "/Presentation/Status/ClientPresenter.cs",
      "/Infrastrucure/Network/Connection.cs",
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("")).toEqual([]);
  });
});
