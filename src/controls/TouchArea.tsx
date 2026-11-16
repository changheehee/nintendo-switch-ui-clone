type TouchAreaProps = {
  readonly label: string;
  readonly onTouch: () => void;
};

export function TouchArea({ label, onTouch }: TouchAreaProps) {
  return <button className="console-layer" type="button" onClick={onTouch} aria-label={label} />;
}
