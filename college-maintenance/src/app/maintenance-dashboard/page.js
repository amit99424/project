"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Badge UI component
const Badge = ({ tone = "gray", children }) => {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
    <div className="text-3xl">{icon}</div>
  </div>
);

const Topbar = ({ user }) => {
  const router = useRouter();
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };
  return (
    <div className="w-full bg-white shadow-sm px-5 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">Maintenance Dashboard</h1>
        <p className="text-xs text-gray-500">
          Graphic Era Hill University, Bhimtal
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.email?.split("@")[0]}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg"
        >
          <span>↩</span> Logout
        </button>
      </div>
    </div>
  );
};

// ---------------- Main Component ----------------
export default function MaintenanceDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setComplaints(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchSearch =
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "All" || c.status === filterStatus;

    const matchPriority =
      filterPriority === "All" ||
      (filterPriority === "High" && c.priority === "High Priority") ||
      (filterPriority === "Medium" && c.priority === "Medium Priority") ||
      (filterPriority === "Low" && c.priority === "Low Priority");

    const matchCategory =
      filterCategory === "All" || c.category === filterCategory;

    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  // Stats
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar user={user} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Filters</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search complaints..."
              className="border rounded px-3 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2 w-full"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Library">Library</option>
              <option value="Classroom">Classroom</option>
              <option value="Electrical">Electrical</option>
            </select>
            <select
              className="border rounded px-3 py-2 w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              className="border rounded px-3 py-2 w-full"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Complaints" value={total} icon="⚙️" />
          <StatCard title="Pending" value={pending} icon="⏰" />
          <StatCard title="In Progress" value={inProgress} icon="🔧" />
          <StatCard title="Resolved" value={resolved} icon="✅" />
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-2">
            All Complaints ({filteredComplaints.length})
          </h2>
          <div className="space-y-4 mt-4">
            {filteredComplaints.map((c) => {
              const createdAt = c.createdAt?.toDate ? c.createdAt.toDate() : null;
              return (
                <div
                  key={c.id}
                  className="border rounded-lg px-4 py-4 shadow-sm"
                >
                  {/* Title + Badges */}
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">{c.subject}</p>
                    <div className="flex items-center gap-2">
                      {c.priority === "High Priority" && <Badge tone="red">High</Badge>}
                      {c.priority === "Medium Priority" && <Badge tone="yellow">Medium</Badge>}
                      {c.priority === "Low Priority" && <Badge tone="green">Low</Badge>}
                      {c.status === "Pending" && <Badge tone="orange">Pending</Badge>}
                      {c.status === "In Progress" && <Badge tone="blue">In Progress</Badge>}
                      {c.status === "Resolved" && <Badge tone="green">Resolved</Badge>}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mt-2">{c.description}</p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                    <span>👤 {c.name}</span>
                    <span>📍 {c.property}</span>
                    {createdAt && (
                      <span>
                        📅 {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* Assigned Info */}
                  {c.assignedTo && (
                    <p className="text-xs text-indigo-600 mt-2">
                      Assigned to: {c.assignedTo}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-3">
                    <button
                      className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
                      onClick={() => setSelectedComplaint({ ...c, mode: "view" })}
                    >
                      👁 View
                    </button>
                    <button
                      className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
                      onClick={() => setSelectedComplaint({ ...c, mode: "update" })}
                    >
                      ✏️ Update
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredComplaints.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-6">
                No complaints match your filters.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-2">
              {selectedComplaint.mode === "view"
                ? "Complaint Details"
                : "Update Complaint"}
            </h2>

            {selectedComplaint.mode === "view" ? (
              <div>
                <p><strong>Subject:</strong> {selectedComplaint.subject}</p>
                <p><strong>Description:</strong> {selectedComplaint.description}</p>
                <p><strong>Status:</strong> {selectedComplaint.status}</p>
                <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-1">Update Status:</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  defaultValue={selectedComplaint.status}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded">
                  Save
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedComplaint(null)}
              className="mt-4 w-full border py-2 rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
