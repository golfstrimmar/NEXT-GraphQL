"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, gql } from "@apollo/client";
// import { useSelector, useDispatch } from "react-redux";
// import { addUser } from "@/app/redux/slices/authSlice";

import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [signup, { data, loading, error }] = useMutation(SIGNUP_MUTATION);
  const router = useRouter();
  // const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setSuccessMessage("Please fill in all fields.");
      // setOpenModalMessage(true);
      // setIsModalVisible(true);
      setTimeout(() => {
        // setOpenModalMessage(false);
        setSuccessMessage("");
        return;
      }, 2000);
      return;
    }
    try {
      console.log("<====name, email, password====>", name, email, password);
      const response = await signup({ variables: { name, email, password } });
      const { token, user } = response.data.signup;
      // dispatch(addUser({ user: JSON.stringify(user) }));
      setSuccessMessage("Registration successful!");
      // setOpenModalMessage(true);
      // setIsModalVisible(true);
      setTimeout(() => {
        // setOpenModalMessage(false);
        setSuccessMessage("");
        // router.push("/");
        return;
      }, 2000);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setSuccessMessage(err);
      // setOpenModalMessage(true);
      // setIsModalVisible(true);
      setTimeout(() => {
        // setOpenModalMessage(false);
        setSuccessMessage("");
        return;
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {successMessage && (
          <ModalMessage message={successMessage} open={openModalMessage} />
        )}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
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
