// complaint-form.js
"use client";
import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ComplaintForm() {
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileData = null;
      if (file) {
        fileData = await toBase64(file);
      }

      await addDoc(collection(db, "complaints"), {
        type,
        priority,
        location,
        landmark,
        description,
        file: fileData,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      alert("✅ Complaint submitted successfully!");
      // reset form
      setType("");
      setPriority("Medium");
      setLocation("");
      setLandmark("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Error adding complaint:", err);
      alert("❌ Failed to submit complaint: " + err.message);
    }

    setLoading(false);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-3">📋 Complaint Details</h2>

      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Complaint type"
        className="w-full mb-2 p-2 border rounded"
        required
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="w-full mb-2 p-2 border rounded"
        required
      />

      <input
        type="text"
        value={landmark}
        onChange={(e) => setLandmark(e.target.value)}
        placeholder="Landmark"
        className="w-full mb-2 p-2 border rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-500 text-white py-2 rounded-xl"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
