import Link from "next/link";

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-md transition-colors"
    >
      Login
    </Link>
  );
}
