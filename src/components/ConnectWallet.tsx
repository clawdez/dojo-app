"use client";

import { ConnectKitButton } from "connectkit";

export default function ConnectWallet() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress }) => (
        <button
          onClick={show}
          className="px-4 py-2 rounded-lg text-xs font-mono transition-colors"
          style={{
            background: isConnected ? "rgba(196,255,60,0.1)" : "var(--accent)",
            color: isConnected ? "var(--accent)" : "black",
            border: isConnected ? "1px solid rgba(196,255,60,0.3)" : "none",
          }}
        >
          {isConnected ? truncatedAddress : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
