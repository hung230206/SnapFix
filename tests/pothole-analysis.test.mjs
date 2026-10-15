import './helpers/typescript-loader.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
const { parsePotholeRecognition, classificationFor, POTHOLE_CATEGORY } = await import('../src/domain/pothole-recognition.ts');
const { analyzePotholeImage } = await import('../src/services/pothole-analysis-client.ts');
const { prepareSubmission } = await import('../src/domain/citizen-mvp.ts');

test('selects potholes only, distinguishes weak matches and rejects invalid confidence', () => {
  const recognized = parsePotholeRecognition({ detections: [{ class: 'Pothole', confidence: .85 }, { class: 'car', confidence: .99 }, { class: 'Pothole', confidence: 5 }] });
  assert.equal(recognized.status, 'detected');
  assert.equal(recognized.confidence, .85);
  assert.equal(recognized.count, 1);
  assert.equal(parsePotholeRecognition({ detections: [{ class: 'pothole', confidence: .2 }] }).status, 'uncertain');
  assert.equal(parsePotholeRecognition({ detections: [] }).status, 'not_detected');
  assert.throws(() => parsePotholeRecognition({ error: 'bad response' }));
  assert.deepEqual(classificationFor('Rác thải', recognized), { confidence: null, classificationSource: 'manual' });
});

test('submission retains recognition while only attributing confidence to accepted AI category', () => {
  const recognition = parsePotholeRecognition({ detections: [{ class: 'Pothole', confidence: .85 }] });
  const draft = { id: 'a', category: POTHOLE_CATEGORY, recognition, location: { text: 'Đường A' } };
  const report = prepareSubmission(draft, []);
  assert.equal(report.submission.confidence, .85);
  assert.equal(report.submission.classificationSource, 'ai_confirmed');
  const corrected = prepareSubmission({ ...draft, category: 'Ngập nước' }, []);
  assert.equal(corrected.submission.confidence, null);
  assert.equal(corrected.recognition.confidence, .85);
});

test('client sends image to same-origin API; errors fall back, cancellation propagates', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/ai/pothole');
      assert.equal(init.body.get('image').size, 5);
      return Response.json({ detections: [{ class: 'Pothole', confidence: .9 }] });
    };
    assert.equal((await analyzePotholeImage(new Blob(['image']), new AbortController().signal)).status, 'detected');
    globalThis.fetch = async () => new Response('', { status: 500 });
    assert.equal((await analyzePotholeImage(new Blob(['image']), new AbortController().signal)).status, 'unavailable');
    globalThis.fetch = async () => { throw new TypeError('offline'); };
    assert.equal((await analyzePotholeImage(new Blob(['image']), new AbortController().signal)).status, 'unavailable');
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(() => analyzePotholeImage(new Blob(['image']), controller.signal));
  } finally { globalThis.fetch = originalFetch; }
});
