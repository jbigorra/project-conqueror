import { server } from "#shared/server/server.ts";
import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "vitest";

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

      expect(res.data).toMatchSnapshot();
    });
  });
});
