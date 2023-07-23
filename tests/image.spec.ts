import { test } from "@japa/runner";
import { cropAndSaveFromFourImagePreview } from "../src/backend/utils/image";

test.group("Image processing test", () => {
  test("crop and save file from cdn", async ({ expect }) => {
    expect(
      cropAndSaveFromFourImagePreview(
        "test",
        "" // TODO: add cdn url
      )
    ).resolves.not.toThrowError();
  });
});
