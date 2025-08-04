const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

const NODES = 100;
const nodes = [];
const linesDistance = 140;
const nodeRadius = 2.5;
const accent = '#7b5fff';
const accentGlow = '#b6aaff';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < NODES; i++) {
  nodes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw lines
  for (let i = 0; i < NODES; i++) {
    for (let j = i + 1; j < NODES; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < linesDistance) {
        ctx.save();
        ctx.globalAlpha = 1 - dist / linesDistance;
        ctx.strokeStyle = accentGlow;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // Draw nodes
  for (let i = 0; i < NODES; i++) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = accent;
    ctx.shadowColor = accentGlow;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

function update() {
  for (let i = 0; i < NODES; i++) {
    nodes[i].x += nodes[i].vx;
    nodes[i].y += nodes[i].vy;
    if (nodes[i].x < 0 || nodes[i].x > canvas.width) nodes[i].vx *= -1;
    if (nodes[i].y < 0 || nodes[i].y > canvas.height) nodes[i].vy *= -1;
  }
}

function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

animate(); 