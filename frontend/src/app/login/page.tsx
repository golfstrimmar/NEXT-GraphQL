"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";

const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  { ssr: false }
);

const LOGIN_USER = gql`
  mutation ($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loginUser] = useMutation(LOGIN_USER);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      await loginUser({ variables: { email, password } });
      setEmail("");
      setPassword("");
      setLoading(false);

      showModal("Login successful!");
      router.push("/");
    } catch (err) {
      console.error("Mutation error:", err);
      showModal("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const showModal = (message: string) => {
    setSuccessMessage(message);
    setModalOpen(true);
    setLoading(false);
    setTimeout(() => {
      setModalOpen(false);
      setSuccessMessage("");
    }, 2500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {modalOpen && <ModalMessage message={successMessage} open={modalOpen} />}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
