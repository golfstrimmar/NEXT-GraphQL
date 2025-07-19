"use client";
<<<<<<< HEAD
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        userName
        email
        avatarUrl
        createdAt
        isOnline
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginUser] = useMutation(LOGIN_USER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Валидация полей
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.password) {
        throw new Error("Password is required");
      }

      const { data, errors } = await loginUser({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (!data?.loginUser) {
        throw new Error("No data received from server");
      }

      // Сохраняем данные аутентификации
      localStorage.setItem("token", data.loginUser.token);
      localStorage.setItem("user", JSON.stringify(data.loginUser.user));

      // Перенаправляем на главную
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message.includes("Invalid credentials") ||
          err.message.includes("400") ||
          err.message.includes("Bad Request")
          ? "Invalid email or password"
          : err.message || "Login failed. Please try again."
      );
=======

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { LOGIN_USER, GOOGLE_LOGIN, SET_PASSWORD } from "@/apolo/mutations";

import { GET_USERS } from "@/apolo/queryes";
import { useStateContext } from "@/components/StateProvider";

export default function Login() {
  const router = useRouter();
  const client = useApolloClient();
  const { showModal, setUser } = useStateContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);
  const [googleLogin, { loading: googleLoading }] = useMutation(GOOGLE_LOGIN);

  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [setPasswordMutation] = useMutation(SET_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      return showModal("Please fill in all fields.");
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });
      const loggedInUser = data?.loginUser;

      if (!loggedInUser) {
        setIsLoading(false);
        return showModal("Invalid login");
      }
      console.log("<=====🟢 MUTATION LOGIN USER  =====>", loggedInUser);
      // -------- localStorage
      const { token, ...userWithoutToken } = loggedInUser;
      const newUser = { ...userWithoutToken };
      setUser(newUser);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));

      // --------
      console.log("<=== 📤 User :", userWithoutToken);
      setUser(userWithoutToken);

      // Обновляем статус пользователя в кэше Apollo
      updateUserStatusInCache(client, loggedInUser.id, true);

      showModal("Login successful!");

      setTimeout(() => {
        setEmail("");
        setPassword("");
        router.push("/chats");
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage = err?.message;

      if (errorMessage === "GoogleOnlyAccount") {
        showModal(
          "Account registered via Google. Please set a password first."
        );
        setTimeout(() => setShowSetPasswordModal(true), 2000);
        return;
      }

      if (errorMessage === "Invalid password") {
        showModal("Incorrect password.");
        return;
      }

      showModal("User not found. Redirecting...");
      setTimeout(() => router.push("/register"), 2000);
>>>>>>> simple
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 p-4">
      <Link
        href="/"
        className="hover:scale-102 transition-all duration-200 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Image
          src="/assets/svg/left-arrow.svg"
          alt="Back to home"
          width={20}
          height={20}
          className="inline"
        />
        Back to Home
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="your@email.com"
              disabled={isLoading}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5"
            variant="primary"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🌀</span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
=======
  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return showModal("No credential from Google");

    setIsLoading(true);

    try {
      const { data } = await googleLogin({
        variables: { idToken: response.credential },
      });

      const loggedInUser = data?.googleLogin;

      if (!loggedInUser) {
        setIsLoading(false);
        return showModal("Google login failed");
      }
      // -------- localStorage
      const { token, ...userWithoutToken } = loggedInUser;
      const newUser = { ...userWithoutToken };
      setUser(newUser);
      console.log("<====GOOGLE LOGIN token====>", token);
      console.log("<====GOOGLE LOGIN userWithoutToken====>", userWithoutToken);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));

      // --------

      console.log("<=== GOOGLE LOGIN ===>", loggedInUser);

      // Обновляем кэш Apollo — добавляем или обновляем пользователя с isLoggedIn: true
      client.cache.updateQuery({ query: GET_USERS }, (prev: any) => {
        const exists = prev?.users?.some((u: any) => u.id === loggedInUser.id);
        const updatedUser = { ...loggedInUser, isLoggedIn: true };
        return {
          users: exists
            ? prev.users.map((u: any) =>
                u.id === loggedInUser.id ? updatedUser : u
              )
            : [...(prev?.users || []), updatedUser],
        };
      });

      showModal("Google login successful!");
      setTimeout(() => router.push("/chats"), 2000);
    } catch (err) {
      console.error("Google login error:", err);
      showModal("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginFailure = () => {
    showModal("Google login failed.");
  };

  //------- Обновляет статус пользователя в Apollo cache
  function updateUserStatusInCache(
    client: any,
    userId: number,
    isLoggedIn: boolean
  ) {
    client.cache.updateQuery({ query: GET_USERS }, (prev: any) => {
      if (!prev?.users) return prev;

      return {
        users: prev.users.map((u: any) =>
          u.id === userId ? { ...u, isLoggedIn } : u
        ),
      };
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-3"
      >
        <h2 className="text-2xl font-bold mb-4 text-center ">Login</h2>

        <Input
          typeInput="email"
          data="E-mail"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          typeInput="password"
          data="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="my-4">
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
      {showSetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-center">
              Set a Password
            </h3>
            <p className="text-sm mb-2">
              For email: <strong>{email}</strong>
            </p>

            <Input
              typeInput="password"
              data="New Password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="flex gap-2 mt-4">
              <Button
                buttonType="button"
                children="Cancel"
                onClick={() => setShowSetPasswordModal(false)}
              />
              <Button
                buttonType="button"
                children="Submit"
                onClick={async () => {
                  if (!newPassword) return showModal("Password required");

                  try {
                    await setPasswordMutation({
                      variables: { email, newPassword },
                    });
                    showModal("Password set successfully!");

                    setShowSetPasswordModal(false);
                    setTimeout(
                      () => handleSubmit(new Event("submit") as any),
                      1000
                    ); // автологин
                  } catch (err: any) {
                    console.error("Set password error:", err);
                    showModal(err.message || "Error setting password");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
>>>>>>> simple
    </div>
  );
}
