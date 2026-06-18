"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "../services/adminAuthService";

export function useAdminLogin() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await loginAdmin({
        email: email.trim(),
        password,
      });

      router.push("/admin/dashboard");
      router.refresh();
    } catch (requestError) {
      setLoading(false);

      console.error(
        "Admin login error:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "ไม่สามารถเข้าสู่ระบบได้",
      );
    }
  };

  return {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
