import assert from "node:assert/strict";
import test from "node:test";
import { prepareImageFile, imageDisplayError, MAX_IMAGE_BYTES } from "../src/lib/utils/image-file.ts";

for (const type of ["", "application/octet-stream", "image/jpeg"]) {
  test(`accepts a 1.6 MB JPEG with MIME ${type || '(missing)'}`, async () => {
    const bytes = new Uint8Array(Math.floor(1.6 * 1024 * 1024));
    bytes.set([0xff, 0xd8, 0xff]);
    const file = new File([bytes], "photo", { type, lastModified: 123456 });
    const result = await prepareImageFile(file);
    assert.equal(result.type, "image/jpeg");
    assert.equal(result.size, file.size);
    assert.equal(result.lastModified, file.lastModified);
    assert.deepEqual(await result.arrayBuffer(), await file.arrayBuffer());
  });
}

test("accepts exactly 20 MB, rejects larger photos with size-specific error", async () => {
  const file = new File([new Uint8Array(MAX_IMAGE_BYTES)], "photo.jpg", { type: "image/jpeg" });
  assert.equal(await prepareImageFile(file), file);
  await assert.rejects(prepareImageFile(new File([file, "x"], "large.jpg")), /dung lượng.*20 MB/);
});

test("does not misreport non-images or empty files as too large", async () => {
  await assert.rejects(prepareImageFile(new File(["not a photo"], "fake.jpg")), /định dạng ảnh/);
  await assert.rejects(prepareImageFile(new File([], "empty.jpg")), /trống/);
});

test("recognizes HEIC without MIME and explains unsupported rendering separately", async () => {
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode("ftypheic"), 4);
  const file = await prepareImageFile(new File([bytes], "phone-photo"));
  assert.equal(file.type, "image/heic");
  assert.match(imageDisplayError(file.type), /HEIC\/HEIF.*không phải lỗi dung lượng/);
});
