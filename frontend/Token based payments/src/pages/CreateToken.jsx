import { useState } from "react";

const BASE_URL = "http://localhost:6000/api/token";

export default function CreateToken() {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, pin }),
      });

      const data = await res.json();
      setTokenData(data.token);
    } catch (err) {
      alert("Error creating token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      {/* 📱 MOBILE UI */}
      <div className="w-[390px] bg-white rounded-xl shadow-lg p-5">

        <h1 className="text-xl font-bold mb-4 text-center">
          Create Token
        </h1>

        {/* 💰 Amount */}
        <input
          type="number"
          placeholder="Enter Amount ₹"
          className="w-full p-3 border rounded-lg mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* 🔐 PIN */}
        <input
          type="password"
          placeholder="Set Token PIN"
          className="w-full p-3 border rounded-lg mb-4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        {/* 🔘 BUTTON */}
        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Generate Token"}
        </button>

        {/* 🎉 RESULT */}
        {tokenData && (
          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500">Token ID</p>
            <p className="font-semibold break-all">
              {tokenData.tokenId}
            </p>

            {/* QR if available */}
            {tokenData.qrPayload && (
              <img
                src={tokenData.qrPayload}
                alt="QR"
                className="mx-auto mt-4 w-40"
              />
            )}

            <p className="mt-2 text-green-600">
              ₹{tokenData.remainingAmount} Ready
            </p>
          </div>
        )}

      </div>
    </div>
  );
}