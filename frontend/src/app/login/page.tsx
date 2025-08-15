"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
// import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { LOGIN_USER } from "@/apollo/mutations";

import { GET_USERS } from "@/apollo/queries";
import { useStateContext } from "@/providers/StateProvider";

export default function Login() {
  const router = useRouter();
  const client = useApolloClient();
  const { setModalMessage, setUser } = useStateContext();
  //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);
  // const [googleLogin, { loading: googleLoading }] = useMutation(GOOGLE_LOGIN);

  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  // const [setPasswordMutation] = useMutation(SET_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      return setModalMessage("Please fill in all fields.");
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });
      const loggedInUser = data?.loginUser;

      if (!loggedInUser) {
        setIsLoading(false);
        return setModalMessage("⚠️Invalid login");
      }
      console.log("<=====🟢 MUTATION LOGIN USER  =====>", loggedInUser);
      // -------- localStorage
      const { token, ...userWithoutToken } = loggedInUser;
      const newUser = { ...userWithoutToken };
      localStorage.setItem("token", token);
      console.log("<=== 📤 User :", newUser);
      setUser(newUser.user);
      localStorage.setItem("user", JSON.stringify(newUser));
      // --------

      // Обновляем статус пользователя в кэше Apollo
      updateUserStatusInCache(client, loggedInUser.id, true);

      setModalMessage("🟢Login successful!");

      setTimeout(() => {
        setEmail("");
        setPassword("");
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage = err?.message;

      if (errorMessage === "GoogleOnlyAccount") {
        setModalMessage(
          "Account registered via Google. Please set a password first."
        );
        setTimeout(() => setShowSetPasswordModal(true), 2000);
        return;
      }

      if (errorMessage === "Invalid password") {
        setModalMessage("⚠️Incorrect password.");
        return;
      }

      setModalMessage("⚠️User not found. Redirecting...");
      setTimeout(() => router.push("/register"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
  //   if (!response.credential) return showModal("No credential from Google");

  //   setIsLoading(true);

  //   try {
  //     const { data } = await googleLogin({
  //       variables: { idToken: response.credential },
  //     });

  //     const loggedInUser = data?.googleLogin;

  //     if (!loggedInUser) {
  //       setIsLoading(false);
  //       return showModal("Google login failed");
  //     }
  //     // -------- localStorage
  //     const { token, ...userWithoutToken } = loggedInUser;
  //     const newUser = { ...userWithoutToken };
  //     setUser(newUser);
  //     console.log("<====GOOGLE LOGIN token====>", token);
  //     console.log("<====GOOGLE LOGIN userWithoutToken====>", userWithoutToken);
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(newUser));

  //     // --------

  //     console.log("<=== GOOGLE LOGIN ===>", loggedInUser);

  //     // Обновляем кэш Apollo — добавляем или обновляем пользователя с isLoggedIn: true
  //     client.cache.updateQuery({ query: GET_USERS }, (prev: any) => {
  //       const exists = prev?.users?.some((u: any) => u.id === loggedInUser.id);
  //       const updatedUser = { ...loggedInUser, isLoggedIn: true };
  //       return {
  //         users: exists
  //           ? prev.users.map((u: any) =>
  //               u.id === loggedInUser.id ? updatedUser : u
  //             )
  //           : [...(prev?.users || []), updatedUser],
  //       };
  //     });

  //     showModal("Google login successful!");
  //     setTimeout(() => router.push("/chats"), 2000);
  //   } catch (err) {
  //     console.error("Google login error:", err);
  //     showModal("Google login failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleGoogleLoginFailure = () => {
  //   showModal("Google login failed.");
  // };

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
    </div>
  );
}

//  <div className="my-4">
//    {googleLoading || isLoading ? (
//      <span>Loading...</span>
//    ) : (
//      <GoogleLogin
//        onSuccess={handleGoogleLoginSuccess}
//        onError={handleGoogleLoginFailure}
//        text="signin_with"
//        shape="rectangular"
//        logo_alignment="left"
//      />
//    )}
//  </div>;
