"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function MaintenanceDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "complaints"));
        const complaintList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintList);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter((c) => c.status === "in-progress").length;
  const resolved = complaints.filter((c) => c.status === "completed").length;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Maintenance Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Graphic Era Hill University, Bhimtal
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">Chirag Goswami</p>
            <p className="text-sm text-gray-500">chiraguniversity@edu</p>
          </div>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-gray-100 rounded-full w-fit mx-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-2 rounded-l-full font-medium ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white"
              : "text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2 rounded-r-full font-medium ${
            activeTab === "all"
              ? "bg-indigo-600 text-white"
              : "text-gray-700"
          }`}
        >
          All Complaints
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Complaints" value={total} icon="⚙️" />
            <StatCard title="Pending" value={pending} icon="⏳" color="orange" />
            <StatCard
              title="In Progress"
              value={inProgress}
              icon="🔵"
              color="blue"
            />
            <StatCard title="Resolved" value={resolved} icon="✅" color="green" />
          </div>

          {/* Recent Complaints */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Recent Complaints</h2>
            <div className="space-y-4">
              {complaints.slice(0, 3).map((c) => (
                <ComplaintItem key={c.id} complaint={c} compact />
              ))}
            </div>
          </div>
        </>
      )}

      {/* All Complaints Tab */}
      {activeTab === "all" && (
        <div className="bg-white shadow rounded-lg p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Search complaints..."
              className="p-2 border rounded-lg flex-1"
            />
            <select className="p-2 border rounded-lg">
              <option>All Categories</option>
            </select>
            <select className="p-2 border rounded-lg">
              <option>All Status</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select className="p-2 border rounded-lg">
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.map((c) => (
              <ComplaintItem
                key={c.id}
                complaint={c}
                updateStatus={updateStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Stats Card */
function StatCard({ title, value, icon, color }) {
  const colors = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    green: "text-green-600",
    gray: "text-gray-700",
  };
  return (
    <div className="p-6 bg-white shadow rounded-lg text-center">
      <p className="text-gray-500 flex items-center justify-center gap-2">
        <span>{icon}</span> {title}
      </p>
      <h2 className={`text-2xl font-bold ${colors[color] || colors.gray}`}>
        {value}
      </h2>
    </div>
  );
}

/* Complaint Item */
function ComplaintItem({ complaint, compact, updateStatus }) {
  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <p className="font-medium">{complaint.title}</p>
        {!compact && (
          <p className="text-sm text-gray-500">{complaint.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {complaint.location || "Main Building"} •{" "}
          {complaint.date || "Jan 15, 2024, 04:00 PM"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Priority Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            complaint.priority === "high"
              ? "bg-red-100 text-red-600"
              : complaint.priority === "medium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {complaint.priority || "Medium"}
        </span>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            complaint.status === "pending"
              ? "bg-orange-100 text-orange-700"
              : complaint.status === "in-progress"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {complaint.status}
        </span>

        {/* Action Buttons */}
        {!compact && (
          <>
            <button className="px-4 py-1 bg-gray-100 rounded hover:bg-gray-200">
              View
            </button>
            <button
              onClick={() =>
                updateStatus &&
                updateStatus(
                  complaint.id,
                  complaint.status === "pending"
                    ? "in-progress"
                    : complaint.status === "in-progress"
                    ? "completed"
                    : "pending"
                )
              }
              className="px-4 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Update
            </button>
          </>
        )}
      </div>
    </div>
  );
}// this is comment

