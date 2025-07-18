import { forwardRef, useMemo, useRef, useEffect, MutableRefObject, CSSProperties, HTMLAttributes } from "react";
import { motion } from "framer-motion";

// Custom hook for requestAnimationFrame loop
function useAnimationFrame(callback: () => void) {
    useEffect(() => {
        let frameId: number;
        const loop = () => {
            callback();
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [callback]);
}

// Custom hook to track mouse position relative to a container
function useMousePositionRef(containerRef: MutableRefObject<HTMLElement | null>) {
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updatePosition = (clientX: number, clientY: number) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                positionRef.current = { x: clientX - rect.left, y: clientY - rect.top };
            } else {
                // Fallback if containerRef is not yet available, use window coords
                positionRef.current = { x: clientX, y: clientY };
            }
        };

        const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
        const handleTouchMove = (ev: TouchEvent) => {
            if (ev.touches.length > 0) {
                const touch = ev.touches[0];
                updatePosition(touch.clientX, touch.clientY);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [containerRef]); // Dependency on containerRef to re-run effect if it changes (unlikely for a static ref)

    return positionRef;
}

interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement>{
    label: string;
    fromFontVariationSettings: string;
    toFontVariationSettings: string;
    containerRef: MutableRefObject<HTMLElement | null>;
    radius?: number;
    falloff?: "linear" | "exponential" | "gaussian";
    className?: string;
    onClick?: () => void;
    style?: CSSProperties;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
    const {
        label,
        fromFontVariationSettings,
        toFontVariationSettings,
        containerRef,
        radius = 50,
        falloff = "linear",
        className = "",
        onClick,
        style,
        ...restProps
    } = props;

    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    // Use a ref to store interpolated settings to avoid re-renders on every animation frame
    const interpolatedSettingsRef = useRef<string[]>(Array(label.length).fill(fromFontVariationSettings));
    const mousePositionRef = useMousePositionRef(containerRef);
    const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

    // Parse font variation settings once
    const parsedSettings = useMemo(() => {
        const parseSettings = (settingsStr: string) =>
            new Map(
                settingsStr.split(",")
                    .map(s => s.trim())
                    .map(s => {
                        const [name, value] = s.split(" ");
                        return [name.replace(/['"]/g, ""), parseFloat(value)];
                    })
            );

        const fromSettings = parseSettings(fromFontVariationSettings);
        const toSettings = parseSettings(toFontVariationSettings);

        return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
            axis,
            fromValue,
            toValue: toSettings.get(axis) ?? fromValue, // Use fromValue if 'to' axis is not specified
        }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = (distance: number) => {
        const norm = Math.min(Math.max(1 - distance / radius, 0), 1); // Normalized distance (0 to 1)
        switch (falloff) {
            case "exponential": return norm ** 2; // Stronger falloff
            case "gaussian": return Math.exp(-((distance / (radius / 2)) ** 2) / 2); // Bell curve falloff
            case "linear":
            default: return norm; // Linear falloff
        }
    };

    useAnimationFrame(() => {
        // console.log("Animation frame running"); // DEBUG
        if (!containerRef?.current) {
            // console.log("Container ref not available"); // DEBUG
            return;
        }

        const { x, y } = mousePositionRef.current;
        // console.log("Mouse position:", x, y); // DEBUG

        // Optimize: only update if mouse position has changed
        if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
            // console.log("Mouse position unchanged, returning"); // DEBUG
            return;
        }
        lastPositionRef.current = { x, y };

        const containerRect = containerRef.current.getBoundingClientRect();
        // console.log("Container rect:", containerRect); // DEBUG

        letterRefs.current.forEach((letterRef, index) => {
            if (!letterRef) {
                // console.log(`Letter ref ${index} is null`); // DEBUG
                return;
            }

            const rect = letterRef.getBoundingClientRect();
            // Calculate letter center relative to the *container*
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

            const distance = calculateDistance(
                mousePositionRef.current.x,
                mousePositionRef.current.y,
                letterCenterX,
                letterCenterY
            );
            // console.log(`Letter ${index} distance:`, distance); // DEBUG

            if (distance >= radius) {
                // Only update if it's currently NOT the default setting to prevent unnecessary DOM writes
                if (letterRef.style.fontVariationSettings !== fromFontVariationSettings) {
                    letterRef.style.fontVariationSettings = fromFontVariationSettings;
                    interpolatedSettingsRef.current[index] = fromFontVariationSettings;
                }
                return;
            }

            const falloffValue = calculateFalloff(distance);
            const newSettings = parsedSettings
                .map(({ axis, fromValue, toValue }) => {
                    const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
                    return `'${axis}' ${interpolatedValue}`;
                })
                .join(", ");

            // Only update if the new settings are different from the current ones
            if (interpolatedSettingsRef.current[index] !== newSettings) {
                interpolatedSettingsRef.current[index] = newSettings;
                letterRef.style.fontVariationSettings = newSettings;
            }
        });
    });

    const words = label.split(" ");
    let letterIndex = 0; // Use a mutable index for mapping

    return (
        <span
            ref={ref}
            onClick={onClick}
            style={{
                display: "inline", // Maintain inline flow
                fontFamily: '"Roboto Flex", sans-serif',
                ...style,
            }}
            className={className}
            {...restProps}
        >
            {words.map((word, wordIndex) => (
                <span
                    key={wordIndex}
                    // Apply whitespace-nowrap to prevent words from breaking
                    // inline-block to allow proper positioning and transformations if needed
                    className="inline-block whitespace-nowrap"
                >
                    {word.split("").map((letter) => {
                        const currentLetterIndex = letterIndex++; // Increment for each letter
                        return (
                            <motion.span
                                key={currentLetterIndex}
                                ref={(el) => { letterRefs.current[currentLetterIndex] = el; }}
                                style={{
                                    display: "inline-block", // Important for getBoundingClientRect to work accurately per letter
                                    // Initialize with the from setting or the last interpolated setting
                                    fontVariationSettings: interpolatedSettingsRef.current[currentLetterIndex] || fromFontVariationSettings,
                                }}
                                aria-hidden="true" // Hide from screen readers if content is duplicated below
                            >
                                {letter}
                            </motion.span>
                        );
                    })}
                    {/* Add a non-breaking space between words */}
                    {wordIndex < words.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                    )}
                </span>
            ))}
            {/* Provide the full label for screen readers */}
            <span className="sr-only">{label}</span>
        </span>
    );
});

VariableProximity.displayName = "VariableProximity";
export default VariableProximity;