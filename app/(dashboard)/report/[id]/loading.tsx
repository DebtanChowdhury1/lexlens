export default function ReportLoading() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="h-8 w-36 rounded-xl shimmer" />
      <div className="h-44 rounded-xl shimmer" />
      <div className="h-24 rounded-xl shimmer" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
      </div>
    </div>
  );
}
