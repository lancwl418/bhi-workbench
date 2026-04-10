import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-full">
      <aside className="w-60 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-base font-semibold text-gray-900">CS Workbench</h1>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <Link
            href="/cases"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Cases
          </Link>
          <div className="pl-9 space-y-0.5">
            <Link
              href="/cases?status=new"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              New
            </Link>
            <Link
              href="/cases?status=in_progress"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              In Progress
            </Link>
            <Link
              href="/cases?status=awaiting_customer"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Awaiting Customer
            </Link>
            <Link
              href="/cases?status=resolved"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Resolved
            </Link>
          </div>

          <div className="h-px bg-gray-200 my-3" />

          <Link
            href="/returns"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Returns
          </Link>
          <div className="pl-9 space-y-0.5">
            <Link
              href="/returns?status=initiated"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Initiated
            </Link>
            <Link
              href="/returns?status=received"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Received
            </Link>
            <Link
              href="/returns?status=inspected"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Inspected
            </Link>
            <Link
              href="/returns?status=completed"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Completed
            </Link>
          </div>

          <div className="h-px bg-gray-200 my-3" />

          <Link
            href="/error-codes"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Error Codes
          </Link>
        </nav>
        <div className="px-5 py-3 border-t border-gray-200 text-xs text-gray-400 truncate">
          {user.email}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50/40">{children}</main>
    </div>
  );
}
