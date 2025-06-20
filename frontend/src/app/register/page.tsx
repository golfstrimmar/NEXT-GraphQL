"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import client, { wsLink } from "../../../lib/apolloClient";

const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  { ssr: false }
);

const CREATE_USER = gql`
  mutation ($email: String!, $name: String, $password: String!) {
    createUser(email: $email, name: $name, password: $password) {
      id
      email
      name
      createdAt
    }
  }
`;

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [createUser] = useMutation(CREATE_USER);
  const [loading, setloading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setloading(true);
    if (!name || !email || !password) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      await createUser({ variables: { email, name, password } });
      setEmail("");
      setName("");
      setPassword("");
      setloading(false);
      showModal("Registration successful!");

      client.resetStore();
      if (wsLink && wsLink.subscriptionClient) {
        wsLink.subscriptionClient.close(false, false);
      }

      router.push("/login");
    } catch (err) {
      console.error("Mutation error:", err);
      showModal(message);
      setloading(false);
    }
  };

  const showModal = (message: string) => {
    setSuccessMessage(message);
    setModalOpen(true);
    setloading(false);
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
