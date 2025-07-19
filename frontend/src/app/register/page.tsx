"use client";
<<<<<<< HEAD
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";

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
      router.push("/login");
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
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50">
      <Link
        href="/"
        className=" hover:scale-102 transition-all duration-200 flex items-center gap-2"
      >
        <Image
          src="/assets/svg/left-arrow.svg"
          alt="arrow"
          width={20}
          height={10}
        />
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
=======

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { client } from "../../apolo/apolloClient";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useStateContext } from "@/components/StateProvider";
import { ADD_USER } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showModal } = useStateContext();
  const [addUser, { loading }] = useMutation(ADD_USER);
  // ===============================

  useUserChatSubscriptions();
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      const { data } = await addUser({ variables: { email, name, password } });
      console.log("<=====🟢 MUTATION REGISTER NEW USER  =====>", data);
      setEmail("");
      setName("");
      setPassword("");
      showModal("Registration successful!");
      // client.resetStore();
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Mutation error:", err);
      showModal("Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <div className="mb-4">
          <Input
            typeInput="text"
            data="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Input
            typeInput="email"
            data="E-mail"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Input
            typeInput="password"
            data="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          children={loading ? "Registering..." : "Register"}
          buttonType="submit"
        />
      </form>
>>>>>>> simple
    </div>
  );
}
