"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/redux/slices/authSlice";
import dynamic from "next/dynamic";
import client, { wsLink } from "../../../lib/apolloClient";
const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  { ssr: false }
);

const LOGIN_USER = gql`
  mutation ($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      id
      email
      name
      token
      isLoggedIn
      createdAt
    }
  }
`;

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loginUser] = useMutation(LOGIN_USER);
  const [loading, setloading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setloading(true);
    if (!email || !password) {
      setloading(false);
      showModal("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });

      if (!data || !data.loginUser) {
        showModal("Invalid login. User not found or incorrect password.");
        setloading(false);
        return;
      }

      const loggedInUser = data.loginUser;
      dispatch(setUser(loggedInUser));

      setEmail("");
      setPassword("");
      showModal("Login successful!");

      client.resetStore();

      if (wsLink && wsLink.subscriptionClient) {
        wsLink.subscriptionClient.close(false, false);
      }

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Mutation error:", err);
      setloading(false);
      showModal(
        "User not found. For registration, please go to the registration page."
      );
      setTimeout(() => {
        router.push("/register");
      }, 2000);
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
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
