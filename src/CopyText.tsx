import { PropsWithChildren, ReactNode, useEffect, useState } from "react";

export const CopyText: React.FC<
  PropsWithChildren<{
    text: string;
    copiedIndicator: ReactNode;
    disabled?: boolean;
    className?: string;
  }>
> = ({ text, className, children, copiedIndicator, disabled }) => {
  const [copied, setCopied] = useState(false);
  const copy = async (evt: React.MouseEvent) => {
    if (disabled) return;
    evt.stopPropagation();

    await navigator.clipboard.writeText(text);
    setCopied(true);
  };
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  return (
    <button
      aria-label="copy"
      disabled={disabled || copied}
      className={className}
      type="button"
      onClick={copy}
      tabIndex={-1}
    >
      {copied ? copiedIndicator : children}
    </button>
  );
};
