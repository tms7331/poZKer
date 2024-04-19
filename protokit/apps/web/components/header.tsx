import { Button } from "@/components/ui/button";
import protokit from "@/public/protokit-zinc.svg";
import Image from "next/image";
import Link from "next/link"
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";

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
  return (
    <div className="flex items-center justify-between border-b p-2 shadow-sm">
      <div className="container flex">

        <div className="flex basis-6/12 items-center justify-start">
          <Image className="h-8 w-8" src={protokit} alt={"Protokit logo"} />
          <Separator className="mx-4 h-8" orientation={"vertical"} />
          <div className="flex grow">
            <Chain height={blockHeight} />
          </div>

          <Link className="text-sm font-medium hover:underline underline-offset-4" href="join">
            Join
          </Link>

          <Link className="text-sm font-medium hover:underline underline-offset-4" href="playgame">
            Play
          </Link>

          <Link className="text-sm font-medium hover:underline underline-offset-4" href="gettokens">
            Get Tokens
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
                  <p className="text-xs font-bold">{balance} MINA</p>
                )}
              </div>
            </div>
          )}
          {/* connect wallet */}
          <Button loading={loading} className="w-44" onClick={onConnectWallet}>
            <div>
              {wallet ? truncateMiddle(wallet, 7, 7, "...") : "Connect wallet"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
