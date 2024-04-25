"use client";
import Link from "next/link"

export default function Component() {
    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <div className="max-w-md px-4 sm:px-6 lg:px-8 text-center">

                <h1>poZKer - ZK Mental Poker with o1js, a Mina zkApp</h1>
                <p>poZKer is a decentralized no-limit Texas hold'em application, built with zero knowledge smart contracts (zkApps) for the Mina blockchain.</p>
                <p>poZKer was started at the zkhack.dev Istanbul hackathon in November 2023 with enderNakamoto.</p>
                <p>Work is continuing as part of the Mina Navigators Grants Program</p>
                <p>Leveraging the power of TypeScript and o1js, poZKer is permissionless and trustless. Game logic is entirely onchain, and mental poker is used for card shuffling to remove the need for a trusted source for dealing cards.</p>
                <p>poZKer is entirely open source and can be viewed <Link href="https://github.com/tredfern0/poZKer">here</Link></p>

            </div>
        </main >
    )
}

