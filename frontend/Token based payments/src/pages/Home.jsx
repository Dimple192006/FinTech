import react from "react"
import {useNavigate} from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="flex justify-center bg-gray-300 min-h-screen py-6">

      {/* 📱 PHONE */}
      <div className="w-[390px] bg-[#f5f7fb] rounded-[35px] overflow-hidden shadow-xl relative">

        {/* 🔵 HEADER */}
        <div className="bg-[#00baf2] px-4 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
              SS
            </div>
            <div>
              <p className="text-sm font-bold leading-none">paytm</p>
              <p className="text-[10px] opacity-90">UPI</p>
            </div>
          </div>
          <div className="flex gap-4 text-lg">
            🔍 💬
          </div>
        </div>

        {/* ⚡ BANNER */}
        <div className="p-3">
          <div className="bg-white rounded-xl p-3 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-sm font-semibold leading-tight">
                Lightning fast payments always
              </p>
              <button className="mt-2 bg-[#00baf2] text-white text-xs px-3 py-1 rounded">
                Pay using Wallet
              </button>
            </div>
            <div className="text-[#00baf2] text-center font-bold">
              <p className="text-xs">in</p>
              <p className="text-xl">2</p>
              <p className="text-xs">seconds</p>
            </div>
          </div>
        </div>

        {/* 💸 UPI SECTION */}
        <div className="px-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">
              UPI Money Transfer
            </h2>

            <div className="grid grid-cols-5 text-center text-[11px] gap-3">

  <div className="flex flex-col items-center gap-1">
    <div className="text-xl">📷</div>
    <p>Scan & Pay</p>
  </div>

  <div className="flex flex-col items-center gap-1">
    <div className="text-xl">👤</div>
    <p>To Mobile</p>
  </div>

  <div className="flex flex-col items-center gap-1">
    <div className="text-xl">📱</div>
    <p>To UPI Apps</p>
  </div>

  {/* 🔥 NEW TOKEN OPTION */}
  <div className="flex flex-col items-center gap-1" onClick={() => navigate("/token")}>
    <div className="text-xl">🪙</div>
    <p>Token</p>
  </div>

  <div className="flex flex-col items-center gap-1">
    <div className="text-xl">🏦</div>
    <p>To Bank</p>
  </div>

</div>

            {/* SMALL OPTIONS */}
            <div className="flex justify-between mt-4 text-[10px]">
              <span className="bg-gray-100 px-2 py-1 rounded">
                Balance & History
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                To Self Account
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                Receive Money
              </span>
            </div>
          </div>
        </div>

        {/* 🧾 MY PAYTM */}
        <div className="px-3 mt-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">My Paytm</h2>
              <span className="text-[10px] text-yellow-600 font-semibold">
                Activate UPI Lite
              </span>
            </div>

            <div className="grid grid-cols-4 text-center text-[11px] gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">💰</div>
                <p>Wallet</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">📄</div>
                <p>Postpaid</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">👥</div>
                <p>Refer & Earn</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">💳</div>
                <p>Loan</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 RECHARGE */}
        <div className="px-3 mt-3 pb-20">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between mb-3">
              <h2 className="text-sm font-semibold">
                Recharge & Bill Payments
              </h2>
              <span className="text-[10px] text-blue-500">My Bills</span>
            </div>

            <div className="grid grid-cols-4 text-center text-[11px] gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">📱</div>
                <p>Mobile</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">⚡</div>
                <p>Electricity</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">💧</div>
                <p>Water</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl">📺</div>
                <p>DTH</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔘 SCAN BAR (BOTTOM) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button className="bg-[#002970] text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold">
            Scan Any QR
          </button>
        </div>

      </div>
    </div>
  );
}