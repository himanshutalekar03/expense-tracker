import Shell from "@/components/layout/Shell";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <Shell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Track and manage your expenses effortlessly.</p>
        </div>
        <Dashboard />
      </div>
    </Shell>
  );
}
