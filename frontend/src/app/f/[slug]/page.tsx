export default function PublicForm({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Public Form Placeholder</h1>
        <p>Viewing public form slug: {params.slug}</p>
      </div>
    </main>
  );
}
