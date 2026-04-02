import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTokens } from "../lib/tokenApi";

const filters = [
  { id: "all", label: "All" },
  { id: "token", label: "Tokens" },
  { id: "payment", label: "Payments" },
  { id: "expired", label: "Expired" }
];

function formatCurrency(value) {
  return `Rs. ${value}`;
}

function getStatusColor(status) {
  if (status === "active") return "text-emerald-600";
  if (status === "expired") return "text-rose-500";
  if (status === "redeemed") return "text-slate-700";
  return "text-amber-500";
}

export default function TokenHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
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

  const historyItems = useMemo(() => {
    const tokenItems = tokens.map((token) => ({
      id: `token-${token.tokenId}`,
      kind: "token",
      title: `Token ${token.tokenId}`,
      subtitle: `Created ${new Date(token.createdAt).toLocaleString()}`,
      amount: formatCurrency(token.totalAmount),
      status: token.status,
      meta: `Remaining ${formatCurrency(token.remainingAmount)}`,
      timestamp: token.createdAt
    }));

    const paymentItems = tokens.flatMap((token) =>
      token.transactions.map((transaction, index) => ({
        id: `payment-${token.tokenId}-${index}`,
        kind: transaction.merchantId === "demo" ? "payment" : "payment",
        title: transaction.merchantId,
        subtitle: `Used from ${token.tokenId}`,
        amount: `-${formatCurrency(transaction.amount)}`,
        status: token.status === "expired" ? "expired" : "payment",
        meta: new Date(transaction.timestamp).toLocaleString(),
        timestamp: transaction.timestamp
      }))
    );

    return [...paymentItems, ...tokenItems].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [tokens]);

  const visibleItems = useMemo(() => {
    if (activeFilter === "all") {
      return historyItems;
    }

    if (activeFilter === "expired") {
      return historyItems.filter((item) => item.status === "expired");
    }

    return historyItems.filter((item) => item.kind === activeFilter);
  }, [activeFilter, historyItems]);

  const stats = useMemo(
    () => ({
      tokenCount: tokens.length,
      paymentCount: tokens.reduce(
        (sum, token) => sum + token.transactions.length,
        0
      ),
      expiredCount: tokens.filter((token) => token.status === "expired").length
    }),
    [tokens]
  );

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
              <h1 className="text-lg font-semibold">Token</h1>
              <p className="text-[11px] opacity-90">History</p>
            </div>
            <button type="button" className="text-sm font-medium">
              Help
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] opacity-90">Sample + Live History</p>
                <p className="mt-1 text-2xl font-bold">{visibleItems.length} Entries</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#00baf2]">
                Seeded Ready
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Tokens</p>
                <p className="mt-1 text-sm font-semibold">{stats.tokenCount}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Payments</p>
                <p className="mt-1 text-sm font-semibold">{stats.paymentCount}</p>
              </div>
              <div className="rounded-xl bg-white/15 py-2">
                <p className="text-[10px] opacity-80">Expired</p>
                <p className="mt-1 text-sm font-semibold">{stats.expiredCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-3 px-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#002970]">
                Token history
              </h2>
              <span className="text-[11px] font-medium text-[#00baf2]">
                Sample + live
              </span>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-[11px]">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 ${
                    activeFilter === filter.id
                      ? "bg-[#e6f8ff] font-medium text-[#00a9e0]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 px-3 pb-24">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Loading token history...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-rose-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f7ff] text-sm font-bold text-[#00baf2]">
                        {item.kind === "payment" ? "PM" : "TK"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {item.subtitle}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {item.meta}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.amount}
                      </p>
                      <p
                        className={`mt-1 text-[11px] font-medium ${
                          item.kind === "payment"
                            ? "text-amber-500"
                            : getStatusColor(item.status)
                        }`}
                      >
                        {item.kind === "payment"
                          ? "history entry"
                          : item.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {!visibleItems.length ? (
                <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700">
                    No history records in this filter
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Sample tokens and new live tokens will appear here.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
