"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [error, setError] = useState(null); // ✅ Error state

  useEffect(() => {
    try {
      const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const complaintsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComplaints(complaintsData);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore Error:", err);
          setError("Failed to fetch complaints.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError("Something went wrong while fetching complaints.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-gray-600 text-lg">Loading your complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          📋 My Complaints
        </h1>

        {complaints.length === 0 ? (
          <p className="text-center text-gray-500">
            No complaints submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {complaint.subject}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      complaint.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </div>

                {/* Details */}
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong> {complaint.category}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Property:</strong> {complaint.property} |{" "}
                  <strong>Location:</strong> {complaint.location}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Priority:</strong> {complaint.priority}
                </p>
                <p className="text-gray-700 mb-4">{complaint.description}</p>

                {/* Files */}
                {complaint.fileUrls && complaint.fileUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {complaint.fileUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={url}
                          alt="Complaint File"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
