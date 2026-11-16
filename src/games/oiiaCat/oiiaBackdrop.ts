export const BACKDROP_WIDTH = 1280;
export const BACKDROP_HEIGHT = 720;

const TITLE_TEXT = 'OIIA CAT';
const TITLE_FONT = '104px "Luckiest Guy"';
const TITLE_LETTER_SPACING = 4;
const TITLE_ARC_CENTER_Y = 1350;
const TITLE_ARC_RADIUS = 1210;
const TITLE_FILL = '#ffc93c';
const TITLE_OUTLINE = '#7a4317';
const TITLE_OUTLINE_WIDTH = 12;
const TITLE_SHADOW = 'rgb(90 50 20 / 0.25)';
const TITLE_SHADOW_OFFSET = 5;

const GLOW_CENTER_Y = BACKDROP_HEIGHT * 0.38;
const GLOW_RADIUS = 900;
const RAYS_CENTER_Y = BACKDROP_HEIGHT * 0.46;
const RAY_COUNT = 20;
const RAY_LENGTH = 1600;
const RAY_COLOR = 'rgb(255 255 255 / 0.55)';

const SHADOW_CENTER_Y = 552;
const SHADOW_RADIUS_X = 150;
const SHADOW_RADIUS_Y = 24;

export function loadBackdropFont(): Promise<FontFace[]> {
  return document.fonts.load(TITLE_FONT, TITLE_TEXT);
}

export function paintBackdrop(context: CanvasRenderingContext2D) {
  const scale = context.canvas.width / BACKDROP_WIDTH;

  context.save();
  context.scale(scale, scale);
  paintGlow(context);
  paintRays(context);
  paintFloorShadow(context);
  paintArchedTitle(context);
  context.restore();
}

function paintGlow(context: CanvasRenderingContext2D) {
  const glow = context.createRadialGradient(BACKDROP_WIDTH / 2, GLOW_CENTER_Y, 0, BACKDROP_WIDTH / 2, GLOW_CENTER_Y, GLOW_RADIUS);
  glow.addColorStop(0, '#ffffff');
  glow.addColorStop(0.45, '#f3f8fc');
  glow.addColorStop(1, '#cfe6f5');
  context.fillStyle = glow;
  context.fillRect(0, 0, BACKDROP_WIDTH, BACKDROP_HEIGHT);
}

function paintRays(context: CanvasRenderingContext2D) {
  const rayAngle = (Math.PI * 2) / (RAY_COUNT * 2);

  context.fillStyle = RAY_COLOR;

  for (let rayIndex = 0; rayIndex < RAY_COUNT; rayIndex += 1) {
    const startAngle = rayIndex * 2 * rayAngle;

    context.beginPath();
    context.moveTo(BACKDROP_WIDTH / 2, RAYS_CENTER_Y);
    context.arc(BACKDROP_WIDTH / 2, RAYS_CENTER_Y, RAY_LENGTH, startAngle, startAngle + rayAngle);
    context.closePath();
    context.fill();
  }
}

function paintFloorShadow(context: CanvasRenderingContext2D) {
  const shadow = context.createRadialGradient(0, 0, 0, 0, 0, 1);
  shadow.addColorStop(0, 'rgb(40 60 80 / 0.3)');
  shadow.addColorStop(1, 'rgb(40 60 80 / 0)');

  context.save();
  context.translate(BACKDROP_WIDTH / 2, SHADOW_CENTER_Y);
  context.scale(SHADOW_RADIUS_X, SHADOW_RADIUS_Y);
  context.fillStyle = shadow;
  context.beginPath();
  context.arc(0, 0, 1, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function paintArchedTitle(context: CanvasRenderingContext2D) {
  context.font = TITLE_FONT;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.lineJoin = 'round';

  const letters = Array.from(TITLE_TEXT, function measureLetter(letter) {
    return { letter, width: context.measureText(letter).width + TITLE_LETTER_SPACING };
  });
  const titleWidth = letters.reduce(function addWidth(total, measured) {
    return total + measured.width;
  }, 0);
  let travelled = -titleWidth / 2;

  for (const { letter, width } of letters) {
    const angle = (travelled + width / 2) / TITLE_ARC_RADIUS;
    travelled += width;

    context.save();
    context.translate(BACKDROP_WIDTH / 2 + Math.sin(angle) * TITLE_ARC_RADIUS, TITLE_ARC_CENTER_Y - Math.cos(angle) * TITLE_ARC_RADIUS);
    context.rotate(angle);
    paintOutlinedLetter(context, letter);
    context.restore();
  }
}

function paintOutlinedLetter(context: CanvasRenderingContext2D, letter: string) {
  context.fillStyle = TITLE_SHADOW;
  context.fillText(letter, 0, TITLE_SHADOW_OFFSET);
  context.lineWidth = TITLE_OUTLINE_WIDTH;
  context.strokeStyle = TITLE_OUTLINE;
  context.strokeText(letter, 0, 0);
  context.fillStyle = TITLE_FILL;
  context.fillText(letter, 0, 0);
}

export function readDrawingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('2D 캔버스를 만들 수 없습니다.');
  }

  return context;
}
