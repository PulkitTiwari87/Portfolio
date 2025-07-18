// src/components/ProfileCard.tsx
import React, { useEffect, useRef, useCallback, useMemo } from "react";

interface ProfileCardProps {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
}

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%)";
const DEFAULT_INNER_GRADIENT = "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)";

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);
const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));
const adjust = (val: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
  round(tMin + ((tMax - tMin) * (val - fMin)) / (fMax - fMin));
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  behindGradient = DEFAULT_BEHIND_GRADIENT,
  innerGradient = DEFAULT_INNER_GRADIENT,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  miniAvatarUrl,
  name = "Javi A. Torres",
  title = "Software Engineer",
  handle = "javicodes",
  status = "Online",
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;
    let rafId: number | null = null;

    const updateCardTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const w = card.clientWidth;
      const h = card.clientHeight;
      const percentX = clamp((100 / w) * offsetX);
      const percentY = clamp((100 / h) * offsetY);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${
          clamp(Math.hypot(percentY - 50, percentX - 50) / 50)
        }`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };

      Object.entries(properties).forEach(([prop, val]) =>
        wrap.style.setProperty(prop, val)
      );
    };

    const createSmoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const eased = easeInOutCubic(progress);

        const currentX = adjust(eased, 0, 1, startX, targetX);
        const currentY = adjust(eased, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, card, wrap);
        if (progress < 1) rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  }, [enableTilt]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!cardRef.current || !wrapRef.current || !animationHandlers) return;
      const rect = cardRef.current.getBoundingClientRect();
      animationHandlers.updateCardTransform(
        e.clientX - rect.left,
        e.clientY - rect.top,
        cardRef.current,
        wrapRef.current
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    cardRef.current?.classList.add("active");
    wrapRef.current?.classList.add("active");
    animationHandlers?.cancelAnimation();
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (e: PointerEvent) => {
      if (!cardRef.current || !wrapRef.current || !animationHandlers) return;
      animationHandlers.createSmoothAnimation(
        600,
        e.offsetX,
        e.offsetY,
        cardRef.current,
        wrapRef.current
      );
      cardRef.current.classList.remove("active");
      wrapRef.current.classList.remove("active");
    },
    [animationHandlers]
  );

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;
    const card = cardRef.current!;
    const wrap = wrapRef.current!;

    card.addEventListener("pointerenter", handlePointerEnter);
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", handlePointerLeave);

    const initialX = wrap.clientWidth - 70;
    const initialY = 60;

    animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
    animationHandlers.createSmoothAnimation(1500, initialX, initialY, card, wrap);

    return () => {
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
      animationHandlers.cancelAnimation();
    };
  }, [animationHandlers, handlePointerEnter, handlePointerMove, handlePointerLeave]);

  const cardStyle: React.CSSProperties = {
    backgroundImage: behindGradient,
    backgroundSize: "cover",
    backgroundPosition: "center",
    "--icon": iconUrl ? `url(${iconUrl})` : "none",
    "--grain": grainUrl ? `url(${grainUrl})` : "none",
    "--behind-gradient": showBehindGradient ? behindGradient : "none",
    "--inner-gradient": innerGradient,
  } as React.CSSProperties;

  return (
    <div
      ref={wrapRef}
      className={`relative [perspective:1000px] transition-all duration-500 ${className}`}
      style={cardStyle}
    >
      <div
        ref={cardRef}
        className="relative w-[300px] h-[400px] rounded-[40px] overflow-hidden bg-black shadow-xl"
        style={{
                transform: `rotateX(var(--rotate-y)) rotateY(var(--rotate-x))`
            }}
      >
        {/* Avatar */}
        <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-full object-cover rounded-b-[30px] max-h-[400px]"
          />
        </div>

        {/* User Info */}
        {showUserInfo && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <img
                src={miniAvatarUrl || avatarUrl}
                className="w-10 h-10 rounded-full border border-white/30 object-cover"
              />
              <div className="text-white text-sm">
                <div className="font-semibold">@{handle}</div>
                <div className="text-xs text-white/70">{status}</div>
              </div>
            </div>
            <button
              onClick={onContactClick}
              className="bg-white/20 px-3 py-1 rounded-lg text-xs text-white hover:bg-white/40 transition-all"
            >
              {contactText}
            </button>
          </div>
        )}

        {/* Name & Title */}
        <div className="absolute top-5 left-0 right-0 flex flex-col items-center text-center z-10">
          <h3 className="text-white text-xl font-bold bg-gradient-to-b from-white to-indigo-300 bg-clip-text text-transparent">
            {name}
          </h3>
          <p className="text-white text-sm -mt-1 bg-gradient-to-b from-white to-indigo-500 bg-clip-text text-transparent">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileCard);
