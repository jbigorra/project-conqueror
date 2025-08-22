import { server } from "#shared/server/server.js";
import { treaty } from "@elysiajs/eden";
import { isHtml } from "@elysiajs/html";
import { beforeEach, describe, expect, it } from "vitest";

const client = treaty(server);

describe("UploadFilesController", () => {
  describe("GET /upload", () => {
    it("should return response with 200 status code", async () => {
      const { response } = await client.upload.get();

      expect(response.status).toBe(200);
    });

    it("should return response with text/html content-type", async () => {
      const { response } = await client.upload.get();

      expect(response.headers.get("content-type")).toBe(
        "text/html; charset=utf8",
      );
    });

    it("should return response with html body", async () => {
      const res = await client.upload.get();

      expect(isHtml(res.data)).toBe(true);
    });
  });

  describe("POST /upload", () => {
    let file: File;

    beforeEach(() => {
      file = new File(["Test content"], "test.log", { type: "text/plain" });
    });

    it("should return response successfully with 200 status code and html body", async () => {
      const res = await client.upload.post({
        file,
      });

      expect(res.status).toBe(200);
      expect(res.response.headers.get("content-type")).toBe(
        "text/html; charset=utf8",
      );
      expect(isHtml(res.data)).toBe(true);
    });

    it("should return response with confirmation message", async () => {
      const res = await client.upload.post({
        file,
      });

      expect(res.data).toContain("File uploaded successfully!");
    });

    it("should return response with 200 status code with error when request is invalid", async () => {
      const res = await client.upload.post({
        file: new File([""], "test.log", { type: "text/plain" }),
      });

      expect(res.status).toBe(200);
      expect(res.data).toContain(
        "A non empty plain/text file with .log extension is required.",
      );
    });
  });
});
