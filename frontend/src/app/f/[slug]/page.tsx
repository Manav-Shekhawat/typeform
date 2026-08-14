import { PublicClient } from '@/components/public/PublicClient';

export default async function PublicForm({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <PublicClient slug={resolvedParams.slug} />;
}
