import { useEffect, useMemo, useState } from "react";
import { lc, leetCodeErrorMessage } from "../lib/api";
import { useConnections } from "../lib/connections";

/** Builds 364 day-cells (52 weeks) from a LeetCode submission calendar. */
export function buildLeetCodeCells(submissionCalendar) {
  let cal = submissionCalendar ?? {};
  if (typeof cal === "string") {
    try {
      cal = JSON.parse(cal);
    } catch {
      cal = {};
    }
  }
  const cells = [];
  const today = new Date();

  for (let i = 363; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // LeetCode calendar keys are UTC midnight timestamps in seconds
    const ts = Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 1000
    ).toString();
    const count = cal[ts] ? Number(cal[ts]) : 0;
    const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    cells.push({ date, count, level });
  }
  return cells;
}

function computeStreaks(cells) {
  let current = 0;
  let i = cells.length - 1;
  if (cells[i] && cells[i].count === 0) i--;
  for (; i >= 0; i--) {
    if (cells[i].count > 0) current++;
    else break;
  }
  let longest = 0;
  let run = 0;
  for (const c of cells) {
    run = c.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  return { current, longest };
}

export function useLeetCodeData() {
  const { leetcode: username } = useConnections();
  const [state, setState] = useState({
    status: username ? "loading" : "idle",
    error: null,
    user: null,
  });

  useEffect(() => {
    if (!username) {
      setState({ status: "idle", error: null, user: null });
      return;
    }

    let alive = true;
    setState((s) => ({ ...s, status: "loading", error: null }));

    (async () => {
      try {
        const data = await lc.profile(username);
        if (!alive) return;
        if (data?.totalSolved === undefined) {
          setState({
            status: "error",
            error: `LeetCode user “${username}” was not found.`,
            user: null,
          });
          return;
        }
        setState({ status: "ready", error: null, user: { username, ...data } });
      } catch (e) {
        if (!alive) return;
        setState({
          status: "error",
          error: leetCodeErrorMessage(e),
          user: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [username]);

  const cells = useMemo(
    () => (state.user ? buildLeetCodeCells(state.user.submissionCalendar) : null),
    [state.user]
  );

  const yearTotal = useMemo(
    () => (cells ? cells.reduce((s, c) => s + c.count, 0) : null),
    [cells]
  );

  const streaks = useMemo(
    () => (cells ? computeStreaks(cells) : { current: null, longest: null }),
    [cells]
  );

  return {
    username,
    status: state.status,
    error: state.error,
    user: state.user,
    loading: state.status === "loading",
    cells,
    yearTotal,
    streaks,
  };
}
