import './helpers/typescript-loader.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('officer workflow mutations and new read models share the same repository', async () => {
  const shared = await import('../src/lib/repositories/officer-repositories.ts');
  const legacy = await import('../src/lib/repositories/officer-demo-repositories.ts');
  assert.equal(shared.officerIncidentRepository, legacy.officerIncidentRepository);
  assert.equal(shared.officerIncidentEventRepository, legacy.officerIncidentEventRepository);
  const { officerIncidentReviewService: review } = await import('../src/services/officer-incident-review-service.ts');
  const { officerIncidentAssignmentService: assignment } = await import('../src/services/officer-incident-assignment-service.ts');
  const { officerIncidentProcessingService: processing } = await import('../src/services/officer-incident-processing-service.ts');
  const { officerIncidentResolutionService: resolution } = await import('../src/services/officer-incident-resolution-service.ts');
  const { officerIncidentCompletionService: completion } = await import('../src/services/officer-incident-completion-service.ts');
  const { officerReportListService: list } = await import('../src/services/officer-report-list-service.ts');
  const id = 'merge-integration-test';
  const seed = (await shared.officerIncidentRepository.findAll())[0];
  await shared.officerIncidentRepository.save({ ...seed, id, status: 'NEW' });
  await assert.rejects(() => processing.startProcessing({ incidentId: id }));
  await assert.rejects(() => review.reviewIncident({ incidentId: id, decision: 'REJECT', rejectionReason: ' ' }));
  await review.reviewIncident({ incidentId: id, decision: 'ACCEPT' });
  await assignment.assignIncident({ incidentId: id, teamId: 'd1', officerId: 'u2', deadline: '2099-01-01', note: 'Kiểm tra sau merge' });
  await processing.startProcessing({ incidentId: id });
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ1kAAAAASUVORK5CYII=';
  await resolution.submitResolution({ incidentId: id, resultText: 'Đã xử lý', image: { fileName: 'test.png', mimeType: 'image/png', width: 1, height: 1, sizeBytes: Buffer.from(png, 'base64').length, dataUrl: `data:image/png;base64,${png}` } });
  await completion.confirmCompletion({ incidentId: id });
  assert.equal((await list.getReportList()).reports.find(row => row.id === id).status.code, 'CLOSED');
  const { officerIncidentDetailService: detail } = await import('../src/services/officer-incident-detail-service.ts');
  const { officerDashboardService: dashboard } = await import('../src/services/officer-dashboard-service.ts');
  assert.ok((await detail.getIncidentDetail(id)).completion);
  assert.ok((await dashboard.getDashboardSnapshot()).metrics.find(metric => metric.key === 'completed').value >= 1);
  await assert.rejects(() => completion.confirmCompletion({ incidentId: id }));
  const events = await shared.officerIncidentEventRepository.findByIncidentId(id);
  assert.equal(events.filter(event => event.type === 'CLOSED').length, 1);
});

test('pothole API validates uploads and handles mocked upstream success/failure without real AI calls', async () => {
  const { POST } = await import('../src/app/api/ai/pothole/route.ts');
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.ROBOFLOW_API_KEY;
  const request = () => {
    const data = new FormData();
    data.set('image', new File(['test-image'], 'test.jpg', { type: 'image/jpeg' }));
    return new Request('http://localhost/api/ai/pothole', { method: 'POST', body: data });
  };
  try {
    assert.equal((await POST(new Request('http://localhost', { method: 'POST', body: '{}' }))).status, 415);
    delete process.env.ROBOFLOW_API_KEY;
    assert.equal((await POST(request())).status, 500);
    process.env.ROBOFLOW_API_KEY = 'test-key-not-a-real-secret';
    const detection = { class: 'Pothole', confidence: 0.9, x: 10, y: 20, width: 5, height: 6 };
    globalThis.fetch = async () => Response.json({ outputs: [{ predictions: [detection, detection] }] });
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { detection_count: 1, detections: [detection] });
    globalThis.fetch = async () => new Response('error', { status: 503 });
    assert.equal((await POST(request())).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ROBOFLOW_API_KEY;
    else process.env.ROBOFLOW_API_KEY = originalKey;
  }
});
