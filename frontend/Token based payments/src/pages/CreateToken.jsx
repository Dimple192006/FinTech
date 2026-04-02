import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createToken, fetchTokens } from "../lib/tokenApi";

const validityOptions = [
  { label: "1 day", value: "day" },
  { label: "1 week", value: "week" },
  { label: "1 month", value: "month" },
  { label: "1 year", value: "year" }
];

export default function CreateToken() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [validity, setValidity] = useState("day");
  const [tokenData, setTokenData] = useState(null);
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    lockedAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      try {
        const data = await fetchTokens();
        if (active) {
          setWallet(data.wallet);
        }
      } catch {
        if (active) {
          setWallet({
            availableBalance: 0,
            lockedAmount: 0
          });
        }
      }
    }

    loadWallet();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await createToken({
        user: "Demo User",
        amount,
        pin,
        validity
      });

      setTokenData(data.token);
      setWallet(data.wallet);
      setAmount("");
      setPin("");
      setValidity("day");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-[390px] rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/token")}
            className="text-sm font-medium text-[#002970]"
          >
            Back
          </button>
          <h1 className="text-xl font-bold">Create Token</h1>
          <div className="w-10" />
        </div>

        <div className="mb-4 rounded-lg bg-[#f5f9ff] p-3 text-center">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="mt-1 text-lg font-semibold text-[#002970]">
            Rs. {wallet.availableBalance}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Locked in tokens: Rs. {wallet.lockedAmount}
          </p>
        </div>

        <input
          type="number"
          placeholder="Enter Amount INR"
          className="mb-3 w-full rounded-lg border p-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="password"
          placeholder="Set Token PIN"
          className="mb-3 w-full rounded-lg border p-3"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <select
          className="mb-4 w-full rounded-lg border p-3"
          value={validity}
          onChange={(e) => setValidity(e.target.value)}
        >
          {validityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Validity: {option.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-white"
        >
          {loading ? "Creating..." : "Generate Token"}
        </button>

        {tokenData && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Token ID</p>
            <p className="break-all font-semibold">{tokenData.tokenId}</p>

            <p className="mt-3 text-sm text-gray-500">Available for payment</p>
            <p className="mt-1 text-green-600">INR {tokenData.remainingAmount} Ready</p>

            <p className="mt-3 text-xs text-slate-500">
              Valid till: {new Date(tokenData.expiresAt).toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Updated wallet balance: Rs. {wallet.availableBalance}
            </p>

            <button
              type="button"
              onClick={() => navigate("/token/history")}
              className="mt-4 rounded-lg border border-[#cfefff] px-4 py-2 text-sm font-semibold text-[#00baf2]"
            >
              View Token History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
