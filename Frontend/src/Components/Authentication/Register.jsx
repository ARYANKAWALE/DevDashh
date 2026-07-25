import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthShell, { Field, inputCls } from "./AuthShell";
import { Spinner, GitHubMark, LeetCodeMark } from "../ui/Primitives";
import { validateGitHub, validateLeetCode } from "../../lib/api";
import { getConnections, replaceConnections } from "../../lib/connections";
import { backendFetch, saveSession } from "../../lib/backend";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    // prefill with anything already linked as a guest
    const local = getConnections();
    return {
      username: "",
      email: "",
      password: "",
      confirm: "",
      github: local.github ?? "",
      leetcode: local.leetcode ?? "",
    };
  });
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
    if (!form.username.trim()) er.username = "Pick a username.";
    else if (form.username.trim().length < 3) er.username = "At least 3 characters.";
    if (!form.email.trim()) er.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "That email doesn't look right.";
    if (!form.password) er.password = "Password is required.";
    else if (form.password.length < 6) er.password = "At least 6 characters.";
    if (form.confirm !== form.password) er.confirm = "Passwords don't match.";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  /** Validates optional platform usernames against the public APIs. */
  async function validatePlatforms(ghName, lcName) {
    const er = {};
    if (ghName) {
      try {
        await validateGitHub(ghName);
      } catch (e) {
        er.github = e.message;
      }
    }
    if (lcName) {
      try {
        await validateLeetCode(lcName);
      } catch (e) {
        er.leetcode = e.message;
      }
    }
    return er;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate() || busy) return;
    setBusy(true);

    const ghName = form.github.trim().replace(/^@/, "") || null;
    const lcName = form.leetcode.trim().replace(/^@/, "") || null;

    const platformErrors = await validatePlatforms(ghName, lcName);
    if (Object.keys(platformErrors).length > 0) {
      setErrors((er) => ({ ...er, ...platformErrors }));
      setBusy(false);
      return;
    }

    try {
      const { user, accessToken } = await backendFetch("/api/v1/users/register", {
        method: "POST",
        body: {
          username: form.username.trim().toLowerCase(),
          email: form.email.trim(),
          password: form.password,
          github: ghName,
          leetcode: lcName,
        },
      });
      saveSession(accessToken, user);
      replaceConnections(user.connections);
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
        head: "One canvas for",
        flourish: "everything you ship.",
        body: "Create an account, link your public profiles, and watch your GitHub and LeetCode signal come alive on one dashboard.",
      }}
    >
      <div className="flex flex-col gap-8 anim-rise">
        <div className="flex flex-col gap-1.5">
          <span className="microlabel text-faint">create account</span>
          <h2 className="text-2xl font-medium tracking-tight">Join DevDash</h2>
        </div>

        {errors.api && (
          <p className="border border-rose/40 bg-rose/5 px-3.5 py-2.5 font-mono text-[14px] text-rose">
            {errors.api}
          </p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label="username" error={errors.username}>
            <input
              name="username"
              value={form.username}
              onChange={update}
              placeholder="dev_ninja"
              className={inputCls}
              autoComplete="username"
              spellCheck={false}
            />
          </Field>

          <Field label="email" error={errors.email}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              className={inputCls}
              autoComplete="email"
              spellCheck={false}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="password" error={errors.password}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="px-3 text-faint hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>
            <Field label="confirm" error={errors.confirm}>
              <input
                name="confirm"
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={update}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
              />
            </Field>
          </div>

          {/* optional platform linking */}
          <div className="flex flex-col gap-4 border-t border-linesoft pt-5 mt-1">
            <span className="microlabel text-faint">
              link platforms now <span className="text-line">·</span> optional
            </span>
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <span className="text-ghb">
                    <GitHubMark size={11} />
                  </span>
                  github username
                </span>
              }
              error={errors.github}
            >
              <input
                name="github"
                value={form.github}
                onChange={update}
                placeholder="octocat"
                className={inputCls}
                spellCheck={false}
              />
            </Field>
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <span className="text-lc">
                    <LeetCodeMark size={11} />
                  </span>
                  leetcode username
                </span>
              }
              error={errors.leetcode}
            >
              <input
                name="leetcode"
                value={form.leetcode}
                onChange={update}
                placeholder="neal_wu"
                className={inputCls}
                spellCheck={false}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-[15px] tracking-wide py-3.5 mt-1 hover:bg-accent-dim active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {busy ? (
              <Spinner size={15} className="!border-black/30 !border-t-black" />
            ) : (
              <>
                create account <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-[15px] text-mut">
          Already registered?{" "}
          <Link to="/login" className="text-accent hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
