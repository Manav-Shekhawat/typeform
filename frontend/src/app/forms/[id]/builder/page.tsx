import React from 'react';
import { BuilderClient } from '@/components/builder/BuilderClient';

export default async function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <BuilderClient id={resolvedParams.id} />;
}
