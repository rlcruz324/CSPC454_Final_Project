// //Home Page Test

// export default function HomePage() {
//   return (
//     <main>
//       <h1>Welcome to the Home Page</h1>
//     </main>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function HomePage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/landing-page");     // user is signed in
    }

    if (authStatus === "unauthenticated") {
      router.replace("/signin");      // user is NOT signed in
    }
  }, [authStatus, router]);

  // optional: loading screen to avoid flicker
  return <p>Loading...</p>;
}
