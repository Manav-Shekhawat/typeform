export default function FormBuilder({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Form Builder Placeholder</h1>
      <p>Editing form ID: {params.id}</p>
    </main>
  );
}
