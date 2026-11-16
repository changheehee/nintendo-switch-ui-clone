import './homeMenuMark.css';

type MarkPlacement = 'entrance' | 'prompt';

type HomeMenuMarkProps = {
  readonly placement: MarkPlacement;
};

export function HomeMenuMark({ placement }: HomeMenuMarkProps) {
  return (
    <span className="home-menu-mark" data-placement={placement}>
      <span className="home-menu-mark-icon" aria-hidden="true" />
      <span className="home-menu-mark-label">HOME Menu</span>
    </span>
  );
}
