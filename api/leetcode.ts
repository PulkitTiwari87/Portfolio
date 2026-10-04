// Same-origin LeetCode proxy (Vercel Function). LeetCode's GraphQL sends no CORS headers, so the
// browser cannot call it directly. This is NOT an open relay: the client body is ignored and a
// single fixed query for a fixed user is sent upstream.
const USERNAME = 'pulkittiwari51';
const UPSTREAM = 'https://leetcode.com/graphql';
const TIMEOUT_MS = 8000;

const QUERY = `query($u:String!){
  allQuestionsCount{difficulty count}
  matchedUser(username:$u){
    submissionCalendar
    submitStatsGlobal{acSubmissionNum{difficulty count}}
  }
}`;

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export async function POST(): Promise<Response> {
  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      body: JSON.stringify({ query: QUERY, variables: { u: USERNAME } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!upstream.ok) return json({ error: `LeetCode responded ${upstream.status}` }, 502);
    const data: unknown = await upstream.json();
    return json(data, 200, {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    });
  } catch {
    return json({ error: 'LeetCode unavailable' }, 502);
  }
}

// Every other method: 405.
const notAllowed = () => json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
export const GET = notAllowed;
export const HEAD = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
export const OPTIONS = notAllowed;
