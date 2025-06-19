"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import dynamic from "next/dynamic";

const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  { ssr: false }
);

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Только для формы, не передаётся на сервер
  const [modalMessage, setModalMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showModal("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await signup({
        variables: { name, email, password },
      });

      if (data?.createUser) {
        showModal("Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("GraphQL Error:", err);
      const message =
        err?.graphQLErrors?.[0]?.message || "Something went wrong!";
      showModal(message);
    }
  };

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
    setTimeout(() => {
      setModalOpen(false);
      setModalMessage("");
    }, 2500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {modalOpen && <ModalMessage message={modalMessage} open={modalOpen} />}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

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
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
