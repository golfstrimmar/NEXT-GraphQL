"use client";
<<<<<<< HEAD
=======

>>>>>>> simple
import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import styles from "./Navbar.module.scss";
<<<<<<< HEAD
// import { useSelector, useDispatch } from "react-redux";
// import { clearUser } from "@/app/redux/slices/authSlice";

import { useRouter, useParams, usePathname } from "next/navigation";
import Image from "next/image";
interface User {
  _id?: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  // const dispatch = useDispatch();
  // const user = useSelector((state: any) => state.auth.user as User);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const [activeLink, setactiveLink] = useState<string>("");
  useEffect(() => {
    setactiveLink(pathname);
  }, [pathname]);

  // const handleLogout = () => {
  //   if (user) {
  //     localStorage.removeItem("user");
  //     localStorage.removeItem("token");
  //     dispatch(clearUser());
  //     router.replace("/");
  //     if (socket) {
  //       console.log(
  //         "<====Отправляем log_out на сервер, userID:====>",
  //         user._id
  //       );
  //       socket.emit("log_out", { userID: user._id });
  //     } else {
  //       console.warn("<====Сокет не инициализирован====>");
  //     }
  //   }
  // };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-700 p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold ">
          A
=======
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@apollo/client";
import useHasMounted from "@/hooks/useHasMounted";
import { LOGOUT_USER } from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";
import { User } from "@/types/user";
import Image from "next/image";

const Navbar: React.FC = () => {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useStateContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>("");
  const [logoutUser, { loading }] = useMutation(LOGOUT_USER);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname, isOpen]);

  const handleLogout = async () => {
    try {
      const { data } = await logoutUser();
      if (data?.logoutUser) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/chats");
      } else {
        console.log("Logout failed on server side.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      console.log("------Failed to log out. Please try again.-------");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Ждём, пока смонтируется компонент
  if (!hasMounted) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#30344c] blue-500 py-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="rounded-lg overflow-hidden">
          <Image
            src="/chat.jpg"
            alt="Logo"
            width={50}
            height={50}
            className=""
          />
>>>>>>> simple
        </Link>
        <Burger handlerburgerClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
        <ul className={`${styles["navbar-menu"]} ${isOpen ? styles.run : ""}`}>
          <li className="flex flex-col justify-center">
            <Link
              href="/"
<<<<<<< HEAD
              className={` hover:text-gray-300 transition-colors duration-200  ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
=======
              className={`hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white"
              }`}
              onClick={() => setIsOpen(false)}
>>>>>>> simple
            >
              Home
            </Link>
          </li>
          <li className="flex flex-col justify-center">
            <Link
<<<<<<< HEAD
              href="/register"
              className={` hover:text-gray-300 transition-colors duration-200  ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Register
=======
              href="/blog"
              className={`hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/blog" ? "text-[#0ae42e]" : "text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
>>>>>>> simple
            </Link>
          </li>
          <li className="flex flex-col justify-center">
            <Link
<<<<<<< HEAD
              href="/login"
              className={` hover:text-gray-300 transition-colors duration-200  ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Loigin
            </Link>
          </li>

          {/* {user ? (
            <>
              <li>
                {user && user.userName ? (
                  <div className="text-white hover:text-gray-300">
                    <Link
                      href="/profile"
                      className={` hover:text-gray-300 transition-colors duration-200 flex items-center ${
                        activeLink === "/profile" ? "text-blue" : "text-white "
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      {user?.avatar !== "" ? (
                        <img
                          className="w-8 h-8 rounded-full mr-2"
                          src={user.avatar}
                          alt="user"
                        />
                      ) : (
                        <Image
                          className="w-8 h-8 rounded-full mr-2"
                          src="/assets/svg/avatar.svg"
                          alt="user"
                          width={30}
                          height={30}
                        />
                      )}

                      <p>
                        Hallo, <strong>{user.userName} !</strong>
                      </p>
                    </Link>
                  </div>
                ) : (
                  ""
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/registerPage"
                  className={` hover:text-gray-300 transition-colors duration-200 ${
                    activeLink === "/registerPage"
                      ? "text-[#0ae42e]"
                      : "text-white "
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                  }}
=======
              href="/chats"
              className={`hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/chats" ? "text-[#0ae42e]" : "text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Chats
            </Link>
          </li>
          {!user ? (
            <>
              <li className="flex flex-col justify-center">
                <Link
                  href="/register"
                  className={`hover:text-gray-300 transition-colors duration-200 ${
                    activeLink === "/register" ? "text-[#0ae42e]" : "text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
>>>>>>> simple
                >
                  Register
                </Link>
              </li>
<<<<<<< HEAD
              <li>
                <Link
                  href="/loginPage"
                  className={` hover:text-gray-300 transition-colors duration-200 ${
                    activeLink === "/loginPage"
                      ? "text-[#0ae42e]"
                      : "text-white "
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                  }}
=======
              <li className="flex flex-col justify-center">
                <Link
                  href="/login"
                  className={`hover:text-gray-300 transition-colors duration-200 ${
                    activeLink === "/login" ? "text-[#0ae42e]" : "text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
>>>>>>> simple
                >
                  Login
                </Link>
              </li>
            </>
<<<<<<< HEAD
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition-colors duration-200 border border-white px-2  rounded-md cursor-pointer hover:border-gray-300 "
            >
              Logout
            </button>
          ) : (
            ""
          )} */}
=======
          ) : (
            <>
              <li className="flex items-center gap-2 text-white">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt="User"
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                ) : (
                  <Image
                    src="./svg/avatar.svg"
                    alt="User"
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                )}
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  Hello, <strong>{user.name || "User"}</strong>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-white hover:text-gray-300 transition-colors duration-200 border border-white px-2 py-1 rounded-md cursor-pointer hover:border-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </li>
            </>
          )}
>>>>>>> simple
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
