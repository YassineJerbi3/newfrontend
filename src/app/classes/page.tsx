"use client";
import { useRef, useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Global constant for extra space (for the label area) above each PC.
const frameExtra = 25;

const ClassroomCanvas = () => {
  const canvasRef = useRef(null);
  const [hoveredPcId, setHoveredPcId] = useState(null);
  const [selectedPc, setSelectedPc] = useState(null); // Stores clicked PC details
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility

  // Spacing and dimensions for posts
  const spacingX = 80;
  const spacingY = 50;
  const pcWidth = 150;
  const pcHeight = 120;
  const canvasWidth = 1200;
  const canvasHeight = 900; // Increase canvas height to allow more posts and background space.

  // Compute professor's PC x so that it is centered horizontally.
  const professorX = (canvasWidth - pcWidth) / 2;

  // Define PC data:
  // • The professor's PC is in its own row at the very top.
  // • Normal PCs follow in rows with a clear gap.
  const pcData = [
    // Professor's PC – unique; centered at the top.
    {
      id: 99,
      label: "Poste Professor",
      x: professorX,
      y: 20,
      width: pcWidth,
      height: pcHeight,
      professor: true, // flag for special styling
      details:
        "Processeur: AMD Ryzen 9\nRAM: 32GB\nStockage: 1TB SSD\nInfo: Station du Professeur",
    },
    // Normal PCs:
    // Row 1 – start at y = 220
    {
      id: 1,
      label: "Poste 1",
      x: 50,
      y: 220,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    {
      id: 2,
      label: "Poste 2",
      x: 50 + pcWidth + spacingX, // 50 + 150 + 80 = 280
      y: 220,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
    {
      id: 3,
      label: "Poste 3",
      x: 280 + pcWidth + spacingX, // 280 + 150 + 80 = 510
      y: 220,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    {
      id: 4,
      label: "Poste 4",
      x: 510 + pcWidth + spacingX, // 510 + 150 + 80 = 740
      y: 220,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
    {
      id: 5,
      label: "Poste 5",
      x: 740 + pcWidth + spacingX, // 740 + 150 + 80 = 970
      y: 220,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    // Row 2 – y = 220 + pcHeight + spacingY = 220 + 120 + 50 = 390
    {
      id: 6,
      label: "Poste 6",
      x: 50,
      y: 390,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
    {
      id: 7,
      label: "Poste 7",
      x: 50 + pcWidth + spacingX, // 280
      y: 390,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    {
      id: 8,
      label: "Poste 8",
      x: 280 + pcWidth + spacingX, // 510
      y: 390,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
    {
      id: 9,
      label: "Poste 9",
      x: 510 + pcWidth + spacingX, // 740
      y: 390,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    {
      id: 10,
      label: "Poste 10",
      x: 740 + pcWidth + spacingX, // 970
      y: 390,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
    // Row 3 – y = 390 + pcHeight + spacingY = 390 + 120 + 50 = 560
    // Two PCs centered: total width = 2*pcWidth + spacingX = 380; left offset = (1200 - 380)/2 = 410.
    {
      id: 11,
      label: "Poste 11",
      x: 410,
      y: 560,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD\nInfo: Exemple",
    },
    {
      id: 12,
      label: "Poste 12",
      x: 410 + pcWidth + spacingX, // 410 + 150 + 80 = 640
      y: 560,
      width: pcWidth,
      height: pcHeight,
      details:
        "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD\nInfo: Exemple",
    },
  ];

  // Compute dynamic background bounds based on all posts
  const computeBackgroundBounds = (data) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    data.forEach((pc) => {
      minX = Math.min(minX, pc.x);
      minY = Math.min(minY, pc.y);
      maxX = Math.max(maxX, pc.x + pc.width);
      maxY = Math.max(maxY, pc.y + pc.height);
    });
    // Increased padding to ensure all posts (including the professor's) fit inside.
    const padding = 60;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  };

  // Draw the dynamic white background without an inner border.
  const drawBackground = (ctx, bounds) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  };

  // Draw each PC with its frame and inner components.
  const drawPC = (ctx, pc, isHovered) => {
    const scaleFactor = isHovered ? 1.2 : 1;
    const centerX = pc.x + pc.width / 2;
    const centerY = pc.y + pc.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-centerX, -centerY);

    const framePadding = 5;

    if (pc.professor) {
      // Unique style for professor's PC: light blue background, blue border.
      ctx.fillStyle = "#e0f7fa";
      ctx.fillRect(
        pc.x - framePadding,
        pc.y - frameExtra,
        pc.width + framePadding * 2,
        pc.height + frameExtra + framePadding,
      );
      ctx.strokeStyle = "#0288d1";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        pc.x - framePadding,
        pc.y - frameExtra,
        pc.width + framePadding * 2,
        pc.height + frameExtra + framePadding,
      );
      ctx.fillStyle = "#01579b";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(pc.label, pc.x + pc.width / 2, pc.y - frameExtra / 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pc.x, pc.y, pc.width, pc.height);
    } else {
      // Normal PCs: light grey frame.
      ctx.fillStyle = "#f2f2f2";
      ctx.fillRect(
        pc.x - framePadding,
        pc.y - frameExtra,
        pc.width + framePadding * 2,
        pc.height + frameExtra + framePadding,
      );
      ctx.strokeStyle = "#d3d3d3";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        pc.x - framePadding,
        pc.y - frameExtra,
        pc.width + framePadding * 2,
        pc.height + frameExtra + framePadding,
      );
      ctx.fillStyle = "black";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(pc.label, pc.x + pc.width / 2, pc.y - frameExtra / 2);
      ctx.fillStyle = "white";
      ctx.fillRect(pc.x, pc.y, pc.width, pc.height);
    }

    // Draw common PC components: monitor, stand, keyboard.
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    const monitorWidth = pc.width * 0.8;
    const monitorHeight = pc.height * 0.4;
    const monitorX = pc.x + (pc.width - monitorWidth) / 2;
    const monitorY = pc.y + 10; // inner padding
    ctx.strokeRect(monitorX, monitorY, monitorWidth, monitorHeight);

    const standWidth = monitorWidth * 0.2;
    const standHeight = 10;
    const standX = pc.x + (pc.width - standWidth) / 2;
    const standY = monitorY + monitorHeight;
    ctx.strokeRect(standX, standY, standWidth, standHeight);

    const keyboardWidth = pc.width * 0.9;
    const keyboardHeight = pc.height * 0.3;
    const keyboardX = pc.x + (pc.width - keyboardWidth) / 2;
    const keyboardY = standY + standHeight + 5;
    ctx.strokeRect(keyboardX, keyboardY, keyboardWidth, keyboardHeight);

    ctx.restore();
  };

  // Redraw the classroom by centering the background and posts on the canvas.
  const drawClassroom = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute background bounds based on all posts.
    const bounds = computeBackgroundBounds(pcData);
    // Calculate offsets to center the background within the canvas.
    const offsetX = (canvasWidth - bounds.width) / 2 - bounds.x;
    const offsetY = (canvasHeight - bounds.height) / 2 - bounds.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw background (without the inner gray border)
    drawBackground(ctx, bounds);

    // Draw all PCs.
    pcData.forEach((pc) => {
      const isHovered = pc.id === hoveredPcId;
      drawPC(ctx, pc, isHovered);
    });

    ctx.restore();
  };

  useEffect(() => {
    drawClassroom();
  }, [hoveredPcId]);

  // Adjust hover and click detection to include the professor's label area.
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let found = false;
    for (let pc of pcData) {
      // For professor's PC, extend the vertical hit area upward by frameExtra.
      const topY = pc.professor ? pc.y - frameExtra : pc.y;
      const bottomY = pc.professor ? pc.y + pc.height : pc.y + pc.height;
      if (
        mouseX >= pc.x &&
        mouseX <= pc.x + pc.width &&
        mouseY >= topY &&
        mouseY <= bottomY
      ) {
        setHoveredPcId(pc.id);
        found = true;
        break;
      }
    }
    if (!found) setHoveredPcId(null);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    for (let pc of pcData) {
      const topY = pc.professor ? pc.y - frameExtra : pc.y;
      const bottomY = pc.professor ? pc.y + pc.height : pc.y + pc.height;
      if (
        mouseX >= pc.x &&
        mouseX <= pc.x + pc.width &&
        mouseY >= topY &&
        mouseY <= bottomY
      ) {
        setSelectedPc(pc);
        setIsModalOpen(true);
        break;
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <div style={{ overflowX: "hidden" }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{
            background: "#fff",
            width: "100%",
            maxWidth: `${canvasWidth}px`,
            display: "block",
            margin: "0 auto",
            cursor: "pointer",
          }}
        />
        {/* Modal with close "X" in the top right, no scrolling */}
        {isModalOpen && selectedPc && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "60px",
              width: "600px",
              borderRadius: "8px",
              boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
              zIndex: "1000",
            }}
          >
            {/* Close "X" button */}
            <div
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              &times;
            </div>
            <h3>{selectedPc.label}</h3>
            <pre style={{ fontSize: "16px", lineHeight: "1.5" }}>
              {selectedPc.details}
            </pre>
            {/* Action Buttons */}
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                gap: "20px",
              }}
            >
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Modifier
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f0ad4e",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Supprimer
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#5bc0de",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
        {/* Modal overlay */}
        {isModalOpen && (
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: "999",
            }}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ClassroomCanvas;
