import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthShell, { Field, inputCls } from "./AuthShell";
import { Spinner } from "../ui/Primitives";
import { backendFetch, saveSession, mergeGuestConnectionsIntoAccount } from "../../lib/backend";
import { getConnections, replaceConnections } from "../../lib/connections";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null, api: null }));
  }

  function validate() {
    const er = {};
    if (!form.identifier.trim()) er.identifier = "Username or email is required.";
    if (!form.password) er.password = "Password is required.";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate() || busy) return;
    setBusy(true);

    try {
      const { user, accessToken } = await backendFetch("/api/v1/users/login", {
        method: "POST",
        body: {
          identifier: form.identifier.trim(),
          password: form.password,
        },
      });
      saveSession(accessToken, user);
      const merged = await mergeGuestConnectionsIntoAccount(user.connections, getConnections());
      replaceConnections(merged);
      navigate("/");
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      tagline={{
        head: "Welcome back to",
        flourish: "your signal.",
        body: "Sign in to pick up where you left off — your connected GitHub and LeetCode profiles are waiting.",
      }}
    >
      <div className="flex flex-col gap-8 anim-rise">
        <div className="flex flex-col gap-1.5">
          <span className="microlabel text-faint">sign in</span>
          <h2 className="text-2xl font-medium tracking-tight">Open the dashboard</h2>
        </div>

        {errors.api && (
          <p className="border border-rose/40 bg-rose/5 px-3.5 py-2.5 font-mono text-[12px] text-rose">
            {errors.api}
          </p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label="username / email" error={errors.identifier}>
            <input
              name="identifier"
              value={form.identifier}
              onChange={update}
              placeholder="you@example.com"
              className={inputCls}
              autoComplete="username"
              spellCheck={false}
            />
          </Field>

          <Field
            label="password"
            error={errors.password}
            right={
              <a href="#forgot" className="microlabel text-faint hover:text-mut transition-colors">
                forgot?
              </a>
            }
          >
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update}
              placeholder="••••••••"
              className={inputCls}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="px-3.5 text-faint hover:text-ink transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-[13px] tracking-wide py-3.5 mt-1 hover:bg-accent-dim active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {busy ? (
              <Spinner size={15} className="!border-black/30 !border-t-black" />
            ) : (
              <>
                sign in <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-[13px] text-mut">
          New here?{" "}
          <Link to="/register" className="text-accent hover:underline underline-offset-4">
            Create an account
          </Link>{" "}
          <span className="text-faint">
            — or{" "}
            <Link to="/" className="underline underline-offset-4 hover:text-mut transition-colors">
              skip straight to the dashboard
            </Link>
            .
          </span>
        </p>
      </div>
    </AuthShell>
  );
}
