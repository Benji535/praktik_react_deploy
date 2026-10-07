import { useState, useRef } from "react";
import "./App.css";

const SIZES = {
  S: { label: "Kecil", scale: 0.8, price: 18000 },
  M: { label: "Sedang", scale: 1, price: 24000 },
  L: { label: "Besar", scale: 1.2, price: 30000 },
};
// "Bahan dari kulkas"
const TOPPINGS = [
  { id: "susu", emoji: "🥛", label: "Susu", price: 4000 },
  { id: "sirup", emoji: "🍯", label: "Sirup", price: 3000 },
  { id: "es", emoji: "🧊", label: "Es batu", price: 2000 },
  { id: "krim", emoji: "🍦", label: "Krim", price: 5000 },
];
const rp = (n) => "Rp" + n.toLocaleString("id-ID");

function Cup({ size, name, lit, toppings }) {
  const has = (id) => toppings.includes(id);
  const coffee = has("susu") ? "#b08560" : "#4a2a14";
  const surface = has("susu") ? "#c9a27a" : "#6b4023";
  return (
    <svg className="cup" style={{ transform: `scale(${SIZES[size].scale})` }} width="200" height="220" viewBox="0 0 200 220">
      <defs>
        <clipPath id="cupClip"><polygon points="52,72 148,72 137,198 63,198" /></clipPath>
      </defs>

      {/* badan cup plastik bening */}
      <polygon points="48,70 152,70 140,200 60,200" fill="#f4f1ea" opacity=".55" />

      {/* kopi: naik saat lampu menyala, permukaan rata */}
      <g clipPath="url(#cupClip)">
        <g className="liquid" style={{ transform: `translateY(${lit ? 0 : 135}px)` }}>
          <rect className="coffee" x="0" y="92" width="200" height="130" fill={coffee} />
          <ellipse className="coffee" cx="100" cy="92" rx="52" ry="7" fill={surface} />
          {[70, 100, 130].map((x, i) => (
            <circle key={x} className="bub" cx={x} cy="192" r={3 + i} fill="#d8b58f" style={{ animationDelay: `${i * 1.1}s` }} />
          ))}
        </g>
      </g>


      {/* es batu mengambang */}
      {has("es") && [72, 98, 126].map((x, i) => (
        <rect key={x} className="ice" style={{ animationDelay: `${i * 0.5}s` }} x={x - 8} y={78 + (i % 2) * 6} width="16" height="16" rx="3" fill="#cdeefc" opacity=".8" stroke="#8cc9e0" strokeWidth="2" />
      ))}

      {/* sleeve cup + label nama */}
      <polygon points="51.5,108 148.5,108 144.4,152 55.6,152" fill="#2b2b2b" />
      <line x1="51" y1="113" x2="149" y2="113" stroke="#c9792e" strokeWidth="3" />
      <line x1="55" y1="147" x2="145" y2="147" stroke="#c9792e" strokeWidth="3" />
      <rect x="64" y="118" width="72" height="24" rx="4" fill="#f3e4cf" />
      <text x="100" y="136" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="20" fill="#2b2b2b">
        {(name || "Nama...").slice(0, 10)}
      </text>

      {/* garis luar tebal */}
      <polygon points="48,70 152,70 140,200 60,200" fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="100" cy="70" rx="52" ry="8" fill="none" stroke="#2b2b2b" strokeWidth="5" />
      <polygon points="60,200 140,200 137,210 63,210" fill="#2b2b2b" />

      {/* topping di atas */}
      {has("krim") && (
        <g className="puff">
          <ellipse cx="100" cy="64" rx="44" ry="13" fill="#fff" stroke="#e8dcc8" strokeWidth="2" />
          <circle cx="100" cy="52" r="14" fill="#fff" stroke="#e8dcc8" strokeWidth="2" />
        </g>
      )}
      {has("sirup") && <path className="drizzle" d={has("krim") ? "M68 62 q8 -8 16 0 t16 0 t16 0 t16 0" : "M64 90 q9 -7 18 0 t18 0 t18 0 t18 0"} stroke="#e0992f" strokeWidth="4" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

export default function KafeDiniHari() {
  // ===== STATE (useState) =====
  const [lit, setLit] = useState(false);          // lampu nyala/mati
  const [name, setName] = useState("");           // nama di gelas
  const [size, setSize] = useState("M");          // ukuran gelas
  const [sugar, setSugar] = useState(2);          // jumlah gula
  const [toppings, setToppings] = useState([]);   // bahan dari kulkas
  const [error, setError] = useState("");         // pesan validasi
  const [order, setOrder] = useState(null);       // data struk
  const [notice, setNotice] = useState("");       // pesan saat kafe tutup
  const [muted, setMuted] = useState(false);      // bisu / tidak
  const [poke, setPoke] = useState(0);           // berapa kali gelas dicolek
  const ctxRef = useRef(null);                    // AudioContext

  // ===== SUARA (Web Audio API, tanpa file mp3) =====
  const tone = (freq, dur = 0.15, type = "sine", vol = 0.15, delay = 0) => {
    if (muted) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const c = ctxRef.current, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur);
  };
  const playClick = () => { tone(140, 0.06, "square", 0.2); tone(90, 0.08, "square", 0.15, 0.05); };
  const playTing = () => { tone(1568, 0.8, "sine", 0.2); tone(2093, 0.9, "sine", 0.1, 0.08); };

  const pokeCup = () => {
    if (!lit) return;
    setPoke((p) => p + 1);
    tone(520 + (poke % 5) * 110, 0.12, "triangle", 0.15);
  };

  const reset = () => { setOrder(null); setName(""); setSugar(2); setSize("M"); setToppings([]); setError(""); };

  const isFilled = name.trim() || toppings.length || sugar !== 2 || size !== "M" || order;

  const toggleLamp = () => {
    playClick();
    if (lit) {
      setLit(false);
      if (isFilled) {
        reset();
        setNotice("Kafe tutup! Barista pulang, pesananmu ikut dibuang 😭 Tarik lagi talinya.");
      }
    } else {
      setNotice("");
      setLit(true);
    }
  };

  const toggleTopping = (id) =>
    setToppings((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const total = (s, tp) => SIZES[s].price + tp.reduce((a, id) => a + TOPPINGS.find((x) => x.id === id).price, 0);

  const submit = () => {
    if (!name.trim()) return setError("Barista butuh nama untuk ditulis di gelas ☕");
    setError("");
    setOrder({ name: name.trim(), size, sugar, toppings, no: Math.floor(Math.random() * 90) + 10 });
    playTing();
  };

  return (
    <div className="kafe">
      <div className={`dark ${lit ? "on" : "off"}`} />
      {lit && [...Array(6)].map((_, i) => (
        <span key={i} className="bean" style={{ left: `${8 + i * 16}%`, animationDelay: `${i * 1.5}s` }}>{i % 2 ? "🫘" : "☕"}</span>
      ))}
      <button className="mute" onClick={() => setMuted(!muted)} aria-label="Bisukan suara">{muted ? "🔇" : "🔊"}</button>
      <button className={`lamp ${lit ? "lit" : ""}`} onClick={toggleLamp} aria-label="Tarik tali lampu">
        <div className="cord" /><div className="shade" /><div className="bulb" />
      </button>
      {!lit && <div className="sign">TUTUP</div>}
      {!lit && <div className="hint">{notice || "Kafe masih tutup... tarik tali lampunya 💡"}</div>}

      {order ? (
        <div className="receipt">
          <div style={{ textAlign: "center", fontSize: 18 }}>☕ KAFE DINI HARI</div>
          <div style={{ textAlign: "center", fontSize: 11 }}>Antrean No. {order.no}</div>
          <hr />
          <div className="row"><span>Atas nama</span><b>{order.name}</b></div>
          <div className="row"><span>Kopi {SIZES[order.size].label}</span><span>{rp(SIZES[order.size].price)}</span></div>
          <div className="row"><span>Gula ({order.sugar} kubus)</span><span>{rp(0)}</span></div>
          {order.toppings.map((id) => {
            const t = TOPPINGS.find((x) => x.id === id);
            return <div className="row" key={id}><span>{t.emoji} {t.label}</span><span>{rp(t.price)}</span></div>;
          })}
          <hr />
          <div className="row"><b>TOTAL</b><b>{rp(total(order.size, order.toppings))}</b></div>
          <hr />
          <div className="hand">{order.sugar >= 4 ? "Manis banget, hati-hati ya!" : order.sugar === 0 ? "Pahit seperti hidup 😌" : "Selamat menikmati!"}</div>
          <button className="go" onClick={reset}>Pesan lagi</button>
        </div>
      ) : (
        <div className="card">
          <div>
            <h1>Pesan Kopi</h1>
            <p className="sub">{lit ? "Isi pesananmu, gelas akan menyesuaikan." : "Terlalu gelap untuk menulis."}</p>

            <label>Nama pemesan</label>
            <input type="text" disabled={!lit} value={name} maxLength={10} placeholder="Tulis di gelas" onChange={(e) => setName(e.target.value)} />
            {error && <div className="err">{error}</div>}

            <label>Ukuran</label>
            <div className="sizes">
              {Object.entries(SIZES).map(([k, v]) => (
                <button key={k} disabled={!lit} className={size === k ? "act" : ""} onClick={() => setSize(k)}>{v.label}</button>
              ))}
            </div>

            <label>Gula: {sugar} kubus</label>
            <input type="range" min="0" max="5" disabled={!lit} value={sugar} onChange={(e) => setSugar(+e.target.value)} />

            <label>Ambil bahan dari kulkas 🧊</label>
            <div className="fridge">
              {TOPPINGS.map((t) => (
                <button key={t.id} disabled={!lit} className={`item ${toppings.includes(t.id) ? "act" : ""}`} onClick={() => toggleTopping(t.id)}>
                  <span>{t.emoji}</span>{t.label} +{t.price / 1000}k
                </button>
              ))}
            </div>

            <button className="go" disabled={!lit} onClick={submit}>Pesan • {rp(total(size, toppings))}</button>
          </div>

          <div className="stage">
            <div key={sugar} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0 }}>
              {Array.from({ length: sugar }).map((_, i) => (
                <div key={i} className="cube" style={{ left: `calc(50% - 40px + ${i * 16}px)`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <div className="bob">
              <div key={`${sugar}-${toppings.join("")}-${poke}`} className="wiggle" onClick={pokeCup}>
                <Cup size={size} name={name} lit={lit} toppings={toppings} />
              </div>
            </div>
            <div className="caption">{lit ? "Colek gelasnya! 👆" : ""}</div>
          </div>
        </div>
      )}

      <footer className="footer">© 2026 Alfarizi Wijaya - 4243550017 - PSIK 24 B</footer>
    </div>
  );
}