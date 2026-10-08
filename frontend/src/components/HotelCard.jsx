import { useNavigate } from "react-router-dom";

function HotelCard({ hotel, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/hotel/${hotel.id}`)}
      style={{
        width: "90%",
        maxWidth: "800px",
        height: "220px",
        margin: "0 auto 22px",
        display: "flex",
        flexDirection: "row",
        background: "#fffdf9",
        border: "1px solid #e5d8ca",
        borderRadius: "14px",
        overflow: "hidden",
        boxSizing: "border-box",
        boxShadow: "0 5px 18px rgba(59, 31, 43, 0.10)",
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}

      <img
        src={`http://localhost:5000${hotel.image}`}
        alt={hotel.title}
        style={{
          width: "260px",
          minWidth: "260px",
          height: "220px",
          objectFit: "cover",
          display: "block",
          flexShrink: 0,
        }}
      />

      {/* DETAILS */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          background: "#fffdf9",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            color: "#3b1f2b",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          {hotel.title}
        </h3>

        <p
          style={{
            margin: "0 0 12px",
            color: "#a06f2c",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          ₹{hotel.price} / night
        </p>

        <p
          style={{
            margin: 0,
            color: "#6f6259",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {hotel.description}
        </p>

        {/* BUTTONS */}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hotel);
            }}
            style={{
              minWidth: "75px",
              padding: "8px 18px",
              borderRadius: "7px",
              border: "1px solid #c59b52",
              background: "#3b1f2b",
              color: "#fffdf9",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(hotel.id);
            }}
            style={{
              minWidth: "75px",
              padding: "8px 18px",
              borderRadius: "7px",
              border: "1px solid #8b4f4f",
              background: "#fffdf9",
              color: "#8b4f4f",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;