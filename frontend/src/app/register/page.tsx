"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import client, { wsLink } from "../../../lib/apolloClient";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);
import { ADD_USER } from "@/apolo/mutations";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [addUser] = useMutation(ADD_USER);
  const [loading, setloading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setloading(true);
    if (!name || !email || !password) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      await addUser({ variables: { email, name, password } });
      setEmail("");
      setName("");
      setPassword("");
      setloading(false);
      showModal("Registration successful!");

      client.resetStore();
      if (wsLink && wsLink.subscriptionClient) {
        wsLink.subscriptionClient.close(false, false);
      }
      setTimeout(() => {
        router.push("/");
      }, 2000);
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
    }, 2000);
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
    </div>
  );
}
