"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  // Fetch complaints
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

  // Update status
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

  const filteredComplaints = complaints.filter((c) => c.status === filter);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        🛠 Maintenance Dashboard
      </h1>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setFilter("pending")}
          className={`px-6 py-2 rounded-xl shadow-md font-medium transition ${
            filter === "pending"
              ? "bg-indigo-600 text-white"
              : "bg-white border hover:bg-indigo-50"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-6 py-2 rounded-xl shadow-md font-medium transition ${
            filter === "completed"
              ? "bg-green-600 text-white"
              : "bg-white border hover:bg-green-50"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Complaints Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">
            No complaints found 🚫
          </p>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="rounded-2xl shadow-lg bg-white hover:shadow-xl transition"
            >
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {complaint.title}
                </h2>
                <p className="text-gray-600">{complaint.description}</p>

                <p className="mt-3 text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`${
                      complaint.status === "pending"
                        ? "text-red-500 font-semibold"
                        : "text-green-600 font-semibold"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </p>

                {complaint.imageBase64 && (
                  <img
                    src={complaint.imageBase64}
                    alt="Complaint"
                    className="w-full h-40 object-cover rounded-lg mt-3"
                  />
                )}

                <div className="mt-4 flex justify-between">
                  {complaint.status === "pending" ? (
                    <button
                      onClick={() => updateStatus(complaint.id, "completed")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                    >
                      Mark Completed ✅
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(complaint.id, "pending")}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                    >
                      Mark Pending ⏳
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
