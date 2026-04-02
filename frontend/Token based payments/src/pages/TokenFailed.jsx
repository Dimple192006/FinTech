import { useLocation, useNavigate } from "react-router-dom";

export default function TokenFailure() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const isPaymentFailure = state?.mode === "payment";

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="flex items-center justify-between bg-[#00baf2] p-4 text-white">
          <h1 className="text-lg font-semibold">Payment Token</h1>
          <button type="button" onClick={() => navigate("/")} className="text-sm">
            Home
          </button>
        </div>

        <div className="p-4">
          <div className="mb-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl text-red-600">X</span>
            </div>

            <h1 className="mt-3 text-lg font-bold text-red-600">
              {isPaymentFailure ? "Payment Failed" : "Token Generation Failed"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {state?.message || "Something went wrong"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow">
            <p className="text-xs text-gray-400">Possible Reasons</p>

            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>Invalid PIN</li>
              <li>Insufficient token balance</li>
              <li>Expired or locked token</li>
            </ul>

            {state?.tokenId ? (
              <p className="mt-4 text-xs text-slate-500">Token: {state.tokenId}</p>
            ) : null}

            {state?.merchantId ? (
              <p className="mt-1 text-xs text-slate-500">Merchant: {state.merchantId}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => navigate(isPaymentFailure ? "/merchant" : "/create")}
            className="mt-5 w-full rounded-full bg-[#002970] py-3 text-white shadow"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full rounded-full border border-gray-300 py-3"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
