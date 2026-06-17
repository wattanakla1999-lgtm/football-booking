import { Metadata } from "next";
import AdminLayout from "./AdminLayout";

export const metadata: Metadata = {
  title: "ArenaManager | Elite Athletic Interface",
  description: "Stadium Admin Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}
