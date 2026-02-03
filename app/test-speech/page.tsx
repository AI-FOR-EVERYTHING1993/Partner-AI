// app/test-speech/page.tsx
import SimpleSpeechTest from '@/components/SimpleSpeechTest';

export default function TestSpeechPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SimpleSpeechTest />
      </div>
    </div>
  );
}