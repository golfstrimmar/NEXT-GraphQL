"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useStateContext } from "@/providers/StateProvider";
import { CREATE_USER } from "@/apollo/mutations";
import { GET_USERS } from "@/apollo/queries";
export default function Register() {
  const router = useRouter();
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createUser, { loading }] = useMutation(CREATE_USER);

  // --------------------------
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setModalMessage("Please fill in all fields.");
      return;
    }

    try {
      await createUser({
        variables: { email, name, password },
        refetchQueries: [{ query: GET_USERS }],
      });
      setName("");
      setEmail("");
      setPassword("");
      setModalMessage("🟢 Registration successful!");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("already exists")) {
        setModalMessage("❌ User with this email already exists.");
      } else {
        setModalMessage("⚠️ Registration failed. Try again later.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <div className="flex flex-col gap-4 mb-4">
          <Input
            typeInput="text"
            data="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            typeInput="email"
            data="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            typeInput="password"
            data="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button buttonType="submit">
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
