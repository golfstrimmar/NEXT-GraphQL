"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/redux/slices/authSlice";
import dynamic from "next/dynamic";
import { client } from "../../../lib/apolloClient";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { LOGIN_USER } from "@/apolo/mutations";
import { GOOGLE_LOGIN } from "@/apolo/mutations";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);
  const [googleLogin, { loading: googleLoading }] = useMutation(GOOGLE_LOGIN);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      showModal("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });
      if (!data || !data.loginUser) {
        showModal("Invalid login. User not found or incorrect password.");
        return;
      }

      const loggedInUser = data.loginUser;
      dispatch(setUser(loggedInUser));
      setEmail("");
      setPassword("");
      showModal("Login successful!");
      // resetApolloClient();
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error("Login error:", err);
      showModal("User not found. Please register.");
      setTimeout(() => router.push("/register"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      showModal("Google login failed. No credential provided.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await googleLogin({
        variables: { idToken: response.credential },
      });
      if (!data || !data.googleLogin) {
        showModal("Google login failed. Invalid response from server.");
        return;
      }

      const loggedInUser = data.googleLogin;
      dispatch(setUser(loggedInUser));

      showModal("Google login successful!");

      // resetApolloClient();
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error("Google login error:", err);
      showModal("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginFailure = () => {
    showModal("Google login failed. Please try again.");
  };

  // const resetApolloClient = () => {
  //   client.resetStore();
  //   if (wsLink && wsLink.subscriptionClient) {
  //     wsLink.subscriptionClient.close(false, false);
  //   }
  // };

  const showModal = (message: string) => {
    setSuccessMessage(message);
    setOpenModalMessage(true);
    setIsModalVisible(true);
    setTimeout(() => {
      setOpenModalMessage(false);
      setSuccessMessage("");
      return;
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

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

        <div className="mb-4">
          {googleLoading || isLoading ? (
            <span>Loading...</span>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          )}
        </div>
        <Button
          children={isLoading || loginLoading ? "Loading..." : "Log In"}
          buttonType="submit"
        />
      </form>
    </div>
  );
}
