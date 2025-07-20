import { CsvError } from "csv-parse";
import { beforeEach, describe, expect, it } from "vitest";
import { CSVParser } from "../../../src/dependencies/csv_parser/csv_parser";

describe("CSVParser", () => {
  let csv_parser: CSVParser;

  beforeEach(() => {
    csv_parser = new CSVParser();
  });

  describe("parse", () => {
    it("should successfully parse valid CSV with headers", async () => {
      const csv_data = `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { name: "John", age: "30", city: "New York" },
        { name: "Jane", age: "25", city: "Los Angeles" },
        { name: "Bob", age: "35", city: "Chicago" },
      ]);
    });

    it("should successfully parse CSV with single row", async () => {
      const csv_data = `name,age,city
John,30,New York`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { name: "John", age: "30", city: "New York" },
      ]);
    });

    it("should successfully parse CSV with empty values", async () => {
      const csv_data = `name,age,city
John,,New York
Jane,25,
Bob,35,Chicago`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { name: "John", age: "", city: "New York" },
        { name: "Jane", age: "25", city: "" },
        { name: "Bob", age: "35", city: "Chicago" },
      ]);
    });

    it("should successfully parse CSV with quoted values", async () => {
      const csv_data = `name,age,city
"John Doe",30,"New York, NY"
Jane,25,"Los Angeles, CA"`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { name: "John Doe", age: "30", city: "New York, NY" },
        { name: "Jane", age: "25", city: "Los Angeles, CA" },
      ]);
    });

    it("should successfully parse CSV with special characters", async () => {
      const csv_data = `name,description,value
Test,"Contains quotes and apostrophes",100
Another,"Line 1\nLine 2",200`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        {
          name: "Test",
          description: "Contains quotes and apostrophes",
          value: "100",
        },
        { name: "Another", description: "Line 1\nLine 2", value: "200" },
      ]);
    });

    it("should successfully parse empty CSV string as empty array", async () => {
      const result = await csv_parser.parse("");

      expect(result.getValue()).toEqual([]);
    });

    it("should successfully parse CSV with only headers as empty array", async () => {
      const csv_with_only_headers = `name,age,city`;

      const result = await csv_parser.parse(csv_with_only_headers);

      expect(result.getValue()).toEqual([]);
    });

    it("should successfully parse CSV with numeric values as strings", async () => {
      const csv_data = `id,name,score,active
1,John,95.5,true
2,Jane,87.0,false
3,Bob,100,true`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { id: "1", name: "John", score: "95.5", active: "true" },
        { id: "2", name: "Jane", score: "87.0", active: "false" },
        { id: "3", name: "Bob", score: "100", active: "true" },
      ]);
    });

    it("should successfully parse CSV with trailing whitespace", async () => {
      const csv_data = `name , age , city
John , 30 , New York
Jane , 25 , Los Angeles  `;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { "name ": "John ", " age ": " 30 ", " city": " New York" },
        { "name ": "Jane ", " age ": " 25 ", " city": " Los Angeles  " },
      ]);
    });

    it("should only work with comma delimiter and treat semicolons as part of the field names", async () => {
      const csv_data = `name;age;city
John;30;New York
Jane;25;Los Angeles`;

      const result = await csv_parser.parse(csv_data);

      expect(result.getValue()).toEqual([
        { "name;age;city": "John;30;New York" },
        { "name;age;city": "Jane;25;Los Angeles" },
      ]);
    });

    it("should return an CsvError if the CSV is malformed", async () => {
      const csv_data = `name,age,city
John,30,"New York
Jane,25,Los Angeles`;

      const result = await csv_parser.parse(csv_data);

      expect(result.isError()).toBe(true);
      expect(result.getError()).toBeInstanceOf(CsvError);
    });
  });
});
