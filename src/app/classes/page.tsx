"use client";

import { useRef, useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const ClassroomCanvas = () => {
  const canvasRef = useRef(null);
  const [hoveredPcId, setHoveredPcId] = useState(null);
  const [selectedPc, setSelectedPc] = useState(null); // State to store the clicked PC details
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // 12 PCs data
  const pcData = [
    {
      id: 1,
      label: "Poste 1",
      x: 50,
      y: 50,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 2,
      label: "Poste 2",
      x: 250,
      y: 50,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
    {
      id: 3,
      label: "Poste 3",
      x: 450,
      y: 50,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 4,
      label: "Poste 4",
      x: 650,
      y: 50,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
    {
      id: 5,
      label: "Poste 5",
      x: 850,
      y: 50,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 6,
      label: "Poste 6",
      x: 50,
      y: 200,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
    {
      id: 7,
      label: "Poste 7",
      x: 250,
      y: 200,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 8,
      label: "Poste 8",
      x: 450,
      y: 200,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
    {
      id: 9,
      label: "Poste 9",
      x: 650,
      y: 200,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 10,
      label: "Poste 10",
      x: 850,
      y: 200,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
    {
      id: 11,
      label: "Poste 11",
      x: 50,
      y: 350,
      width: 150,
      height: 120,
      details: "Processeur: Intel i5\nRAM: 8GB\nStockage: 256GB SSD",
    },
    {
      id: 12,
      label: "Poste 12",
      x: 250,
      y: 350,
      width: 150,
      height: 120,
      details: "Processeur: Intel i7\nRAM: 16GB\nStockage: 512GB SSD",
    },
  ];

  const drawPC = (ctx, pc, isHovered) => {
    const scaleFactor = isHovered ? 1.2 : 1;
    const centerX = pc.x + pc.width / 2;
    const centerY = pc.y + pc.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-centerX, -centerY);

    // Drawing the PC
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    const monitorWidth = pc.width * 0.8;
    const monitorHeight = pc.height * 0.4;
    const monitorX = pc.x + (pc.width - monitorWidth) / 2;
    const monitorY = pc.y;
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

    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(pc.label, centerX, pc.y + pc.height + 15);
    ctx.restore();
  };

  const drawClassroom = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pcData.forEach((pc) => {
      const isHovered = pc.id === hoveredPcId;
      drawPC(ctx, pc, isHovered);
    });
  };

  useEffect(() => {
    drawClassroom();
  }, [hoveredPcId]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let found = false;

    for (let pc of pcData) {
      if (
        mouseX >= pc.x &&
        mouseX <= pc.x + pc.width &&
        mouseY >= pc.y &&
        mouseY <= pc.y + pc.height
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
      if (
        mouseX >= pc.x &&
        mouseX <= pc.x + pc.width &&
        mouseY >= pc.y &&
        mouseY <= pc.y + pc.height
      ) {
        setSelectedPc(pc); // Set the selected PC data
        setIsModalOpen(true); // Open the modal
        break;
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <div>
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ background: "#fff" }} // Removed border style here
        />

        {/* Modal to show PC details */}
        {isModalOpen && selectedPc && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: "1000",
            }}
          >
            <h3>{selectedPc.label}</h3>
            <p>{selectedPc.details}</p>
            <button onClick={closeModal} style={{ marginTop: "10px" }}>
              Close
            </button>
          </div>
        )}

        {/* Overlay to close the modal when clicked outside */}
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
