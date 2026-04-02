import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function TokenSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const qrRef = useRef();
  const [copied, setCopied] = useState(false);
  const isPaymentSuccess = state?.mode === "payment";
  const qrPayloadText =
    state?.token?.qrPayload ||
    JSON.stringify({
      tokenId: state?.token?.tokenId,
      amount: state?.token?.remainingAmount,
      expiresAt: state?.token?.expiresAt
    });

  if (!state) return <p>No token data</p>;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "token-qr.png";
    link.click();
  };

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(qrPayloadText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

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
          <div className="mb-4 text-center">
            <h1 className="text-lg font-bold text-green-600">
              {isPaymentSuccess ? "Payment Successful" : "Token Created"}
            </h1>
            <p className="text-xs text-gray-500">
              {isPaymentSuccess
                ? "Merchant has received the payment"
                : "Use this QR to pay securely"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow">
            {!isPaymentSuccess ? (
              <>
                <div ref={qrRef} className="flex justify-center">
                  <QRCodeCanvas
                    value={JSON.stringify({
                      tokenId: state.token.tokenId,
                      amount: state.token.remainingAmount
                    })}
                    size={180}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-500">Scan to Pay</p>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-4 text-left">
                <p className="text-[11px] text-emerald-700">Merchant</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {state.merchantId}
                </p>
                <p className="mt-3 text-[11px] text-emerald-700">Paid amount</p>
                <p className="mt-1 text-lg font-bold text-[#002970]">
                  Rs. {state.paidAmount}
                </p>
              </div>
            )}

            <p className="mt-2 text-2xl font-bold text-[#002970]">
              Rs. {isPaymentSuccess ? state.paidAmount : state.token.remainingAmount}
            </p>

            {!isPaymentSuccess ? (
              <>
                <p className="mt-2 text-xs text-gray-400">Token ID</p>
                <p className="break-all text-sm font-semibold">{state.token.tokenId}</p>

                <p className="mt-2 text-xs text-gray-400">Expires</p>
                <p className="text-xs text-gray-600">
                  {new Date(state.token.expiresAt).toLocaleString()}
                </p>
              </>
            ) : null}

            {!isPaymentSuccess && state.wallet ? (
              <div className="mt-4 rounded-xl bg-[#f8fbff] p-3 text-left">
                <p className="text-[11px] text-gray-500">Wallet available after create</p>
                <p className="mt-1 text-sm font-semibold text-[#002970]">
                  Rs. {state.wallet.availableBalance}
                </p>
              </div>
            ) : null}

            {!isPaymentSuccess ? (
              <div className="mt-3 rounded-xl bg-[#f8fbff] p-3 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-500">
                    Copy this JSON and paste it on merchant side
                  </p>
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="shrink-0 rounded-full bg-[#002970] px-3 py-1 text-[11px] font-semibold text-white"
                  >
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-[11px] text-slate-700">
                  {qrPayloadText}
                </pre>
              </div>
            ) : null}
          </div>

          {!isPaymentSuccess ? (
            <>
              <button
                type="button"
                onClick={downloadQR}
                className="mt-5 w-full rounded-full bg-[#002970] py-3 text-white shadow"
              >
                Download QR
              </button>

            </>
          ) : null}

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

export default TokenSuccess;
