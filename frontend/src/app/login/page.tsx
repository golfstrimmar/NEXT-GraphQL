"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        userName
        email
        avatarUrl
        createdAt
        isOnline
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginUser] = useMutation(LOGIN_USER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Валидация полей
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.password) {
        throw new Error("Password is required");
      }

      const { data, errors } = await loginUser({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (!data?.loginUser) {
        throw new Error("No data received from server");
      }

      // Сохраняем данные аутентификации
      localStorage.setItem("token", data.loginUser.token);
      localStorage.setItem("user", JSON.stringify(data.loginUser.user));

      // Перенаправляем на главную
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message.includes("Invalid credentials") ||
          err.message.includes("400") ||
          err.message.includes("Bad Request")
          ? "Invalid email or password"
          : err.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 p-4">
      <Link
        href="/"
        className="hover:scale-102 transition-all duration-200 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Image
          src="/assets/svg/left-arrow.svg"
          alt="Back to home"
          width={20}
          height={20}
          className="inline"
        />
        Back to Home
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="your@email.com"
              disabled={isLoading}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5"
            variant="primary"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🌀</span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
