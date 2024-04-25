import { Button } from "@/components/ui/button";
import protokit from "@/public/protokit-zinc.svg";
import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";

export interface HeaderProps {
  loading: boolean;
  wallet?: string;
  onConnectWallet: () => void;
  balance?: string;
  balanceLoading: boolean;
  blockHeight?: string;
}

export default function Header({
  loading,
  wallet,
  onConnectWallet,
  balance,
  balanceLoading,
  blockHeight,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b border-zinc-900 bg-[#313390] p-2 shadow-sm">
      <div className="container flex">
        <div className="flex basis-6/12 items-center justify-start gap-6 text-white">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/"
          >
            Home
          </Link>

          <Link
            className={`text-sm ${
              pathname === "/join" ? "font-bold" : ""
            } font-medium underline-offset-4 hover:underline`}
            href="/join"
          >
            Join
          </Link>

          <Link
            className={`text-sm ${
              pathname === "/playgame" ? "font-bold" : ""
            } font-medium underline-offset-4 hover:underline`}
            href="/playgame"
          >
            Play
          </Link>

          <Link
            className={`text-sm ${
              pathname === "/gettokens" ? "font-bold" : ""
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
        </div>

        <div className="flex basis-6/12 flex-row items-center justify-end">
          {/* balance */}
          {wallet && (
            <div className="mr-4 flex shrink flex-col items-end justify-center">
              <div>
                <p className="text-xs">Your balance</p>
              </div>
              <div className="w-32 pt-0.5 text-right">
                {balanceLoading && balance === undefined ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  <p className="text-xs font-bold">{balance} PZKR</p>
                )}
              </div>
            </div>
          )}
          {/* connect wallet */}
          <Button
            loading={loading}
            className="w-44 border border-gray-400 bg-transparent   "
            onClick={onConnectWallet}
          >
            <div>
              {wallet ? truncateMiddle(wallet, 7, 7, "...") : "Connect wallet"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
