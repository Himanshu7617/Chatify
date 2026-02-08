import BigBoard from "../assets/BigBoard.png";
import SmallBoard from "../assets/SmallBoard.png";
import rock from "../assets/rock.png";

export default function ChatRetroBoard({ userGuestName, setUserGuestName }) {
  return (
    <div className="absolute w-full max-w-[520px] mx-auto">
      
      {/* SVG COMPOSITION */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Big Board */}
        <image
          href={BigBoard}
          x="260"
          y="60"
          width="360"
          transform="rotate(6 260 60)"
        />

        {/* Text */}
        <text
          x="410"
          y="135"
          fill="#92400e"
          fontSize="32"
          textAnchor="middle"
          transform="rotate(6 410 135)"
          className="font-pixel"
        >
          CHATRETRO
        </text>

        <text
          x="410"
          y="175"
          fill="#92400e"
          fontSize="32"
          textAnchor="middle"
          transform="rotate(6 410 175)"
          className="font-pixel"
        >
          LET&apos;S CHAT
        </text>

        {/* Small Board */}
        <image
          href={SmallBoard}
          x="80"
          y="260"
          width="260"
          transform="rotate(-12 80 260)"
        />

        {/* Rock */}
        <image
          href={rock}
          x="260"
          y="550"
          width="200"
        />
      </svg>

      {/* INPUT OVERLAY */}
      <input
        value={userGuestName}
        onChange={(e) => setUserGuestName(e.target.value)}
        placeholder="Guest Name"
        className="
          absolute
          left-[18%]
          top-[45%]
          w-[32%]
          h-[12%]
          rotate-[-12deg]
          bg-transparent
          font-pixel
          text-amber-800
          md:text-3xl
          outline-none
          ring-0
        "
      />
    </div>
  );
}
