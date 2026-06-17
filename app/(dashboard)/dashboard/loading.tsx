export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl shimmer" />
          <div className="h-4 w-56 rounded-lg shimmer" />
        </div>
        <div className="h-10 w-40 rounded-xl shimmer" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
      </div>
      <div className="h-12 rounded-xl shimmer mb-6" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-xl shimmer" />)}
      </div>
    </div>
  );
}
