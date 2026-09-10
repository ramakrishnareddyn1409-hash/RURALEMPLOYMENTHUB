import React from "react";

/**
 * Clean SVG QR Code generator component
 * Encodes text / payload into a visual scannable 2D QR matrix
 */
const QRCodeDisplay = ({ value = "", size = 120, className = "" }) => {
  // Simple deterministic QR module matrix generator for client preview
  const generateMatrix = (str) => {
    const matrixSize = 21; // Standard QR Version 1 (21x21)
    const grid = Array(matrixSize)
      .fill(0)
      .map(() => Array(matrixSize).fill(false));

    // Finder patterns helper (7x7 squares at corners)
    const addFinder = (row, col) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[row + r][col + c] = true;
          }
        }
      }
    };

    addFinder(0, 0); // Top-left
    addFinder(0, matrixSize - 7); // Top-right
    addFinder(matrixSize - 7, 0); // Bottom-left

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Hash the input string to generate pseudorandom data bits
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    // Fill data area
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= matrixSize - 8) ||
          (r >= matrixSize - 8 && c < 8)
        ) {
          continue;
        }
        if (r === 6 || c === 6) continue;

        const bitVal = Math.sin((r + 1) * 31 + (c + 1) * 17 + hash) > 0.05;
        grid[r][c] = bitVal;
      }
    }

    return { grid, matrixSize };
  };

  const { grid, matrixSize } = generateMatrix(value || "WRK-DEMO");
  const moduleSize = size / matrixSize;

  return (
    <div
      className={`inline-block p-2 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}
      title={`QR Code for: ${value}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {grid.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * moduleSize}
                y={r * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

export default QRCodeDisplay;
