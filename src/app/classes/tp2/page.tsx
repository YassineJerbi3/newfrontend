"use client";
import React, { useRef, useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------
interface PCBase {
  id: number;
  details: string;
}
interface DPC extends PCBase {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  professor?: boolean;
  add?: boolean;
}

// ------------------------------------------------------------------------------
// Shared Constants & Styles
// ------------------------------------------------------------------------------
const frameExtra = 25;
const postsPerRow = 5;
const startX = 50;
const startY = 220;
const pcWidth = 150;
const pcHeight = 120;
const spacingX = 80;
const spacingY = 50;
const baseCanvasWidth = 1200;
const baseCanvasHeight = 900;
const canvasAspectRatio = baseCanvasWidth / baseCanvasHeight;

const modalStyles = {
  container: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "2rem",
    width: "90%",
    maxWidth: "600px",
    borderRadius: "8px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    zIndex: 1001,
  },
  closeBtn: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#666",
  },
  label: {
    display: "block" as const,
    marginTop: "1rem",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginTop: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  error: {
    color: "#e53935",
    marginTop: "0.5rem",
  },
  btnRow: {
    display: "flex" as const,
    justifyContent: "flex-end" as const,
    marginTop: "1.5rem",
    gap: "1rem",
  },
  btnPrimary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 1000,
};

// ------------------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------------------
export default function ClassroomCanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [profAddOpen, setProfAddOpen] = useState(false);
  const [studAddOpen, setStudAddOpen] = useState(false);
  const [selected, setSelected] = useState<DPC | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State for posts
  const [professorPost, setProfessorPost] = useState<PCBase | null>(null);
  const [students, setStudents] = useState<PCBase[]>([]);

  // Compute layout including add-cell for students
  const layoutPCs = (): DPC[] => {
    const arr: DPC[] = [];
    // professor post if exists
    if (professorPost) {
      arr.push({
        id: professorPost.id,
        label: "Poste Prof",
        x: (baseCanvasWidth - pcWidth) / 2,
        y: 20,
        width: pcWidth,
        height: pcHeight,
        professor: true,
        details: professorPost.details,
      });
    }
    // student posts sorted
    const sorted = [...students].sort((a, b) => a.id - b.id);
    sorted.forEach((s, idx) => {
      const row = Math.floor(idx / postsPerRow);
      const col = idx % postsPerRow;
      arr.push({
        id: s.id,
        label: `Poste ${s.id}`,
        x: startX + col * (pcWidth + spacingX),
        y: startY + row * (pcHeight + spacingY),
        width: pcWidth,
        height: pcHeight,
        details: s.details,
      });
    });
    // student add-button cell
    const idx = students.length;
    const row = Math.floor(idx / postsPerRow);
    const col = idx % postsPerRow;
    arr.push({
      id: -1,
      label: "+",
      x: startX + col * (pcWidth + spacingX),
      y: startY + row * (pcHeight + spacingY),
      width: pcWidth,
      height: pcHeight,
      add: true,
      details: "",
    });
    return arr;
  };

  // Drawing functions (computeBounds, drawBackground, drawPC, drawAll)
  const computeBounds = (pcs: DPC[]) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    pcs.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y - (p.professor ? frameExtra : 0));
      maxX = Math.max(maxX, p.x + p.width);
      maxY = Math.max(maxY, p.y + p.height);
    });
    const pad = 60;
    return {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  };
  const drawBackground = (ctx: CanvasRenderingContext2D, b: any) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  };
  const drawPC = (ctx: CanvasRenderingContext2D, pc: DPC, hover: boolean) => {
    if (pc.add) {
      ctx.save();
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = hover ? 3 : 2;
      ctx.strokeRect(pc.x, pc.y, pc.width, pc.height);
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(pc.label, pc.x + pc.width / 2, pc.y + pc.height / 2);
      ctx.restore();
      return;
    }
    const scale = hover ? 1.1 : 1;
    const cx = pc.x + pc.width / 2,
      cy = pc.y + pc.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    const pad = 5;
    if (pc.professor) {
      ctx.fillStyle = "#e0f7fa";
      ctx.fillRect(
        pc.x - pad,
        pc.y - frameExtra,
        pc.width + pad * 2,
        pc.height + frameExtra + pad,
      );
      ctx.strokeStyle = "#0288d1";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        pc.x - pad,
        pc.y - frameExtra,
        pc.width + pad * 2,
        pc.height + frameExtra + pad,
      );
      ctx.fillStyle = "#01579b";
    } else {
      ctx.fillStyle = "#f2f2f2";
      ctx.fillRect(
        pc.x - pad,
        pc.y - frameExtra,
        pc.width + pad * 2,
        pc.height + frameExtra + pad,
      );
      ctx.strokeStyle = "#d3d3d3";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        pc.x - pad,
        pc.y - frameExtra,
        pc.width + pad * 2,
        pc.height + frameExtra + pad,
      );
      ctx.fillStyle = "#000";
    }
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(pc.label, pc.x + pc.width / 2, pc.y - frameExtra / 2);
    ctx.fillStyle = "#fff";
    ctx.fillRect(pc.x, pc.y, pc.width, pc.height);
    const mw = pc.width * 0.8,
      mh = pc.height * 0.4;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(pc.x + (pc.width - mw) / 2, pc.y + 10, mw, mh);
    const sw = mw * 0.2,
      sh = 8;
    ctx.strokeRect(pc.x + (pc.width - sw) / 2, pc.y + 10 + mh, sw, sh);
    const kw = pc.width * 0.9,
      kh = pc.height * 0.25;
    ctx.strokeRect(pc.x + (pc.width - kw) / 2, pc.y + 10 + mh + sh + 5, kw, kh);
    ctx.restore();
  };
  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, baseCanvasWidth, baseCanvasHeight);
    const pcs = layoutPCs();
    const b = computeBounds(pcs);
    ctx.save();
    ctx.translate(
      (baseCanvasWidth - b.width) / 2 - b.x,
      (baseCanvasHeight - b.height) / 2 - b.y,
    );
    drawBackground(ctx, b);
    pcs.forEach((p) => drawPC(ctx, p, p.id === hoveredId));
    ctx.restore();
  };
  useEffect(drawAll, [hoveredId, professorPost, students]);

  // Interaction
  const hitTest = (mx: number, my: number, pc: DPC, ox: number, oy: number) => {
    const rx = mx - ox,
      ry = my - oy;
    const topY = pc.professor ? pc.y - frameExtra : pc.y;
    return (
      rx >= pc.x &&
      rx <= pc.x + pc.width &&
      ry >= topY &&
      ry <= pc.y + pc.height
    );
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const pcs = layoutPCs(),
      b = computeBounds(pcs);
    const ox = (baseCanvasWidth - b.width) / 2 - b.x,
      oy = (baseCanvasHeight - b.height) / 2 - b.y;
    let found = false;
    pcs.forEach((p) => {
      if (!found && hitTest(mx, my, p, ox, oy)) {
        setHoveredId(p.id);
        found = true;
      }
    });
    if (!found) setHoveredId(null);
  };
  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const pcs = layoutPCs(),
      b = computeBounds(pcs);
    const ox = (baseCanvasWidth - b.width) / 2 - b.x,
      oy = (baseCanvasHeight - b.height) / 2 - b.y;
    for (const p of pcs) {
      if (hitTest(mx, my, p, ox, oy)) {
        if (p.add) {
          setStudAddOpen(true);
          setErrorMsg(null);
        } else if (p.professor) {
          setSelected(p);
          setDetailOpen(true);
        } else {
          setSelected(p);
          setDetailOpen(true);
        }
        return;
      }
    }
  };

  // Add professor
  const handleProfAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.target as HTMLFormElement;
    const uc = (form.elements.namedItem("uniteProf") as HTMLInputElement).value;
    const se = (form.elements.namedItem("ecranProf") as HTMLInputElement).value;
    setProfessorPost({
      id: 99,
      details: `Unité Centrale: ${uc}\nÉcran: ${se}`,
    });
    setProfAddOpen(false);
  };

  // Add student
  const handleStudAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.target as HTMLFormElement;
    const pn = Number(
      (form.elements.namedItem("posteNumber") as HTMLInputElement).value,
    );
    if ([...students.map((s) => s.id)].includes(pn)) {
      setErrorMsg("Numéro déjà utilisé");
      return;
    }
    const uc = (form.elements.namedItem("uniteStud") as HTMLInputElement).value;
    const se = (form.elements.namedItem("ecranStud") as HTMLInputElement).value;
    setStudents((prev) => [
      ...prev,
      { id: pn, details: `Unité Centrale: ${uc}\nÉcran: ${se}` },
    ]);
    setStudAddOpen(false);
  };

  const closeAll = () => {
    setDetailOpen(false);
    setProfAddOpen(false);
    setStudAddOpen(false);
    setErrorMsg(null);
  };

  // Render
  return (
    <DefaultLayout>
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: `${100 / canvasAspectRatio}%`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={baseCanvasWidth}
          height={baseCanvasHeight}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />

        {/* Add Professor Button */}
        {!professorPost && (
          <button
            onClick={() => setProfAddOpen(true)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              background: "none",
              cursor: "pointer",
            }}
          >
            + Ajouter Poste Prof
          </button>
        )}

        {/* Detail Modal */}
        {detailOpen && selected && (
          <>
            <div style={overlayStyle} onClick={closeAll} />
            <div style={modalStyles.container}>
              <div style={modalStyles.closeBtn} onClick={closeAll}>
                &times;
              </div>
              <h2>{selected.label}</h2>
              <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {selected.details}
              </pre>
              <div style={modalStyles.btnRow}>
                <button style={modalStyles.btnPrimary} onClick={closeAll}>
                  Fermer
                </button>
              </div>
            </div>
          </>
        )}

        {/* Professor Add Modal */}
        {profAddOpen && (
          <>
            <div style={overlayStyle} onClick={closeAll} />
            <div style={modalStyles.container}>
              <div style={modalStyles.closeBtn} onClick={closeAll}>
                &times;
              </div>
              <h2>Ajouter Poste Professeur</h2>
              <form onSubmit={handleProfAdd}>
                <label style={modalStyles.label}>
                  Code Série Unité Centrale
                </label>
                <input name="uniteProf" required style={modalStyles.input} />
                <label style={modalStyles.label}>Code Série Écran</label>
                <input name="ecranProf" required style={modalStyles.input} />
                {errorMsg && <p style={modalStyles.error}>{errorMsg}</p>}
                <div style={modalStyles.btnRow}>
                  <button type="submit" style={modalStyles.btnPrimary}>
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Student Add Modal */}
        {studAddOpen && (
          <>
            <div style={overlayStyle} onClick={closeAll} />
            <div style={modalStyles.container}>
              <div style={modalStyles.closeBtn} onClick={closeAll}>
                &times;
              </div>
              <h2>Ajouter Poste</h2>
              <form onSubmit={handleStudAdd}>
                <label style={modalStyles.label}>Numéro de Poste</label>
                <input
                  name="posteNumber"
                  type="number"
                  style={modalStyles.input}
                  required
                />
                <label style={modalStyles.label}>
                  Code Série Unité Centrale
                </label>
                <input name="uniteStud" required style={modalStyles.input} />
                <label style={modalStyles.label}>Code Série Écran</label>
                <input name="ecranStud" required style={modalStyles.input} />
                {errorMsg && <p style={modalStyles.error}>{errorMsg}</p>}
                <div style={modalStyles.btnRow}>
                  <button type="submit" style={modalStyles.btnPrimary}>
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
