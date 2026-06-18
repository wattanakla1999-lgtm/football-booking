"use client";

import { FormError } from "./components/FormError";
import { FormField } from "./components/FormField";
import { SubmitButton } from "./components/SubmitButton";
import { useAdminLogin } from "./hooks/useAdminLogin";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

export default function AdminLoginForm() {
  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
  } = useAdminLogin();

  return (
    <>
      <AdminRouteLoadingOverlay open={loading} />

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <FormError message={error} />

        <FormField
          id="email"
          label="อีเมล"
          type="email"
          value={email}
          placeholder="admin@example.com"
          autoComplete="email"
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />

        <FormField
          id="password"
          label="รหัสผ่าน"
          type="password"
          value={password}
          placeholder="••••••••"
          autoComplete="current-password"
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />

        <SubmitButton loading={loading} />
      </form>
    </>
  );
}
