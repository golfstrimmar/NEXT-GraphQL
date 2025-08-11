"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import "./Navigation.scss";
import { LOGOUT_USER } from "@/apolo/mutations";
import { useMutation } from "@apollo/client";
import { useStateContext } from "@/components/StateProvider";
const pages = [
  { title: "Home", path: "/" },
  { title: "Plaza", path: "/plaza" },
  { title: "Sandbox", path: "/sandbox" },
  { title: "Register", path: "/register" },
  { title: "Login", path: "/login" },
  // { title: "ClassAdder", path: "/classadder" },
  // { title: "SDKs", path: "/sdks" },
  // { title: "Inbound Relay", path: "/inbound-relay" },
  // { title: "Outbound Relay", path: "/outbound-relay" },
  // { title: "Functions", path: "/functions" },
  // { title: "Inputs", path: "/inputs" },
];

export default function Navigation() {
  const { user, setUser } = useStateContext();
  const pathname = usePathname();
  const router = useRouter();
  const [logoutUser, { loading }] = useMutation(LOGOUT_USER);
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
  return (
    <header className="header" id="header">
      <div className="container">
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
        <nav className="navigation">
          {pages.map(({ title, path }) => (
            <Link href={path} key={path} tabIndex={-1}>
              <motion.button
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
          ))}
        </nav>
      </div>
    </header>
  );
}
