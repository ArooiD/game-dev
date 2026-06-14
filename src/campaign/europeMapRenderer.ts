import Phaser from 'phaser';

export function drawStylizedEuropeMap(g: Phaser.GameObjects.Graphics): void {
  drawSea(g);
  drawLandMasses(g);
  drawMountains(g);
  drawRivers(g);
  drawDecorations(g);
}

function drawSea(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x1f3448, 1).fillRect(0, 0, 1120, 720);
  g.fillStyle(0x2b4b63, 0.5).fillEllipse(520, 380, 950, 520);
  g.fillStyle(0x172536, 0.9).fillEllipse(250, 610, 420, 160);
  g.fillEllipse(910, 650, 360, 150);
}

function drawLandMasses(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x314f32, 1);
  drawPolygon(g, [[150,155],[210,105],[270,150],[250,235],[185,250],[135,205]]); // Britain
  drawPolygon(g, [[270,310],[360,245],[505,260],[575,335],[540,450],[465,545],[310,520],[245,425]]); // France / Iberia base
  drawPolygon(g, [[160,500],[285,455],[355,535],[315,635],[185,625],[115,565]]); // Iberia
  drawPolygon(g, [[515,455],[585,500],[625,610],[590,680],[535,590],[485,520]]); // Italy
  drawPolygon(g, [[500,230],[660,160],[825,210],[960,280],[1025,385],[965,520],[760,535],[600,455],[555,335]]); // Central/East Europe
  drawPolygon(g, [[520,90],[630,45],[745,75],[810,145],[700,205],[570,175]]); // Scandinavia
  drawPolygon(g, [[680,470],[820,500],[930,585],[890,675],[735,620],[650,545]]); // Balkans/Ottoman front

  g.lineStyle(3, 0x8b6f3e, 0.7);
  g.strokePoints([new Phaser.Geom.Point(150,155), new Phaser.Geom.Point(210,105), new Phaser.Geom.Point(270,150), new Phaser.Geom.Point(250,235), new Phaser.Geom.Point(185,250), new Phaser.Geom.Point(135,205)], true);
  g.strokePoints([new Phaser.Geom.Point(270,310), new Phaser.Geom.Point(360,245), new Phaser.Geom.Point(505,260), new Phaser.Geom.Point(575,335), new Phaser.Geom.Point(540,450), new Phaser.Geom.Point(465,545), new Phaser.Geom.Point(310,520), new Phaser.Geom.Point(245,425)], true);
  g.strokePoints([new Phaser.Geom.Point(500,230), new Phaser.Geom.Point(660,160), new Phaser.Geom.Point(825,210), new Phaser.Geom.Point(960,280), new Phaser.Geom.Point(1025,385), new Phaser.Geom.Point(965,520), new Phaser.Geom.Point(760,535), new Phaser.Geom.Point(600,455), new Phaser.Geom.Point(555,335)], true);
}

function drawMountains(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x6b5a41, 0.9);
  for (const [x, y] of [[465,330],[505,335],[545,350],[590,390],[635,425],[705,455],[775,505]]) {
    g.fillTriangle(x - 14, y + 12, x, y - 18, x + 14, y + 12);
    g.fillStyle(0xd8c28b, 0.65).fillTriangle(x - 4, y - 4, x, y - 18, x + 5, y - 4);
    g.fillStyle(0x6b5a41, 0.9);
  }
}

function drawRivers(g: Phaser.GameObjects.Graphics): void {
  g.lineStyle(5, 0x5aa7b8, 0.65);
  g.beginPath();
  g.moveTo(650, 185);
  g.lineTo(630, 260);
  g.lineTo(610, 335);
  g.lineTo(585, 420);
  g.strokePath();
  g.beginPath();
  g.moveTo(850, 265);
  g.lineTo(805, 345);
  g.lineTo(780, 440);
  g.lineTo(820, 520);
  g.strokePath();
}

function drawDecorations(g: Phaser.GameObjects.Graphics): void {
  g.lineStyle(1, 0xd6b86a, 0.25);
  for (let x = 80; x < 1050; x += 120) g.lineBetween(x, 80, x + 40, 130);
  g.fillStyle(0xd6b86a, 0.8).fillCircle(1040, 70, 22);
  g.lineStyle(2, 0xd6b86a, 0.6).strokeCircle(1040, 70, 32);
}

function drawPolygon(g: Phaser.GameObjects.Graphics, points: number[][]): void {
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) g.lineTo(points[i][0], points[i][1]);
  g.closePath();
  g.fillPath();
}
