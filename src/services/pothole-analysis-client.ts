import { parsePotholeRecognition, type PotholeRecognition } from '@/domain/pothole-recognition';

export async function analyzePotholeImage(image: Blob, signal: AbortSignal): Promise<PotholeRecognition> {
  const data = new FormData();
  data.set('image', image, 'incident-photo');
  try {
    const response = await fetch('/api/ai/pothole', { method: 'POST', body: data, signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]) });
    if (!response.ok) throw new Error('AI unavailable');
    return parsePotholeRecognition(await response.json());
  } catch (error) {
    if (signal.aborted) throw error;
    return { status: 'unavailable', confidence: null, count: 0, message: 'Chưa thể nhận diện ảnh lúc này. Bạn vẫn có thể chọn loại sự cố và gửi phản ánh, hoặc thử nhận diện lại.' };
  }
}
