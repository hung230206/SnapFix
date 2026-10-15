import { classificationFor, type PotholeRecognition } from '@/domain/pothole-recognition';

export function RecognitionSummary({ recognition, category }: { recognition?: PotholeRecognition; category: string }) {
  if (!recognition) return <p className="text-sm text-gray-600">Loại sự cố do người dân chọn · Chưa có kết quả AI.</p>;
  const classification = classificationFor(category, recognition);
  return <div className="rounded-xl bg-emerald-50 p-3 text-sm space-y-1" aria-live="polite">
    <p className="font-semibold">{recognition.status === 'detected' ? 'AI gợi ý: Ổ gà' : recognition.status === 'uncertain' ? 'AI chưa đủ chắc chắn' : recognition.status === 'not_detected' ? 'Chưa phát hiện ổ gà' : 'AI tạm thời chưa khả dụng'}</p>
    {recognition.confidence !== null && <p>Confidence nhận diện ổ gà: {(recognition.confidence * 100).toFixed(1)}%</p>}
    <p>{recognition.message}</p>
    {classification.classificationSource === 'manual' && recognition.confidence !== null && <p>Loại đang chọn: {category}. Confidence trên chỉ thuộc kết quả nhận diện ổ gà, không phải loại bạn chọn thủ công.</p>}
  </div>;
}
