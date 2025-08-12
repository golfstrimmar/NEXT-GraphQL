"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import "./Navigation.scss";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import useHasMounted from "@/hooks/useHasMounted";
// import { LOGOUT_USER } from "@/apolo/mutations";
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
  // const [logoutUser, { loading }] = useMutation(LOGOUT_USER);
  const pages = [
    { title: "Home", path: "/" },
    { title: "Plaza", path: "/plaza" },
    { title: "Sandbox", path: "/sandbox" },
    // { title: "Register", path: "/register" },
    // { title: "Login", path: "/login" },
    // { title: "ClassAdder", path: "/classadder" },
    // { title: "SDKs", path: "/sdks" },
    // { title: "Inbound Relay", path: "/inbound-relay" },
    // { title: "Outbound Relay", path: "/outbound-relay" },
    // { title: "Functions", path: "/functions" },
    // { title: "Inputs", path: "/inputs" },
  ];
  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname, isOpen]);

  // const handleLogout = async () => {
  //   try {
  //     const { data } = await logoutUser();
  //     if (data?.logoutUser) {
  //       setUser(null);
  //       localStorage.removeItem("token");
  //       localStorage.removeItem("user");
  //       router.push("/chats");
  //     } else {
  //       console.log("Logout failed on server side.");
  //     }
  //   } catch (err) {
  //     console.error("Logout error:", err);
  //     console.log("------Failed to log out. Please try again.-------");
  //   }
  // };

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
      <div className="container">
        <div className="relative flex items-center ">
          <Link href="/">
            <div className="logoContainer">
              <Image
                src="/logo.png"
                width={140}
                height={25}
                alt="Purple Evervault logo"
              />
            </div>
          </Link>
          <Burger
            handlerburgerClick={() => setIsOpen(!isOpen)}
            isOpen={isOpen}
          />
          <ul className={`navigation ${isOpen ? styles.run : ""}`}>
            {pages.map(({ title, path }) => (
              <li key={path}>
                <Link href={path} tabIndex={-1}>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="navigationItem"
                    initial={false}
                    animate={{
                      color:
                        pathname === path ? "var(--grey-00)" : "var(--grey-90)",
                    }}
                  >
                    {pathname === path && (
                      <motion.div
                        className="indicator"
                        layoutId="indicator"
                        style={{ borderRadius: 32 }}
                      />
                    )}
                    {title}
                  </motion.button>
                </Link>
              </li>
            ))}

            {!user ? (
              <>
                <li>
                  <Link href="/register" tabIndex={-1}>
                    <motion.button
                      className="navigationItem"
                      initial={false}
                      onClick={() => setIsOpen(false)}
                      // animate={{
                      //   color:
                      //     pathname === path ? "var(--grey-00)" : "var(--grey-90)",
                      // }}
                    >
                      {/* {pathname === path && (
                      <motion.div
                        className="indicator"
                        layoutId="indicator"
                        style={{ borderRadius: 32 }}
                      />
                    )} */}
                      Register
                    </motion.button>
                  </Link>
                </li>
                <li>
                  <Link href="/login" tabIndex={-1}>
                    <motion.button
                      className="navigationItem"
                      initial={false}
                      onClick={() => setIsOpen(false)}
                      // animate={{
                      //   color:
                      //     pathname === path ? "var(--grey-00)" : "var(--grey-90)",
                      // }}
                    >
                      {/* {pathname === path && (
                      <motion.div
                        className="indicator"
                        layoutId="indicator"
                        style={{ borderRadius: 32 }}
                      />
                    )} */}
                      Login
                    </motion.button>
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* //   <li className="flex items-center gap-2 text-white">
            //     {user.picture ? (
            //       <Image
            //         src={user.picture}
            //         alt="User"
            //         width={25}
            //         height={25}
            //         className="rounded-full"
            //       />
            //     ) : (
            //       <Image
            //         src="./svg/avatar.svg"
            //         alt="User"
            //         width={25}
            //         height={25}
            //         className="rounded-full"
            //       />
            //     )}
            //     <Link href="/profile" onClick={() => setIsOpen(false)}>
            //       Hello, <strong>{user.name || "User"}</strong>
            //     </Link>
            //   </li>
            //   <li>
            //     <button
            //       onClick={handleLogout}
            //       disabled={loading}
            //       className="text-white hover:text-gray-300 transition-colors duration-200 border border-white px-2 py-1 rounded-md cursor-pointer hover:border-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            //     >
            //       {loading ? "Logging out..." : "Logout"}
            //     </button>
            //   </li> */}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
