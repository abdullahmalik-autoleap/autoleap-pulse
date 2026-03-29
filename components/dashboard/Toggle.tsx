"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: checked ? "var(--brand)" : "var(--surface-3)",
        transition: "background 200ms ease",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "var(--toggle-thumb)",
          transition: "left 200ms ease",
          boxShadow: "var(--toggle-shadow)",
        }}
      />
    </button>
  );
}
