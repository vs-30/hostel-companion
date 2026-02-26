
import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom"
import { db } from "./firebase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot} from "firebase/firestore";
import { MdBatteryChargingFull } from 'react-icons/md';
import BookingModal from "./BookingModal";
import "./styles/seatStyle.css";

const LibraryMap = () => {
  const [firebaseSeats, setFirebaseSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();


useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentStudentId(user.uid);
      } else {
        setCurrentStudentId(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

useEffect(() => {
  if (authChecked && !currentStudentId) {
    navigate("/login");
  }
}, [authChecked, currentStudentId, navigate]);
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "seatBookings"), (snapshot) => {
    const data = {};
    const now = Date.now(); // Get fresh time on every DB change

    snapshot.forEach((docSnap) => {
      const booking = docSnap.data();
      // Keep only future or currently active bookings
      if (booking.to > now) {
        if (!data[booking.seatId]) {
          data[booking.seatId] = { bookings: [] };
        }
        data[booking.seatId].bookings.push(booking);
      }
    });
    setFirebaseSeats(data);
  });
  return () => unsubscribe();
}, []);

  

  const getSeatStatus = (id) => {
  const data = firebaseSeats[id];

  if (!data || !data.bookings) {
    return { id, status: "free", bookings: [] };
  }

  const now = Date.now();

  const activeBooking = data.bookings.find(
    (b) => now >= b.from && now <= b.to
  );

  if (!activeBooking) {
    return { id, status: "free", bookings: data.bookings };
  }

  return {
    id,
    status: activeBooking.studentId === currentStudentId
      ? "mine"
      : "booked",
    bookings: data.bookings
  };
};

  // Helper to render seats for benches/tables
  const renderSeat = (id) => {
  const seatData = getSeatStatus(id);

  return (
    <div
      key={id}
      className={`seat square-seat ${seatData.status}`}
      onClick={() => setSelectedSeat(seatData)}
    />
  );
};

  // Component for a bench with seats on both sides
  const StudyBench = ({ benchId }) => (
    <div className="bench-unit">
      <div className="seat-row-side">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-T${s}`))}</div>
      <div className="bench-surface">{<MdBatteryChargingFull size={20}/>}</div>
      <div className="seat-row-side">{[5, 6, 7, 8].map(s => renderSeat(`${benchId}-B${s}`))}</div>
    </div>
  );
  const StudyBenchFlipped = ({ benchId }) => (
    <div className="bench-unit-flipped">
      <div className="seat-side-flipped">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-T${s}`))}</div>
      <div className="bench-surface-flipped">{<MdBatteryChargingFull size={20}/>}</div>
      <div className="seat-side-flipped">{[5, 6, 7, 8].map(s => renderSeat(`${benchId}-B${s}`))}</div>
    </div>
  );
  const RHStudyBench = ({ benchId }) => (
    <div className="bench-unit-flipped">
      <div className="seat-side-flipped">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-T${s}`))}</div>
      <div className="bench-surface-flipped"></div>
      <div className="seat-side-flipped">{[5, 6, 7, 8].map(s => renderSeat(`${benchId}-B${s}`))}</div>
    </div>
  );
  const WindowBench = ({ benchId }) => (
    <div className="bench-unit">
      <div className="bench-surface">{<MdBatteryChargingFull size={20}/>}</div>
      <div className="seat-row-side">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-S${s}`))}</div>
    </div>
  );
  const WindowBenchFlippedRight = ({ benchId }) => (
    <div className="bench-unit-flipped">
      <div className="seat-side-flipped">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-S${s}`))}</div>
      <div className="bench-surface-flipped">{<MdBatteryChargingFull size={20}/>}</div>
    </div>
  );
  const WindowBenchFlippedLeft= ({ benchId}) => (
    <div className="bench-unit-flipped">
      <div className="bench-surface-flipped">{<MdBatteryChargingFull size={20}/>}</div>
      <div className="seat-side-flipped">{[1, 2, 3, 4].map(s => renderSeat(`${benchId}-S${s}`))}</div>
    </div>
  );
  const RoundTable = ({ tableId }) => (
    <div className="round-table-cluster">
      <div className="table-center"><MdBatteryChargingFull size={20}/></div> 
      {[...Array(6)].map((_, i) => (
        <div key={i} className="round-seat-wrapper" style={{ transform: `rotate(${i * 60}deg) translateY(-40px)` }}>
          {renderSeat(`${tableId}-S${i+1}`)}  
        </div>
      ))}
    </div>
  );
  const renderZoneLayout = () => {
  if (!selectedZone) return null;

  return (
    <div className="zone-modal-overlay">
      <div className="zone-modal">

        <h3 className="zone-title">
          {selectedZone === "private" ? "Private Room Layout" : "VR Zone Layout"}
        </h3>

        <div className="zone-layout-content">

          {/* PRIVATE ROOM LAYOUT */}
          {selectedZone === "private" && (
            <div className="private-layout">
              {[1,2,3].map(row => (
                <div key={row} className="private-row">
                  <StudyBench benchId={`F${currentFloor}-PR${row*2-1}`} />
                  <StudyBench benchId={`F${currentFloor}-PR${row*2}`} />
                </div>
              ))}
            </div>
          )}

          {/* VR ZONE LAYOUT */}
          {selectedZone === "vr" && (
            <div className="vr-layout">
              {[...Array(6)].map((_, rowIndex) => (
                <div key={rowIndex} className="vr-row">
                  {[...Array(5)].map((_, colIndex) =>
                    renderSeat(`F${currentFloor}-VR${rowIndex*5 + colIndex + 1}`)
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        <button
          className="close-zone-btn"
          onClick={() => setSelectedZone(null)}
        >
          Close
        </button>

      </div>
    </div>
  );
};
  const renderGroundFloor = () => (
    <div className="library-wrapper">
      {/* L1: MAIN TOP SECTION */}
      <div className="l1">
        
        {/* L1.1: PRIVATE ROOM */}
        <div className="l1-1" onClick={() => setSelectedZone("private")}>
          <div className="zone-label">PRIVATE ROOM</div>
        </div>

        {/* L1.2: CENTER AREA (REDESIGNED) */}
        <div className="sub-section l1-2">
          {/* L1.2.1: WINDOW ZONE */}
          <div className="l1-2-1">
            <WindowBench benchId={`F${currentFloor}-WTB1`} />
            <WindowBench benchId={`F${currentFloor}-WTB2`} />
            <WindowBench benchId={`F${currentFloor}-WTB3`} />
          </div>

          {/* L1.2.2: NESTED CENTER (DIVIDED VERTICALLY INTO 3) */}
          <div className="l1-2-2-container">
            
            {/* L1.2.2.1: ROUND TABLE ZONE */}
            <div className="l1-2-2-1">
              <RoundTable tableId={`F${currentFloor}-RT1`} />
              <RoundTable tableId={`F${currentFloor}-RT2`} />
              <RoundTable tableId={`F${currentFloor}-RT3`} />
              <RoundTable tableId={`F${currentFloor}-RT4`} />
            </div>

            {/* L1.2.2.2: SOFA & STAIRS (DIVIDED HORIZONTALLY) */}
            <div className="l1-2-2-2">
              <div className="sofa">
                <div className="sofa-label">sofa area</div>
              </div>
              <div className="inside-stairs">
                <div className="stair-block"></div>
                <div className="stair-block"></div>
              </div>
            </div>

            {/* L1.2.2.3: VERTICAL BENCHES */}
            <div className="l1-2-2-3">
                <StudyBenchFlipped benchId={`F${currentFloor}-B1`} />
                <StudyBenchFlipped benchId={`F${currentFloor}-B2`} />
            </div>
          </div>
        </div>

        {/* L1.3: VR ZONE & SIDE BENCHES */}
        <div className="l1-3">
          <div className="l1-3-1">
            <div className="vr-block" onClick={() => setSelectedZone("vr")}> 
              <div className="zone-label">VR ZONE</div>
            </div>
          </div>
          <div className="l1-3-2">
            <StudyBench benchId={`F${currentFloor}-B3`} />
          </div>
        </div>
      </div>

      {/* L2: BOTTOM STORAGE */}
      <div className="l2">
          <div className="stair-block"></div>
          <div className="stair-block"></div>
      </div>

    </div>
  
);

const renderUpperFloor = () => (
  <div className="library-wrapper">
      {/* L1: MAIN TOP SECTION */}
      <div className="l1">
        <div className="upper-l1-1">
          <div className="upper-left-window">
            <WindowBenchFlippedLeft benchId={`F${currentFloor}-WLB1`} label="wb1"/>
            <WindowBenchFlippedLeft benchId={`F${currentFloor}-WLB2`} label="wb2"/>
            <WindowBenchFlippedLeft benchId={`F${currentFloor}-WLB3`} label="wb3"/>
          </div>
          <div className="book-shelfs">
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
          </div>
          
        </div>

        {/* L1.2: CENTER AREA (REDESIGNED) */}
        <div className="sub-section l1-2">
          {/* L1.2.1: WINDOW ZONE */}
          <div className="l1-2-1">
            <WindowBench benchId={`F${currentFloor}-B4`} />
            <WindowBench benchId={`F${currentFloor}-B5`} />
            <WindowBench benchId={`F${currentFloor}-B6`} />
          </div>

          {/* L1.2.2: NESTED CENTER (DIVIDED VERTICALLY INTO 3) */}
          <div className="l1-2-2-container">
            
            {/* L1.2.2.1: ROUND TABLE ZONE */}
            <div className="l1-2-2-1">
              <StudyBenchFlipped benchId={`F${currentFloor}-LSB1`} label="LSB1" />
              <StudyBenchFlipped benchId={`F${currentFloor}-LSB2`} label="LSB2" />
              <StudyBenchFlipped benchId={`F${currentFloor}-LSB3`} label="LSB3" />
              <StudyBenchFlipped benchId={`F${currentFloor}-LSB4`} label="LSB4" />
            </div>

            {/* L1.2.2.2: SOFA & STAIRS (DIVIDED HORIZONTALLY) */}
            <div className="l1-2-2-2">
              <div className="above-stairs">
                <StudyBench benchId={`F${currentFloor}-SB1`} label="SB1" />
              </div>
              <div className="inside-stairs">
                <div className="stair-block"></div>
                <div className="stair-block"></div>
              </div>
            </div>

            {/* L1.2.2.3: VERTICAL BENCHES */}
            <div className="col-nest l1-2-2-3">
                <StudyBenchFlipped benchId={`F${currentFloor}-VB1`} label="B1" />
                <StudyBenchFlipped benchId={`F${currentFloor}-VB2`} label="B2" />
            </div>
          </div>
        </div>

        {/* L1.3: VR ZONE & SIDE BENCHES */}
        <div className="upper-l1-3">
          <div className="book-shelfs">
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
            <div className="book-shelf"></div>
          </div>
          <div className="upper-right-window">
            <WindowBenchFlippedRight benchId={`F${currentFloor}-WU1`} label="wb1"/>
            <WindowBenchFlippedRight benchId={`F${currentFloor}-WU2`} label="wb2"/>
            <WindowBenchFlippedRight benchId={`F${currentFloor}-WU3`} label="wb3"/>
            
          </div>
        </div>
      </div>

      {/* L2: BOTTOM STORAGE */}
      <div className="l2">
          <div className="stair-block"></div>
          <RHStudyBench benchId={`F${currentFloor}-RB1`}/>
          <RHStudyBench benchId={`F${currentFloor}-RB2`} />
          <RHStudyBench benchId={`F${currentFloor}-RB3`} />
          <RHStudyBench benchId={`F${currentFloor}-RB4`} />
          <RHStudyBench benchId={`F${currentFloor}-RB5`} />
          <div className="stair-block"></div>
      </div>
    </div>
);

  return (
  <div className="library-container">
    {/* FLOOR SELECTOR - Centered and Styled */}
    <div className="floor-selector">
      <button 
        className={currentFloor === 0 ? "active" : ""} 
        onClick={() => setCurrentFloor(0)}
      >
        Ground Floor
      </button>
      <button 
        className={currentFloor === 1 ? "active" : ""} 
        onClick={() => setCurrentFloor(1)}
      >
        First Floor
      </button>
      <button 
        className={currentFloor === 2 ? "active" : ""} 
        onClick={() => setCurrentFloor(2)}
      >
        Second Floor
      </button>
    </div>

    {/* MAP CONTENT */}
    {currentFloor === 0 ? renderGroundFloor() : renderUpperFloor()}

    {/* MODAL */}
    {selectedSeat && (
      <BookingModal
        seat={selectedSeat}
        onClose={() => setSelectedSeat(null)}
        currentStudentId={currentStudentId}
      />
    )}
    {selectedZone && renderZoneLayout()}
  </div>
);
};

export default LibraryMap;