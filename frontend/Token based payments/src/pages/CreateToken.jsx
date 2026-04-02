import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createToken, fetchTokens } from "../lib/tokenApi";

const validityOptions = [
  { label: "1 Day", value: "1d" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "365 Days", value: "365d" }
];

const defaultWallet = {
  initialBalance: 1000,
  availableBalance: 1000,
  lockedAmount: 0
};

export default function CreateToken() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [validity, setValidity] = useState("1d");
  const [wallet, setWallet] = useState(defaultWallet);
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      try {
        const data = await fetchTokens();
        if (active) {
          setWallet(data.wallet);
          setTokenCount(data.tokens.length);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoadingWallet(false);
        }
      }
    }

    loadWallet();

    return () => {
      active = false;
    };
  }, []);

  const parsedAmount = Number(amount) || 0;
  const remainingAfterCreate = useMemo(
    () => Math.max(wallet.availableBalance - parsedAmount, 0),
    [parsedAmount, wallet.availableBalance]
  );

  async function handleCreate() {
    try {
      setLoading(true);
      setError("");

      const data = await createToken({
        amount: parsedAmount,
        pin,
        validity
      });

      navigate("/success", {
        state: {
          token: data.token,
          wallet: data.wallet
        }
      });
    } catch (err) {
      navigate("/failure", {
        state: { message: err.message || "Server error" }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="bg-[#00baf2] p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Create Token</h1>
              <p className="text-xs opacity-80">Secure prepaid payments</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/token")}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold"
            >
              Back
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] opacity-90">Wallet available now</p>
                <p className="mt-1 text-2xl font-bold">Rs. {wallet.availableBalance}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#00baf2]">
                {tokenCount} Tokens
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Wallet</p>
                <p className="mt-1 text-sm font-semibold">Rs. {wallet.initialBalance}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Locked</p>
                <p className="mt-1 text-sm font-semibold">Rs. {wallet.lockedAmount}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">After create</p>
                <p className="mt-1 text-sm font-semibold">Rs. {remainingAfterCreate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="mb-1 text-sm text-gray-500">Amount</p>
            <input
              type="number"
              min="1"
              placeholder="Rs. Enter amount"
              className="mb-4 w-full rounded-lg border p-3 outline-none"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <p className="mb-1 text-sm text-gray-500">Set PIN</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              className="mb-4 w-full rounded-lg border p-3 outline-none"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />

            <p className="mb-2 text-sm text-gray-500">Select Validity</p>
            <div className="grid grid-cols-2 gap-2">
              {validityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValidity(option.value)}
                  className={`rounded-lg border p-3 text-sm transition ${
                    validity === option.value ? "bg-[#00baf2] text-white" : "bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4 shadow">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Seeded token history</span>
              <span className="font-semibold text-[#002970]">{tokenCount} total tokens</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Demo tokens and payment history are already loaded, and every new token
              updates this same wallet balance across the app.
            </p>
            {loadingWallet ? (
              <p className="mt-3 text-xs text-slate-400">Loading wallet summary...</p>
            ) : error ? (
              <p className="mt-3 text-xs text-rose-600">{error}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-[#002970] py-3 text-white shadow"
          >
            {loading ? "Processing..." : "Generate Token"}
          </button>
        </div>
      </div>
    </div>
  );
}
