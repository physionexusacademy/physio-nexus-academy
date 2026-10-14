"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
          <div style={{ maxWidth: "34rem" }}>
            <p style={{ color: "#087f8c", fontWeight: 700, letterSpacing: "0.12em" }}>PHYSIO NEXUS ACADEMY</p>
            <h1 style={{ color: "#082f49", fontSize: "2rem" }}>We hit an unexpected error</h1>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>The page could not be displayed. Please try again or return to the homepage.</p>
            <button onClick={() => reset()} style={{ margin: "0.5rem", border: 0, borderRadius: "0.5rem", padding: "0.8rem 1.2rem", background: "#087f8c", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Try again</button>
            <a href="/" style={{ display: "inline-block", margin: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.8rem 1.2rem", color: "#082f49", textDecoration: "none", fontWeight: 700 }}>Return home</a>
          </div>
        </main>
      </body>
    </html>
  );
}
