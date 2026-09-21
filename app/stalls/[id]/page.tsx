export default async function StallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Stall: {id}</h1>
    </div>
  );
}
