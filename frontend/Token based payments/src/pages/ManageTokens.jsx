import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTokens } from "../lib/tokenApi";

function getStatusClasses(status) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "expired") {
    return "bg-rose-50 text-rose-500";
  }

  if (status === "redeemed") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-amber-50 text-amber-600";
}

export default function ManageTokens() {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTokens() {
      try {
        setError("");
        const data = await fetchTokens();
        if (active) {
          setTokens(data.tokens);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTokens();
    const intervalId = setInterval(loadTokens, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const summary = useMemo(() => {
    const activeCount = tokens.filter((token) => token.status === "active").length;
    const usedCount = tokens.filter(
      (token) => token.status === "partially_used" || token.status === "redeemed"
    ).length;
    const expiredCount = tokens.filter((token) => token.status === "expired").length;

    return {
      activeCount,
      usedCount,
      expiredCount
    };
  }, [tokens]);

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="relative w-full max-w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="bg-[#00baf2] px-4 pt-4 pb-5 text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/token")}
              className="text-sm font-medium"
            >
              Back
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold">Manage Tokens</h1>
              <p className="text-[11px] opacity-90">Paytm Token Controls</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="text-sm font-medium"
            >
              New
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] opacity-90">Total managed tokens</p>
                <p className="mt-1 text-2xl font-bold">{tokens.length}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#00baf2]">
                Live Sync
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Active</p>
                <p className="mt-1 text-sm font-semibold">{summary.activeCount}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Used</p>
                <p className="mt-1 text-sm font-semibold">{summary.usedCount}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Expired</p>
                <p className="mt-1 text-sm font-semibold">{summary.expiredCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 px-3 pb-24">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#002970]">All Tokens</h2>
              <button
                type="button"
                onClick={() => navigate("/token/history")}
                className="text-[11px] font-semibold text-[#00baf2]"
              >
                Open history
              </button>
            </div>

            {loading ? (
              <p className="mt-4 text-[12px] text-slate-500">Loading tokens...</p>
            ) : error ? (
              <p className="mt-4 text-[12px] text-rose-600">{error}</p>
            ) : tokens.length ? (
              <div className="mt-4 space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {token.tokenId}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${getStatusClasses(
                              token.status
                            )}`}
                          >
                            {token.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Created {new Date(token.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/token/history")}
                        className="shrink-0 text-[11px] font-semibold text-[#00baf2]"
                      >
                        Details
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] text-slate-400">Amount</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">
                          Rs. {token.totalAmount}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] text-slate-400">Remaining</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">
                          Rs. {token.remainingAmount}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] text-slate-400">Transactions</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">
                          {token.transactions.length}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] text-slate-400">Expiry</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">
                          {new Date(token.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-[#f8fbff] px-3 py-4 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No tokens available to manage
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Create a token and it will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
