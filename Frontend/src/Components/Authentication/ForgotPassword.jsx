import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import AuthShell, { Field, inputCls } from "./AuthShell";
import { Spinner } from "../ui/Primitives";
import { backendFetch, saveSession } from "../../lib/backend";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1 — email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [emailBusy, setEmailBusy] = useState(false);

  // Step 2 — new password (token kept hidden in state)
  const [token, setToken] = useState(null);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [apiError, setApiError] = useState(null);

  /* ── Step 1: request token ── */
  async function submitEmail(e) {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required."); return; }
    if (emailBusy) return;
    setEmailBusy(true);
    setEmailError(null);

    try {
      const data = await backendFetch("/api/v1/users/forgotpassword", {
        method: "POST",
        body: { email: email.trim() },
      });
      // Extract raw token from the returned URL and store it in state.
      // The user never sees or touches the token.
      if (data?.resetUrl) {
        const raw = new URL(data.resetUrl).searchParams.get("token");
        setToken(raw);
      } else {
        // Backend responded but email wasn't found — show a neutral message.
        setEmailError("No account found with that email address.");
      }
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailBusy(false);
    }
  }

  /* ── Step 2: reset password ── */
  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((er) => ({ ...er, [name]: null }));
    setApiError(null);
  }

  function validateReset() {
    const er = {};
    if (!form.newPassword) er.newPassword = "New password is required.";
    else if (form.newPassword.length < 6)
      er.newPassword = "Password must be at least 6 characters.";
    if (!form.confirmPassword) er.confirmPassword = "Please confirm your password.";
    else if (form.newPassword !== form.confirmPassword)
      er.confirmPassword = "Passwords do not match.";
    // else if (form.newPassword === user.password) {
    //   er.newPassword = "New password cannot be the same as old password.";
    // }
    setFieldErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submitReset(e) {
    e.preventDefault();
    if (!validateReset() || resetBusy) return;
    setResetBusy(true);

    try {
      const { user, accessToken } = await backendFetch("/api/v1/users/resetpassword", {
        method: "POST",
        body: { token, newPassword: form.newPassword },
      });
      saveSession(accessToken, user);
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err.message);
      setFieldErrors({ newPassword: err.response?.data?.message})
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <AuthShell
      tagline={{
        head: "Reset your",
        flourish: "password.",
        body: token
          ? "Choose a new password for your account."
          : "Enter the email address for your account.",
      }}
    >
      <div className="flex flex-col gap-8 anim-rise">
        <div className="flex flex-col gap-1.5">
          <span className="microlabel text-faint">account recovery</span>
          <h2 className="text-2xl font-medium tracking-tight">
            {token ? "Set new password" : "Forgot your password?"}
          </h2>
        </div>

        {/* ── Step 1: email ── */}
        {!token && (
          <form onSubmit={submitEmail} className="flex flex-col gap-5" noValidate>
            {emailError && (
              <p className="border border-rose/40 bg-rose/5 px-3.5 py-2.5 font-mono text-[14px] text-rose">
                {emailError}
              </p>
            )}

            <Field label="email address" error={null}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                placeholder="you@example.com"
                className={inputCls}
                autoComplete="email"
                autoFocus
                spellCheck={false}
              />
            </Field>

            <button
              type="submit"
              disabled={emailBusy}
              className="flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-[15px] tracking-wide py-3.5 mt-1 hover:bg-accent-dim active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {emailBusy ? (
                <Spinner size={15} className="!border-black/30 !border-t-black" />
              ) : (
                <>Continue <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        {/* ── Step 2: new password ── */}
        {token && (
          <form onSubmit={submitReset} className="flex flex-col gap-5" noValidate>
            {apiError && (
              <p className="border border-rose/40 bg-rose/5 px-3.5 py-2.5 font-mono text-[14px] text-rose">
                {apiError}
              </p>
            )}

            <Field label="new password" error={fieldErrors.newPassword}>
              <input
                name="newPassword"
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={updateField}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="px-3.5 text-faint hover:text-ink transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            <Field label="confirm password" error={fieldErrors.confirmPassword}>
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={updateField}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="px-3.5 text-faint hover:text-ink transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>
            <p className="microlabel text-faint">{fieldErrors.confirmPassword || fieldErrors.newPassword}</p>
            <button
              type="submit"
              disabled={resetBusy}
              className="flex items-center justify-center gap-2 bg-accent
               text-bg font-semibold text-[15px] tracking-wide py-3.5 mt-1 cursor-pointer
                hover:bg-accent-dim active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {resetBusy ? (
                <Spinner size={15} className="!border-black/30 !border-t-black" />
              ) : (
                <>Reset password <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-[15px] text-mut hover:text-ink transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
