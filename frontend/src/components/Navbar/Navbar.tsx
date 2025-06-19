"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import styles from "./Navbar.module.scss";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { gql, useMutation } from "@apollo/client";

const LOGOUT_USER = gql`
  mutation LogoutUser($userId: ID!) {
    logoutUser(userId: $userId)
  }
`;

interface User {
  id: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Invalid user in localStorage");
      }
    }
  }, []);

  const handleLogout = async () => {
    if (user) {
      try {
        await logoutUser({ variables: { userId: user.id } });
        // localStorage.removeItem("user");
        // localStorage.removeItem("token");
        // setUser(null);
        // router.replace("/");
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-700 p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          A
        </Link>
        <Burger handlerburgerClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
        <ul className={`${styles["navbar-menu"]} ${isOpen ? styles.run : ""}`}>
          <li className="flex flex-col justify-center">
            <Link
              href="/"
              className={`hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          {/* {!user && ( */}
          <>
            <li className="flex flex-col justify-center">
              <Link
                href="/register"
                className={`hover:text-gray-300 transition-colors duration-200 ${
                  activeLink === "/register" ? "text-[#0ae42e]" : "text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </li>
            <li className="flex flex-col justify-center">
              <Link
                href="/login"
                className={`hover:text-gray-300 transition-colors duration-200 ${
                  activeLink === "/login" ? "text-[#0ae42e]" : "text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition-colors duration-200 border border-white px-2 py-1 rounded-md cursor-pointer hover:border-gray-300"
              >
                Logout
              </button>
            </li>
          </>
          {/* )} */}
          {/* {user && (
            <>
              <li className="flex items-center gap-2 text-white">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  {user.avatar ? (
                    <img
                      className="w-8 h-8 rounded-full"
                      src={user.avatar}
                      alt="user"
                    />
                  ) : (
                    <Image
                      className="w-8 h-8 rounded-full"
                      src="/assets/svg/avatar.svg"
                      alt="user"
                      width={30}
                      height={30}
                    />
                  )}
                </Link>
                <p>
                  Hello, <strong>{user.userName}</strong>
                </p>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-300 transition-colors duration-200 border border-white px-2 py-1 rounded-md cursor-pointer hover:border-gray-300"
                >
                  Logout
                </button>
              </li>
            </>
          )} */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
