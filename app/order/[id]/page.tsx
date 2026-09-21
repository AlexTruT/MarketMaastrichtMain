export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Order #{id}</h1>
    </div>
  );
}
