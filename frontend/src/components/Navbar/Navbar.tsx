"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import styles from "./Navbar.module.scss";
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
        </Link>
        <Burger handlerburgerClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
        <ul className={`${styles["navbar-menu"]} ${isOpen ? styles.run : ""}`}>
          <li className="flex flex-col justify-center">
            <Link
              href="/"
              className={` hover:text-gray-300 transition-colors duration-200  ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Home
            </Link>
          </li>
          <li className="flex flex-col justify-center">
            <Link
              href="/register"
              className={` hover:text-gray-300 transition-colors duration-200  ${
                activeLink === "/" ? "text-[#0ae42e]" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Register
            </Link>
          </li>
          {/* <li className="flex flex-col justify-center">
            <Link
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
          </li> */}

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
                >
                  Register
                </Link>
              </li>
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
                >
                  Login
                </Link>
              </li>
            </>
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
