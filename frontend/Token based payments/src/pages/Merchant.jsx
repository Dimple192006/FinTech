import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchToken, redeemToken } from "../lib/tokenApi";

function parseQrPayload(value) {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export default function Merchant() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialPayload = state?.qrPayload || state?.token?.qrPayload || "";

  const [qrPayload, setQrPayload] = useState(initialPayload);
  const [merchantId, setMerchantId] = useState("Merchant Demo");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [token, setToken] = useState(state?.token || null);

  const scannedPayload = useMemo(() => parseQrPayload(qrPayload), [qrPayload]);
  const scannedTokenId = scannedPayload?.tokenId || token?.tokenId || "";

  async function handleScan() {
    if (!scannedPayload?.tokenId) {
      setLookupError("Scan or paste a valid QR payload first");
      setToken(null);
      return;
    }

    try {
      setLoadingToken(true);
      setLookupError("");
      const data = await fetchToken(scannedPayload.tokenId);
      setToken(data.token);
      if (!amount && data.token.remainingAmount) {
        setAmount(String(data.token.remainingAmount));
      }
    } catch (err) {
      setLookupError(err.message);
      setToken(null);
    } finally {
      setLoadingToken(false);
    }
  }

  async function handleProceed() {
    try {
      setProcessing(true);
      setLookupError("");

      const data = await redeemToken({
        tokenId: scannedTokenId,
        amount: Number(amount),
        pin,
        merchantId
      });

      navigate("/success", {
        state: {
          mode: "payment",
          token: data.token,
          merchantId,
          paidAmount: Number(amount)
        }
      });
    } catch (err) {
      navigate("/failure", {
        state: {
          mode: "payment",
          message: err.message,
          tokenId: scannedTokenId,
          merchantId
        }
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleQrImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!("BarcodeDetector" in window)) {
      setLookupError("QR image upload is not supported in this browser. Paste the QR payload instead.");
      return;
    }

    try {
      setUploadingQr(true);
      setLookupError("");

      const detector = new window.BarcodeDetector({
        formats: ["qr_code"]
      });

      const bitmap = await createImageBitmap(file);
      const results = await detector.detect(bitmap);
      bitmap.close();

      const rawValue = results[0]?.rawValue;

      if (!rawValue) {
        setLookupError("Could not read a QR code from that PNG. Try another image.");
        return;
      }

      setQrPayload(rawValue);
    } catch {
      setLookupError("Could not process that QR image. Try another PNG or paste the payload.");
    } finally {
      setUploadingQr(false);
      event.target.value = "";
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-300 py-6">
      <div className="w-[390px] overflow-hidden rounded-[35px] bg-[#f5f7fb] shadow-xl">
        <div className="bg-[#00baf2] p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Merchant Pay</h1>
              <p className="text-xs opacity-80">Scan token QR and collect payment</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/token")}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold"
            >
              Back
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">QR scan payload</p>
            <textarea
              rows="4"
              value={qrPayload}
              onChange={(event) => setQrPayload(event.target.value)}
              placeholder='Paste scanned QR JSON like {"tokenId":"...","amount":100}'
              className="mt-2 w-full rounded-xl border p-3 text-sm outline-none"
            />

            <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-[#00baf2] bg-[#f8fbff] p-3 text-center text-sm font-medium text-[#002970]">
              {uploadingQr ? "Reading PNG..." : "Upload saved QR PNG"}
              <input
                type="file"
                accept="image/png,image/*"
                onChange={handleQrImageUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleScan}
              disabled={loadingToken || uploadingQr}
              className="mt-3 w-full rounded-full bg-[#002970] py-3 text-white"
            >
              {loadingToken ? "Scanning..." : "Scan QR"}
            </button>

            {lookupError ? (
              <p className="mt-3 text-xs text-rose-600">{lookupError}</p>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#002970]">Payment Details</h2>
              <span className="text-[11px] text-slate-500">
                {token ? "Token verified" : "No token scanned"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-1 text-sm text-gray-500">Merchant name</p>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(event) => setMerchantId(event.target.value)}
                  className="w-full rounded-lg border p-3 outline-none"
                />
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">Enter amount</p>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Rs. 0"
                  className="w-full rounded-lg border p-3 outline-none"
                />
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">User PIN</p>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="Enter token PIN"
                  className="w-full rounded-lg border p-3 outline-none"
                />
              </div>
            </div>

            {token ? (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-[#f8fbff] p-3">
                  <p className="text-[10px] text-slate-400">Status</p>
                  <p className="mt-1 text-xs font-semibold capitalize text-slate-700">
                    {token.status.replace("_", " ")}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8fbff] p-3">
                  <p className="text-[10px] text-slate-400">Expires</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {new Date(token.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleProceed}
              disabled={!token || processing}
              className="mt-5 w-full rounded-full bg-[#00b05a] py-3 text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {processing ? "Processing payment..." : "Proceed Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
