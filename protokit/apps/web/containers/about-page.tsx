"use client";
import Link from "next/link";

export default function Component() {
  return (
    <main className="min-h-[calc(100dvh-56px)] bg-[#111] text-white">
      <div className="mx-auto max-w-[800px] px-4 pt-20 sm:px-6 lg:px-8">
        <h1 className="pb-3 text-center text-4xl font-bold">
          Zero Knowledge Mental Poker
        </h1>
        <h2 className="pb-10 text-center text-2xl font-semibold text-indigo-400">
          Powered by o1js, a Mina zkApp
        </h2>
        <div className="space-y-4">
          <p>
            <span className="font-semibold">poZKer</span> is a decentralized
            no-limit Texas hold'em application, built with zero knowledge smart
            contracts (zkApps) for the Mina blockchain.
          </p>
          <p>
            poZKer was started at the zkhack.dev Istanbul hackathon in November
            2023 with
            <Link
              href="https://github.com/enderNakamoto"
              className="font-semibold underline underline-offset-2"
            >
              enderNakamoto.
            </Link>
          </p>
          <p>
            Work is continuing as part of the Mina Navigators Grants Program
          </p>
          <p>
            Leveraging the power of TypeScript and o1js, poZKer is
            permissionless and trustless. Game logic is entirely onchain, and
            mental poker is used for card shuffling to remove the need for a
            trusted source for dealing cards.
          </p>
          <p>
            poZKer is entirely open source and can be viewed{" "}
            <Link
              href="https://github.com/tredfern0/poZKer"
              className="font-semibold underline underline-offset-2"
            >
              here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
