// errands/components/CreateErrand.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { IoAdd, IoClose } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import "../styles/create.css"
export default function CreateErrand() {
  const [showModal, setShowModal] = useState(false);
  const [taskType, setTaskType] = useState("Canteen");
  const [items, setItems] = useState([{ name: "", quantity: 1 }]);
  const [shopNote, setShopNote] = useState("");

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const calculateTotalItems = () => {
    return items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    // Validate items
    const validItems = items.filter(item => item.name.trim() !== "" && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // Create order summary
    const orderSummary = validItems
      .map(item => `${item.name} (x${item.quantity})`)
      .join(", ");

    const description = orderSummary + (shopNote ? `\nNote: ${shopNote}` : "");

    try {
      await addDoc(collection(db, "tasks"), {
        type: taskType,
        description,
        items: validItems, // Store items array for future use
        totalItems: calculateTotalItems(),
        shopNote: shopNote || "",
        requesterId: auth.currentUser.uid,
        requesterName: auth.currentUser.displayName || "Hosteller",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Reset form
      setItems([{ name: "", quantity: 1 }]);
      setShopNote("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Could not post 😵");
    }
  };

  return (
    <>
      <button className="fab-button" onClick={() => setShowModal(true)}>
        <IoAdd />
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 style={{ color: "var(--text-main)", margin: 0 }}>
                Create Errand
              </h2>
              <button className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <IoClose />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Shop Selection */}
              <div className="input-group">
                <label className="input-label">Select Shop</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="modal-select"
                  style={{ padding: "12px" }}
                  required
                >
                  <option value="Canteen">Canteen 🍔</option>
                  <option value="Pharmacy">Pharmacy 💊</option>
                  <option value="Xerox Shop">Xerox Shop 📄</option>
                  <option value="Stationary">Stationary 📚</option>
                </select>
              </div>

              {/* Order Items */}
              <div className="input-group">
                <label className="input-label">Order Items</label>
                {items.map((item, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    gap: "10px", 
                    marginBottom: "10px",
                    alignItems: "center"
                  }}>
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      className="custom-search-input"
                      style={{ flex: 2, padding: "10px" }}
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                      className="custom-search-input"
                      style={{ flex: 1, padding: "10px" }}
                      required
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddItem}
                >
                  + Add Another Item
                </button>
              </div>

              {/* Total Items Display */}
              <div>
                <strong>Total Items: {calculateTotalItems()}</strong>
                <br />
                <small style={{ color: "var(--text-secondary)" }}>
                  You'll earn {calculateTotalItems() * 10} credits if someone accepts
                </small>
              </div>

              {/* Additional Notes */}
              <div className="input-group">
                <label className="input-label">Additional Notes (Optional)</label>
                <textarea
                  className="custom-search-input"
                  placeholder="Any specific instructions? (e.g., 'Extra spicy', 'Brand name', etc.)"
                  value={shopNote}
                  onChange={(e) => setShopNote(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" className="action-btn">
                  Post Request (Earn {calculateTotalItems() * 10} Credits)
                </button>
                <button 
                  type="button" 
                  className="action-btn secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}