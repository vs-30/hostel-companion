import { useState } from "react";
import "../styles/travel.css";

function SearchBar({ setSearch }) {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
    setSearch(e.target.value);
  };

  return (
    <div className="search-wrapper">
    <input
      type="text"
      placeholder="Search destination..."
      value={input}
      onChange={handleChange}
      className="custom-search-input"
    />
    </div>
  );
}

export default SearchBar;
