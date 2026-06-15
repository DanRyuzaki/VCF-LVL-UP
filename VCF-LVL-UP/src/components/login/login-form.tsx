"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelector from "@/components/login/role-selector";
import ConsentModal from "@/components/login/consent-modal";
import { UserRole } from "@/types/user";

export default function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const welcomeMessage = selectedRole
    ? `WELCOME BACK, ${selectedRole.toUpperCase()}!`
    : "WELCOME BACK!";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) { setError("Please select your role."); return; }
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!consentGiven) { setShowModal(true); return; }
    router.push(`/${selectedRole}`);
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowModal(false);
    router.push(`/${selectedRole}`);
  };

  return (
    <>
      {showModal && (
        <ConsentModal onAccept={handleConsentAccept} onClose={() => setShowModal(false)} />
      )}

      <div className="bg-[#121212] border border-[#2E2E2E] rounded-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="font-head text-2xl font-bold tracking-widest uppercase text-[#FF4655] mb-1">
            eFaith<span className="text-white">Connect</span>
          </div>
          <h2 className="font-head text-xl font-bold uppercase tracking-[2px] mb-1">
            {welcomeMessage}
          </h2>
          <p className="text-[#808080] text-xs">Select your role to continue</p>
        </div>

        {/* Role Selector */}
        <RoleSelector selected={selectedRole} onSelect={setSelectedRole} />

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@faithyouth.com"
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FF4655] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#808080] outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FF4655] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#808080] outline-none transition-colors"
            />
          </div>

          {/* Consent note */}
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-3">
            <p className="text-[11px] text-[#808080] leading-relaxed">
              By logging in you agree to our Data Privacy policy in compliance with{" "}
              <span className="text-[#B8B8B8]">RA 10173</span>. You will be prompted to confirm
              your consent before proceeding.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[#FF4655] text-xs">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#FF4655] hover:bg-[#E53E4D] text-white font-semibold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-5">
          <a href="/" className="text-[#808080] hover:text-[#B8B8B8] text-xs transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
