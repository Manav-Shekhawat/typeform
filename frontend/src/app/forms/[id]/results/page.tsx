export default function FormResults({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Form Results Placeholder</h1>
      <p>Viewing results for form ID: {params.id}</p>
    </main>
  );
}
