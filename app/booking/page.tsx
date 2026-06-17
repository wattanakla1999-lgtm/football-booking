import { prisma } from "@/src/lib/prisma";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BookingWizard from "./BookingWizard";

export const metadata: Metadata = {
  title: "จองสนาม — Football Booking",
  description: "เลือกสนามและเวลาเพื่อทำการจอง",
};

export default async function BookingPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: {
      id: true,
      displayName: true,
      pictureUrl: true,
      phone: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-[#f3f4f6]">
      <div className="w-full min-h-screen flex flex-col relative pb-6">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5 px-5 py-3 flex items-center gap-3">
          <a href="/dashboard" className="text-white/60 hover:text-white p-1 -ml-1 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </a>
          <h1 className="text-base font-bold tracking-tight">จองสนามฟุตบอล</h1>
        </header>

        {/* Wizard Client Component */}
        <BookingWizard user={user} />
      </div>

      {/* Slide-up animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
