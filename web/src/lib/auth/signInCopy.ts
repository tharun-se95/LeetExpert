/**
 * The sign-in page's words, in one place so the page renders them and the tests
 * assert them. Every claim maps to a shipped feature (spec
 * 2026-09-19-sign-in-page-design.md §2.2): only visited, solved and
 * problem-sandbox drafts sync; a draft conflict stashes rather than overwrites;
 * export and delete exist under /api/account. Do not add a claim without the
 * feature behind it.
 */
export const SIGN_IN_COPY = {
  /** The landing's kicker idiom; "optional" is the claim the sub-line makes good. */
  kicker: "Optional account",
  headline: "Pick up where you left off, on any device.",
  /** Drawn over by hand, as the landing's section headings mark their key word. */
  mark: "any device",
  subline: "The course works signed out too. Sign in only to sync.",
  benefits: [
    {
      id: "place",
      title: "Your place is saved",
      body: "Lessons you have visited and problems you have solved follow your account.",
    },
    {
      id: "code",
      title: "Your code follows you",
      body: "Your sandbox code syncs per problem. If two devices disagree, both versions are kept and you choose.",
    },
    {
      id: "own",
      title: "Yours to take or delete",
      body: "Export your data as a file, or delete the account and everything in it.",
    },
  ],
  // Kept word for word from the reviewed page: no privacy page exists yet, and
  // session rows may hold more than this names, so it must not say "nothing else".
  stored: "We store your name, email, avatar, lesson progress and sandbox code.",
} as const;
