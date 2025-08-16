"use client";

import { useState, useEffect } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useStateContext } from "@/providers/StateProvider";
import { CREATE_USER } from "@/apollo/mutations";
import { USER_CREATED } from "@/apollo/subscriptions";
import { GET_USERS } from "@/apollo/queries";
export default function Register() {
  const router = useRouter();
  const { setModalMessage } = useStateContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [createUser, { loading }] = useMutation(CREATE_USER);
  const { data: subscriptionData } = useSubscription(USER_CREATED);

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
    } catch {
      setModalMessage("Registration failed.");
    }
  };
  useEffect(() => {
    if (subscriptionData) {
      console.log("<====✔️subscriptionData====>", subscriptionData);
    }
    if (subscriptionData?.userCreated) {
      setModalMessage(
        `✔️New user created: ${subscriptionData.userCreated.name}`
      );
    }
  }, [subscriptionData, setModalMessage]);
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
