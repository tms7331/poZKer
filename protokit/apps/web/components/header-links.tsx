import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderLinks() {
  const pathname = usePathname();

  return (
    <>
      <Link
        className="text-sm font-medium underline-offset-4 hover:underline"
        href="/"
      >
        Home
      </Link>
      <Link
        className={`text-sm ${
          pathname === "/join" ? "underline" : ""
        } font-medium underline-offset-4 hover:underline`}
        href="/join"
      >
        Join
      </Link>

      <Link
        className={`text-sm ${
          pathname === "/playgame" ? "underline" : ""
        } font-medium underline-offset-4 hover:underline`}
        href="/playgame"
      >
        Play
      </Link>

      <Link
        className={`text-sm ${
          pathname === "/gettokens" ? "underline" : ""
        } font-medium underline-offset-4 hover:underline`}
        href="/gettokens"
      >
        Get Tokens
      </Link>

      <Link
        className={`text-sm font-medium ${
          pathname === "/about" ? "underline" : ""
        } underline-offset-4 hover:underline`}
        href="/about"
      >
        About
      </Link>
    </>
  );
}
