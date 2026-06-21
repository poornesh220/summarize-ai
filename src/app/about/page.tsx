export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-20">
      <h1 className="text-4xl font-bold mb-6">About SummarizeAI</h1>
      <p className="text-gray-400 leading-relaxed mb-4">
        SummarizeAI is a modern tool designed to help you digest information faster. 
        Whether it's a long PDF, a voice recording from a meeting, or a copied article, 
        our AI extracts the core value in seconds.
      </p>
      <ul className="list-disc list-inside text-gray-400 space-y-2">
        <li>PDF Analysis using text-extraction</li>
        <li>Voice Transcription via OpenAI Whisper</li>
        <li>Summarization via GPT-4</li>
      </ul>
    </div>
  );
}