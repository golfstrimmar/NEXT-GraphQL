"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
// import { client } from "@/app/apolo/apolloClient";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useStateContext } from "@/providers/StateProvider";
// import { ADD_USER } from "@/apolo/mutations";
// import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showModal } = useStateContext();
  // const [addUser, { loading }] = useMutation(ADD_USER);
  // ===============================

  // useUserChatSubscriptions();
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    //   e.preventDefault();
    //   if (!name || !email || !password) {
    //     showModal("Please fill in all fields.");
    //     return;
    //   }
    //   try {
    //     const { data } = await addUser({ variables: { email, name, password } });
    //     console.log("<=====🟢 MUTATION REGISTER NEW USER  =====>", data);
    //     setEmail("");
    //     setName("");
    //     setPassword("");
    //     showModal("Registration successful!");
    //     // client.resetStore();
    //     setTimeout(() => {
    //       router.push("/");
    //     }, 2000);
    //   } catch (err) {
    //     console.error("Registration mutation error:", err);
    //     console.error("Full error object:", JSON.stringify(err, null, 2));
    //     showModal("Registration failed.");
    //   }
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
          // children={loading ? "Registering..." : "Register"}
          buttonType="submit"
        />
      </form>
    </div>
  );
}
