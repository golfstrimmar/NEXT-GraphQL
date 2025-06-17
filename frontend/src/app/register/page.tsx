"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";

const CREATE_USER = gql`
  mutation CreateUser(
    $userName: String!
    $email: String!
    $password: String
    $avatarUrl: String
  ) {
    createUser(
      userName: $userName
      email: $email
      password: $password
      avatarUrl: $avatarUrl
    ) {
      id
      userName
      email
    }
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    avatarUrl: "",
  });
  const [error, setError] = useState("");

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      // Сохраняем пользователя и редиректим
      // localStorage.setItem("currentUser", JSON.stringify(data.createUser));
      router.push("/");
    },
    onError: (err) => {
      setError(
        err.message.includes("Unique constraint")
          ? "User with this email or username already exists"
          : "Registration failed. Please try again."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.userName || !formData.email) {
      setError("Username and email are required");
      return;
    }

    await createUser({
      variables: {
        userName: formData.userName,
        email: formData.email,
        password: formData.password || null,
        avatarUrl: formData.avatarUrl || null,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col gap-2 items-center justify-center bg-gray-50">
      <Link
        href="/"
        className="text-blue-400 hover:text-blue-800 transition-colors duration-300"
      >
        Home
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            typeInput="text"
            name="userName"
            data="Username"
            value={formData.userName}
            onChange={handleChange}
            required
          />

          <Input
            typeInput="email"
            name="email"
            data="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            typeInput="password"
            name="password"
            data="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <Input
            typeInput="text"
            name="avatarUrl"
            data="Avatar URL (optional)"
            value={formData.avatarUrl}
            onChange={handleChange}
          />

          <Button
            buttonText={loading ? "Creating account..." : "Register"}
            buttonType="submit"
            disabled={loading}
            className="w-full"
          />
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
