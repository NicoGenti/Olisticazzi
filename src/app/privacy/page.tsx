export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      {/* Header */}
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Informativa
        </p>
        <h1
          className="font-display text-2xl font-bold mt-1"
          style={{ color: "var(--text-primary)" }}
        >
          Privacy
        </h1>
      </header>

      {/* Titolare del trattamento */}
      <section className="glass rounded-2xl p-5 space-y-2">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Titolare del trattamento
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.75)" }}>
          Nicolas Gentilucci — contatto:{" "}
          <a
            href="mailto:privacy@moonmood.app"
            className="underline"
            style={{ color: "var(--accent-violet)" }}
          >
            privacy@moonmood.app
          </a>
        </p>
      </section>

      {/* Dove sono i tuoi dati */}
      <section className="glass rounded-2xl p-5 space-y-2">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Dove sono i tuoi dati
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.75)" }}>
          I dati restano sul tuo dispositivo (IndexedDB/localStorage). Nessuna informazione viene
          inviata a server esterni.
        </p>
      </section>

      {/* Categorie di dati */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Dati raccolti localmente
        </h2>
        <ul className="space-y-1.5">
          {[
            "Registrazioni dell'umore (mood logs)",
            "Note personali",
            "Identificativi delle carte oracolo",
            "Preferiti",
            "Impostazioni dell'app",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm"
              style={{ color: "rgba(245,247,255,0.75)" }}
            >
              <span
                className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--accent-violet)" }}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Nessun tracciamento */}
      <section
        className="glass rounded-2xl p-5 space-y-2"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.24)",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Nessun tracciamento
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.75)" }}>
          Moonmood non utilizza analytics, cookie di tracciamento, né backend remoti. La tua
          esperienza è completamente locale e privata.
        </p>
      </section>
    </main>
  );
}
