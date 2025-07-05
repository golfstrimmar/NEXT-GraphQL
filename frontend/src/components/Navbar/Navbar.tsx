"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import styles from "./Navbar.module.scss";
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
        router.push("/");
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
          <li className="flex flex-col justify-center">
            <Link
              href="/blog"
              className={`hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/blog" ? "text-[#0ae42e]" : "text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
          </li>
          <li className="flex flex-col justify-center">
            <Link
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
            </>
          ) : (
            <>
              <li className="flex items-center gap-2 text-white">
                <p>
                  Hello, <strong>{user.name || "User"}</strong>
                </p>
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
