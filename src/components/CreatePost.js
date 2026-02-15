import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function CreatePost() {
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!destination || !travelDate || !gender) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "travelPosts"), {
        destination,
        travelDate,
        gender,
        createdAt: serverTimestamp()
      });

      alert("Post created successfully!");

      setDestination("");
      setTravelDate("");
      setGender("");
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  return (
    <div>
      <h2>Create Travel Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <br /><br />

        <input
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
        />
        <br /><br />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
        <br /><br />

        <button type="submit">Post Travel Plan</button>
      </form>
    </div>
  );
}

export default CreatePost;
