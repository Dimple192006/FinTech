import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTokens } from "../lib/tokenApi";

function QuickAction({ label, icon, onClick, sublabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f7ff] text-xs font-bold text-[#00baf2]">
        {icon}
      </div>
      <p className="text-[11px] text-slate-700">{label}</p>
      {sublabel ? <p className="text-[9px] text-slate-400">{sublabel}</p> : null}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [tokenCount, setTokenCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [wallet, setWallet] = useState({
    initialBalance: 1000,
    availableBalance: 1000,
    lockedAmount: 0
  });

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      try {
        const data = await fetchTokens();
        if (active) {
          setWallet(data.wallet);
          setTokenCount(data.tokens.length);
          setHistoryCount(
            data.tokens.reduce(
              (sum, token) => sum + 1 + token.transactions.length,
              0
            )
          );
        }
      } catch {
        if (active) {
          setWallet({
            initialBalance: 1000,
            availableBalance: 1000,
            lockedAmount: 0
          });
          setTokenCount(0);
          setHistoryCount(0);
        }
      }
    }

    loadWallet();
    const intervalId = setInterval(loadWallet, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="relative w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="bg-[#00baf2] px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-slate-900">
                SS
              </div>
              <div>
                <p className="text-sm font-bold leading-none">paytm</p>
                <p className="text-[10px] opacity-90">UPI</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                Search
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                Chat
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
            <div>
              <p className="text-sm font-semibold leading-tight">
                Wallet loaded for token demo
              </p>
              <button className="mt-2 rounded bg-[#00baf2] px-3 py-1 text-xs text-white">
                Pay using Wallet
              </button>
            </div>
            <div className="text-center font-bold text-[#00baf2]">
              <p className="text-xs">Wallet total</p>
              <p className="text-xl">Rs. {wallet.initialBalance}</p>
              <p className="text-[10px]">demo balance</p>
            </div>
          </div>
        </div>

        <div className="px-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">UPI Money Transfer</h2>

            <div className="grid grid-cols-5 gap-3 text-center text-[11px]">
              <QuickAction label="Scan & Pay" icon="SP" />
              <QuickAction
                label="Merchant"
                icon="MC"
                onClick={() => navigate("/merchant")}
              />
              <QuickAction label="To Mobile" icon="MB" />
              <QuickAction
                label="Token"
                icon="TK"
                onClick={() => navigate("/token")}
              />
              <QuickAction label="To Bank" icon="BNK" />
            </div>

            <div className="mt-4 flex justify-between text-[10px]">
              <span className="rounded bg-gray-100 px-2 py-1">
                Balance & History
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                To Self Account
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                Receive Money
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 px-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">My Paytm</h2>
              <span className="text-[10px] font-semibold text-yellow-600">
                Locked Rs. {wallet.lockedAmount}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-[11px]">
              <QuickAction
                label="Wallet"
                icon="WL"
                sublabel={`Rs. ${wallet.initialBalance}`}
              />
              <QuickAction
                label="Available"
                icon="AV"
                sublabel={`Rs. ${wallet.availableBalance}`}
              />
              <QuickAction
                label="Samples"
                icon="SM"
                sublabel={`${tokenCount} tokens`}
              />
              <QuickAction
                label="History"
                icon="HS"
                sublabel={`${historyCount} entries`}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 px-3 pb-20">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="mb-3 flex justify-between">
              <h2 className="text-sm font-semibold">Recharge & Bill Payments</h2>
              <span className="text-[10px] text-blue-500">My Bills</span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-[11px]">
              <QuickAction label="Mobile" icon="MO" />
              <QuickAction label="Electricity" icon="EL" />
              <QuickAction label="Water" icon="WT" />
              <QuickAction label="DTH" icon="DTH" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button className="rounded-full bg-[#002970] px-6 py-3 text-sm font-semibold text-white shadow-lg">
            Scan Any QR
          </button>
        </div>
      </div>
    </div>
  );
}
