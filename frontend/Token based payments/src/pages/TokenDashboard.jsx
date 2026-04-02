import { useNavigate } from "react-router-dom";

export default function TokenDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center bg-gray-300 min-h-screen py-6">

      {/* 📱 PHONE */}
      <div className="w-[390px] bg-[#f5f7fb] rounded-[35px] shadow-xl overflow-hidden relative">

        {/* 🔵 HEADER */}
        <div className="bg-[#00baf2] p-4 text-white">
          <h1 className="text-lg font-semibold">Token Services</h1>
          <p className="text-xs opacity-80">
            Secure prepaid token payments
          </p>
        </div>

        {/* 🧩 OPTIONS */}
        <div className="p-4 grid grid-cols-2 gap-4">

          {/* CREATE TOKEN */}
          <div
            onClick={() => navigate("/create")}
            className="bg-white p-4 rounded-xl shadow cursor-pointer flex flex-col items-center"
          >
            <div className="text-3xl">🪙</div>
            <p className="mt-2 text-sm font-semibold">Create Token</p>
          </div>

          {/* MANAGE TOKENS */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
            <div className="text-3xl">⚙️</div>
            <p className="mt-2 text-sm font-semibold">Manage Tokens</p>
          </div>

          {/* TOKEN HISTORY */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
            <div className="text-3xl">📜</div>
            <p className="mt-2 text-sm font-semibold">Token History</p>
          </div>

          {/* VIEW TOKENS */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
            <div className="text-3xl">👁️</div>
            <p className="mt-2 text-sm font-semibold">View Tokens</p>
          </div>

        </div>

        {/* 🔘 SCAN QR BUTTON */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <button className="bg-[#002970] text-white px-6 py-3 rounded-full shadow-lg">
            Scan QR
          </button>
        </div>

      </div>
    </div>
  );
}