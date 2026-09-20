import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Leaf, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Mail } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthCallbackProps {
  onSessionStart?: (token: string, user: any) => void;
}

export function AuthCallback({ onSessionStart }: AuthCallbackProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"processing" | "success" | "unverified" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuthVerification() {
      try {
        if (!isSupabaseConfigured()) {
          setStatus("error");
          setErrorMessage("Supabase URL and API Key are not configured in your environment.");
          return;
        }

        // Check for error from Supabase in query string or hash fragment
        const searchParams = new URLSearchParams(window.location.search);
        const hashString = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
        const hashParams = new URLSearchParams(hashString);

        const errorCode = searchParams.get("error") || hashParams.get("error");
        const errorDescription = searchParams.get("error_description") || hashParams.get("error_description");

        if (errorDescription || errorCode) {
          if (isMounted) {
            setStatus("error");
            const msg = errorDescription
              ? errorDescription.replace(/\+/g, " ")
              : "Verification failed. The link may have expired.";
            setErrorMessage(msg);
          }
          return;
        }

        // PKCE flow: ?code= query param
        const code = searchParams.get("code") || hashParams.get("code");
        let currentSession = null;

        if (code) {
          // PKCE: exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn("exchangeCodeForSession failed (cross-tab PKCE?):", error.message);
          } else {
            currentSession = data.session;
          }
        }

        // Implicit flow: #access_token= hash fragment
        // Poll up to ~2.5 seconds for the session to be ready
        if (!currentSession) {
          for (let attempt = 0; attempt < 8; attempt++) {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data.session) {
              currentSession = data.session;
              break;
            }
            await new Promise(r => setTimeout(r, 300));
          }
        }

        if (!currentSession || !currentSession.user) {
          if (isMounted) {
            setStatus("error");
            setErrorMessage(
              "No valid session found. The verification link may have already been used or expired. " +
              "Please request a new verification email below."
            );
          }
          return;
        }

        const user = currentSession.user;
        const isEmailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);

        if (!isEmailVerified) {
          if (isMounted) {
            setStatus("unverified");
            setResendEmail(user.email || "");
          }
          return;
        }


        // CRITICAL: DO NOT automatically log the user in!
        // Clear Supabase session and local tokens so user must manually sign in
        try {
          await supabase.auth.signOut();
          localStorage.removeItem("kalasetu-supabase-auth");
        } catch {}

        if (isMounted) {
          setStatus("success");
          // Clean hash from browser URL bar to verification-success
          try {
            window.history.replaceState(null, "", "/verification-success");
          } catch {}
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err.message || "Failed to verify your account. Please request a new verification link."
          );
        }
      }
    }

    handleAuthVerification();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    setResendNotice("");
    try {
      const redirectUrl = typeof window !== "undefined" && window.location?.origin
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:8080/auth/callback";

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      setResendSuccess(true);
      setResendNotice(`A fresh verification link has been sent to ${resendEmail}. Please check your inbox.`);
    } catch (err: any) {
      setResendNotice(err.message || "Failed to resend verification link. Please try again in a few moments.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#9C0000] text-white flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute inset-0 paisley-bg opacity-30" />

      <div className="relative z-10 w-full max-w-md bg-[#FFFDF8] text-[#24130F] rounded-3xl p-8 shadow-2xl border border-[#E9DDBA] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF2C9] text-[#9C0000] mb-5">
          <Leaf size={28} />
        </div>

        {status === "processing" && (
          <div>
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-3 border-[#D4AF37] border-t-transparent mb-4" />
            <h2 className="font-serif text-2xl text-[#2C1710]">Verifying your email...</h2>
            <p className="mt-2 text-sm text-[#836A5F]">
              Confirming your artisan credentials.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#24130F]">Verification Done!</h2>
            <p className="mt-3 text-base text-[#4A3831] font-medium">
              Your email has been successfully verified.
            </p>
            <p className="mt-2 text-sm text-[#7D6359]">
              Get back to Sign In to continue.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="mt-6 w-full rounded-xl bg-[#9C0000] py-3.5 text-sm font-semibold text-[#FFE7A6] shadow-md hover:bg-[#750000] transition flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {status === "unverified" && (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-4">
              <Mail size={26} />
            </div>
            <h2 className="font-serif text-2xl text-[#2C1710]">Email Not Yet Verified</h2>
            <p className="mt-2 text-sm text-[#836A5F]">
              We couldn't confirm your verification for <strong>{resendEmail}</strong>. Please make sure to click the link sent to your inbox.
            </p>

            {resendNotice && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${resendSuccess ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {resendNotice}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="mt-6 w-full rounded-xl bg-[#9C0000] py-3 text-sm font-semibold text-[#FFE7A6] hover:bg-[#750000] disabled:opacity-60 transition"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="mt-3 w-full rounded-xl border border-[#C5A66D] py-2.5 text-xs font-semibold text-[#66493E] hover:bg-[#FFF2C9] transition"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 mb-4">
              <AlertCircle size={28} />
            </div>
            <h2 className="font-serif text-2xl text-[#2C1710]">Verification Link Expired</h2>
            <p className="mt-2 text-sm text-[#836A5F]">{errorMessage}</p>

            <div className="mt-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-left text-[#6E5148] mb-1">
                  Enter your email to receive a new link:
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  placeholder="e.g. artisan@gmail.com"
                  className="w-full rounded-xl border border-[#C5A66D] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9C0000]"
                />
              </div>

              {resendNotice && (
                <div className={`p-3 rounded-xl text-xs font-medium ${resendSuccess ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                  {resendNotice}
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={resendLoading || !resendEmail}
                className="w-full rounded-xl bg-[#9C0000] py-3 text-sm font-semibold text-[#FFE7A6] hover:bg-[#750000] disabled:opacity-60 transition"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>

              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-xl border border-[#C5A66D] py-2.5 text-xs font-semibold text-[#66493E] hover:bg-[#FFF2C9] transition"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
