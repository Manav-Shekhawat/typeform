import { ResultsClient } from '@/components/results/ResultsClient';

export default async function FormResults({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ResultsClient formId={resolvedParams.id} />;
}
