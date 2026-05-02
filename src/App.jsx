import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  Lock,
  LogOut,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { DEMO_RECORDS, EXPECTED_AMOUNT, FACILITATORS } from "./seedData";
import { cleanName, downloadCSV, makeId, money, normalize, shortDate } from "./utils";

function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ContactStrip() {
  return (
    <div className="contact-strip">
      {FACILITATORS.map((person) => (
        <div key={person.name} className="contact-pill">
          <Phone size={16} />
          <span><b>{person.name}:</b> {person.phone}</span>
        </div>
      ))}
    </div>
  );
}

function PublicPrintHeader() {
  return (
    <div className="public-print-header">
      <h1>PEER-TO-PEER TUITION – COHORT 3</h1>
      <p className="print-subtitle">SEM 2-BLK 2 Contribution Register</p>
      <p className="print-thanks">Thank you for joining Peer-to-Peer Tuition.</p>
      <div className="print-contacts">
        {FACILITATORS.map((person) => (
          <span key={person.name}><b>{person.name}:</b> {person.phone}</span>
        ))}
      </div>
    </div>
  );
}

function ContributionTable({ records, adminMode, onEdit, onDelete }) {
  return (
    <div className="table-card">
      <table className={adminMode ? "admin-table" : "public-table"}>
        <thead>
          <tr>
            <th className="serial-cell">No.</th>
            <th>Name</th>
            <th>Amount</th>
            {adminMode && <th>Payment Status</th>}
            {adminMode && <th>Reason</th>}
            {adminMode && <th>Paid At</th>}
            {adminMode && <th className="actions-cell">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={adminMode ? 7 : 3} className="empty-cell">No matching contributor found.</td></tr>
          ) : records.map((record) => {
            const partial = Number(record.amount) < EXPECTED_AMOUNT;
            return (
              <tr key={record.id} className={partial ? "partial-row" : ""}>
                <td className="serial-cell">{record.serial_number}</td>
                <td className="name-cell">{record.name}</td>
                <td className="amount-cell">{money(record.amount)}</td>
                {adminMode && <td><span className={`status ${partial ? "partial" : "full"}`}>{partial ? "Partial" : "Full"}</span></td>}
                {adminMode && <td className="reason-cell">{record.reason || "—"}</td>}
                {adminMode && <td className="date-cell">{shortDate(record.paid_at || record.created_at)}</td>}
                {adminMode && (
                  <td className="actions-cell no-print-actions">
                    <button className="mini-button" onClick={() => onEdit(record)}><Pencil size={15} /> Edit</button>
                    <button className="mini-button danger" onClick={() => onDelete(record)}><Trash2 size={15} /> Delete</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConfigNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="notice warning">
      <AlertTriangle size={20} />
      <div>
        <b>Demo mode:</b> Supabase is not connected yet. The page is showing the saved sample records, but live saving and automatic updates will start after you create Supabase and fill <code>.env.local</code>.
      </div>
    </div>
  );
}

function PublicView({ records, loading, updatedAt }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = normalize(query);
    return records.filter((record) => {
      const matchesName = !q || normalize(record.name).includes(q);
      const partial = Number(record.amount) < EXPECTED_AMOUNT;
      const matchesStatus = statusFilter === "all" || (statusFilter === "partial" ? partial : !partial);
      return matchesName && matchesStatus;
    });
  }, [records, query, statusFilter]);

  const total = useMemo(() => records.reduce((sum, record) => sum + Number(record.amount || 0), 0), [records]);
  const partialCount = useMemo(() => records.filter((record) => Number(record.amount) < EXPECTED_AMOUNT).length, [records]);

  return (
    <main className="app-shell public-mode">
      <PublicPrintHeader />
      <section className="hero">
        <div className="hero-badge"><Eye size={17} /> Public View</div>
        <h1>Peer-to-Peer Tuition Contribution Register</h1>
        <p>SEM 2-BLK 2 • Cohort 3</p>
        <div className="hero-actions">
          <button className="button light" onClick={() => window.print()}><Printer size={18} /> Print / Save PDF</button>
          <a className="button outline" href="#admin"><Lock size={18} /> Admin Login</a>
        </div>
      </section>

      <ConfigNotice />

      <section className="stats-grid screen-only">
        <StatCard icon={Users} label="Total contributors" value={records.length} />
        <StatCard icon={WalletCards} label="Total amount" value={money(total)} tone="green" />
        <StatCard icon={AlertTriangle} label="Partial payments" value={partialCount} tone="amber" />
        <StatCard icon={RefreshCw} label="Latest update" value={updatedAt ? shortDate(updatedAt) : "Live"} tone="blue" />
      </section>

      <section className="control-panel screen-only">
        <div className="search-wrap">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type your name to search quickly..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All payments</option>
          <option value="full">Full payments only</option>
          <option value="partial">Partial payments only</option>
        </select>
      </section>

      <section className="public-message screen-only">
        <CheckCircle2 size={21} />
        <p>Thank you for joining Peer-to-Peer Tuition. Search for your name and keep a copy as proof of your contribution.</p>
      </section>

      <div className="screen-only"><ContactStrip /></div>

      {loading ? <div className="loader">Loading live records...</div> : <ContributionTable records={filtered} adminMode={false} />}

      <section className="print-footer-only">
        <p>For any inquiries, contact any of the facilitators above.</p>
      </section>
    </main>
  );
}

function LoginPanel({ session, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function login(e) {
    e.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not connected yet. Configure .env.local first.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage(error.message);
  }

  if (session) {
    return (
      <div className="login-card signed-in">
        <div>
          <b>Signed in as:</b><br />
          <span>{session.user.email}</span>
        </div>
        <button className="button danger" onClick={onLogout}><LogOut size={18} /> Logout</button>
      </div>
    );
  }

  return (
    <form className="login-card" onSubmit={login}>
      <h2><Lock size={22} /> Facilitator Login</h2>
      <p>Only authorised facilitators can add, edit, or delete contribution records.</p>
      <label>Email address</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required />
      <label>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
      {message && <div className="form-error">{message}</div>}
      <button className="button primary" disabled={busy}>{busy ? "Signing in..." : "Login to Admin Dashboard"}</button>
    </form>
  );
}

function AdminDashboard({ records, loading, session, refreshRecords }) {
  const emptyForm = { id: "", serial_number: "", name: "", amount: EXPECTED_AMOUNT, reason: "" };
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const lastPayer = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.paid_at || b.created_at || 0) - new Date(a.paid_at || a.created_at || 0))[0] || null;
  }, [records]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return records.filter((record) => !q || normalize(record.name).includes(q));
  }, [records, query]);

  const total = useMemo(() => records.reduce((sum, record) => sum + Number(record.amount || 0), 0), [records]);
  const partialCount = useMemo(() => records.filter((record) => Number(record.amount) < EXPECTED_AMOUNT).length, [records]);
  const nextSerial = useMemo(() => Math.max(0, ...records.map((r) => Number(r.serial_number || 0))) + 1, [records]);
  const editing = Boolean(form.id);
  const partialForm = Number(form.amount || 0) < EXPECTED_AMOUNT;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearForm() {
    setForm(emptyForm);
    setMessage("");
  }

  function startEdit(record) {
    setForm({
      id: record.id,
      serial_number: record.serial_number,
      name: record.name,
      amount: record.amount,
      reason: record.reason || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveRecord(e) {
    e.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not connected yet. This admin dashboard will save live records after setup.");
      return;
    }
    const name = cleanName(form.name);
    const amount = Number(form.amount);
    if (!name) return setMessage("Please enter the contributor name.");
    if (!Number.isFinite(amount) || amount <= 0) return setMessage("Please enter a valid amount.");
    if (amount < EXPECTED_AMOUNT && !form.reason.trim()) return setMessage("Please give the reason for partial payment.");

    setBusy(true);
    setMessage("");

    const payload = {
      name,
      amount,
      reason: amount < EXPECTED_AMOUNT ? form.reason.trim() : "",
      updated_by: session?.user?.email || "admin",
      updated_at: new Date().toISOString(),
    };

    let response;
    if (editing) {
      response = await supabase.from("contributors").update(payload).eq("id", form.id);
    } else {
      response = await supabase.from("contributors").insert({
        id: makeId(),
        serial_number: nextSerial,
        paid_at: new Date().toISOString(),
        ...payload,
      });
    }

    setBusy(false);
    if (response.error) {
      setMessage(response.error.message);
      return;
    }
    clearForm();
    setMessage(editing ? "Contributor updated successfully." : "New contribution saved successfully. Public view has been updated live.");
    refreshRecords();
  }

  async function deleteRecord(record) {
    const ok = confirm(`Delete ${record.name}? This cannot be undone.`);
    if (!ok) return;
    if (!supabase) return setMessage("Supabase is not connected yet.");
    const { error } = await supabase.from("contributors").delete().eq("id", record.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Contributor deleted successfully. Public view has been updated live.");
      refreshRecords();
    }
  }

  return (
    <div className="admin-dashboard">
      <section className="stats-grid admin-stats">
        <StatCard icon={Users} label="Contributors" value={records.length} />
        <StatCard icon={WalletCards} label="Total amount" value={money(total)} tone="green" />
        <StatCard icon={AlertTriangle} label="Partial payments" value={partialCount} tone="amber" />
        <StatCard icon={Database} label="Live database" value={isSupabaseConfigured ? "Connected" : "Demo"} tone="blue" />
      </section>

      <section className="last-payer-card">
        <div>
          <span>Last person who paid</span>
          <h2>{lastPayer ? lastPayer.name : "No contributor yet"}</h2>
          <p>{lastPayer ? `${money(lastPayer.amount)} • ${shortDate(lastPayer.paid_at || lastPayer.created_at)}` : "Add the first contribution below."}</p>
        </div>
        <CheckCircle2 size={34} />
      </section>

      <section className="admin-form-card">
        <h2>{editing ? "Edit Contributor" : "Add Contributor"}</h2>
        <form onSubmit={saveRecord}>
          <div className="form-grid">
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Type contributor name" />
            </div>
            <div>
              <label>Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} placeholder="100" />
            </div>
          </div>
          {partialForm && (
            <div className="reason-input">
              <label>Reason for paying less than GH₵100</label>
              <textarea value={form.reason} onChange={(e) => updateField("reason", e.target.value)} placeholder="Example: Partial payment" />
            </div>
          )}
          {message && <div className={message.toLowerCase().includes("success") || message.toLowerCase().includes("saved") || message.toLowerCase().includes("updated") || message.toLowerCase().includes("deleted") ? "form-success" : "form-error"}>{message}</div>}
          <div className="form-actions">
            <button className="button primary" disabled={busy}><Plus size={18} /> {busy ? "Saving..." : editing ? "Save Changes" : "Save Contribution"}</button>
            <button type="button" className="button ghost" onClick={clearForm}>Clear / Cancel</button>
          </div>
        </form>
      </section>

      <section className="control-panel admin-controls screen-only">
        <div className="search-wrap">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contributor by name..." />
        </div>
        <button className="button outline" onClick={refreshRecords}><RefreshCw size={18} /> Refresh</button>
        <button className="button outline" onClick={() => downloadCSV(records)}><Download size={18} /> Export CSV</button>
        <button className="button light" onClick={() => window.print()}><Printer size={18} /> Print Admin Report</button>
      </section>

      {loading ? <div className="loader">Loading live records...</div> : <ContributionTable records={filtered} adminMode onEdit={startEdit} onDelete={deleteRecord} />}
    </div>
  );
}

function AdminView({ records, loading, refreshRecords, session, setSession }) {
  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <main className="app-shell admin-mode">
      <section className="hero admin-hero">
        <div className="hero-badge"><Lock size={17} /> Private Admin Dashboard</div>
        <h1>Peer-to-Peer Tuition Contribution Management</h1>
        <p>Add once. The public link updates automatically for everyone.</p>
        <div className="hero-actions">
          <a className="button light" href="#"><Eye size={18} /> Public View</a>
          {session && <button className="button danger" onClick={logout}><LogOut size={18} /> Logout</button>}
        </div>
      </section>

      <ConfigNotice />
      <LoginPanel session={session} onLogout={logout} />
      {session && <AdminDashboard records={records} loading={loading} session={session} refreshRecords={refreshRecords} />}
    </main>
  );
}

export default function App() {
  const [records, setRecords] = useState(DEMO_RECORDS);
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured));
  const [session, setSession] = useState(null);
  const [route, setRoute] = useState(window.location.hash === "#admin" ? "admin" : "public");

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => Number(a.serial_number || 0) - Number(b.serial_number || 0));
  }, [records]);

  const updatedAt = useMemo(() => {
    return sortedRecords.reduce((latest, record) => {
      const value = new Date(record.updated_at || record.paid_at || record.created_at || 0).getTime();
      return value > latest ? value : latest;
    }, 0);
  }, [sortedRecords]);

  async function fetchRecords() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("contributors")
      .select("*")
      .order("serial_number", { ascending: true });
    if (!error && data) setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    const handler = () => setRoute(window.location.hash === "#admin" ? "admin" : "public");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    fetchRecords();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    const channel = supabase
      .channel("contributors-live-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "contributors" }, fetchRecords)
      .subscribe();
    return () => {
      authListener?.subscription?.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return route === "admin" ? (
    <AdminView records={sortedRecords} loading={loading} refreshRecords={fetchRecords} session={session} setSession={setSession} />
  ) : (
    <PublicView records={sortedRecords} loading={loading} updatedAt={updatedAt} />
  );
}
