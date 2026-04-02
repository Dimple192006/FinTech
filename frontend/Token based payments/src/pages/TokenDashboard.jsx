import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTokens } from "../lib/tokenApi";

const shortcutFactory = (tokenCount) => [
  {
    title: "Create Token",
    subtitle: "Generate a prepaid payment token",
    badge: "New",
    action: "/create"
  },
  {
    title: "Merchant Pay",
    subtitle: "Scan token QR, enter amount, and collect PIN",
    badge: "Live",
    action: "/merchant"
  },
  {
    title: "Token History",
    subtitle: "See only tokens that were actually created",
    badge: `${tokenCount} Tokens`,
    action: "/token/history"
  },
  {
    title: "Manage Tokens",
    subtitle: "Review active, used, and expired tokens",
    badge: "Control",
    action: "/token/manage"
  },
  {
    title: "Help & Support",
    subtitle: "Resolve token payment issues quickly",
    badge: "FAQs"
  }
];

export default function TokenDashboard() {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [wallet, setWallet] = useState({
    initialBalance: 1000,
    availableBalance: 1000,
    lockedAmount: 0
  });
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
          setWallet(data.wallet);
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
    const activeTokens = tokens.filter((token) => token.status === "active");
    const expiredTokens = tokens.filter((token) => token.status === "expired");
    const totalBalance = activeTokens.reduce(
      (sum, token) => sum + Number(token.remainingAmount || 0),
      0
    );
    const totalSpent = tokens.reduce(
      (sum, token) =>
        sum + (Number(token.totalAmount || 0) - Number(token.remainingAmount || 0)),
      0
    );

    return {
      totalBalance,
      activeCount: activeTokens.length,
      expiredCount: expiredTokens.length,
      totalSpent
    };
  }, [tokens]);

  const recentTokens = tokens.slice(0, 3);
  const shortcuts = shortcutFactory(tokens.length);

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="relative w-full max-w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="bg-[#00baf2] px-4 pt-4 pb-5 text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium"
            >
              Back
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold">Token</h1>
              <p className="text-[11px] opacity-90">Paytm Services</p>
            </div>
            <button type="button" className="text-sm font-medium">
              Help
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] opacity-90">Available Token Balance</p>
                <p className="mt-1 text-2xl font-bold">Rs. {summary.totalBalance}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#00baf2]">
                {summary.activeCount} Active
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Wallet Free</p>
                <p className="mt-1 text-sm font-semibold">Rs. {wallet.availableBalance}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Spent</p>
                <p className="mt-1 text-sm font-semibold">Rs. {summary.totalSpent}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Locked</p>
                <p className="mt-1 text-sm font-semibold">Rs. {wallet.lockedAmount}</p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/10 py-2">
                <p className="text-[10px] opacity-80">Created</p>
                <p className="mt-1 text-sm font-semibold">{tokens.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 py-2">
                <p className="text-[10px] opacity-80">Expired</p>
                <p className="mt-1 text-sm font-semibold">{summary.expiredCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-3 px-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#002970]">
                Token Services
              </h2>
              <span className="text-[11px] font-medium text-[#00baf2]">Live</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {shortcuts.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => item.action && navigate(item.action)}
                  className="rounded-2xl bg-[#f7fbff] p-4 text-left shadow-sm ring-1 ring-[#e8f4ff] transition hover:bg-[#eef8ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f7ff] text-xs font-bold text-[#00baf2]">
                      {item.title
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-500">
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {item.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 px-3 pb-24">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#002970]">
                Recent Token Summary
              </h2>
              <button
                type="button"
                onClick={() => navigate("/token/history")}
                className="text-[11px] font-semibold text-[#00baf2]"
              >
                View history
              </button>
            </div>

            {loading ? (
              <p className="mt-4 text-[12px] text-slate-500">Loading tokens...</p>
            ) : error ? (
              <p className="mt-4 text-[12px] text-rose-600">{error}</p>
            ) : recentTokens.length ? (
              <div className="mt-3 space-y-3">
                {recentTokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="flex items-center justify-between rounded-xl bg-[#f8fbff] px-3 py-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {token.tokenId}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Created {new Date(token.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        Rs. {token.totalAmount}
                      </p>
                      <p className="mt-1 text-[11px] capitalize text-[#00baf2]">
                        {token.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-[#f8fbff] px-3 py-4 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No tokens created yet
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Create your first token to see live data here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
