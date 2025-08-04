"use client";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";
import {usePathname} from "next/navigation";
import "./Navigation.scss";

const pages = [
    {title: "Home", path: "/"},
    {title: "Plaza", path: "/plaza"},
    // { title: "ClassAdder", path: "/classadder" },
    // { title: "SDKs", path: "/sdks" },
    // { title: "Inbound Relay", path: "/inbound-relay" },
    // { title: "Outbound Relay", path: "/outbound-relay" },
    // { title: "Functions", path: "/functions" },
    // { title: "Inputs", path: "/inputs" },
];

export default function Navigation() {
    const pathname = usePathname();

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

                    {pages.map(({title, path}) => (
                        <Link href={path} key={path} tabIndex={-1}>
                            <motion.button
                                className="navigationItem"
                                initial={false}
                                animate={{
                                    color: pathname === path ? "var(--grey-00)" : "var(--grey-90)",
                                }}
                            >
                                {pathname === path && (
                                    <motion.div
                                        className="indicator"
                                        layoutId="indicator"
                                        style={{borderRadius: 32}}
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
