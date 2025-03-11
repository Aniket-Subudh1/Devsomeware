"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import participantData from "./../../../public/participant_names.json";

type Participant = {
  participant_name: string;
};

const CertificatePage = () => {
  const [showModal, setShowModal] = useState(true);
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState("");
  const [isValidParticipant, setIsValidParticipant] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const certificateRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const font = new FontFace(
      "Tangerine",
      "url(https://fonts.gstatic.com/s/tangerine/v17/Iurd6Y5j_oScZZow4VO5srNZi5FN.woff2)",
      {
        style: "normal",
        weight: "700",
        display: "swap",
      }
    );

    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log("Tangerine font loaded successfully");
      })
      .catch((error) => {
        console.error("Failed to load Tangerine font:", error);
      });

    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href =
      "https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap";
    document.head.appendChild(linkElement);

    return () => {
      document.head.removeChild(linkElement);
    };
  }, []);

  useEffect(() => {
    const nameFromParams = searchParams.get("name");
    if (nameFromParams) {
      // Check if the name from URL is valid
      validateParticipant(nameFromParams);
    }
  }, [searchParams]);

  // Function to validate participant name against JSON data
  const validateParticipant = (nameToCheck: string) => {
    // Normalize name for comparison (trim and convert to lowercase)
    const normalizedName = nameToCheck.trim().toLowerCase();

    // Check if participant exists in the JSON data
    const participants = participantData as Participant[];
    const participantExists = participants.some(
      (p) => p.participant_name.trim().toLowerCase() === normalizedName
    );

    // Find the exact matching participant name
    const matchingParticipant = participants.find(
      (p) => p.participant_name.trim().toLowerCase() === normalizedName
    );

    if (participantExists && matchingParticipant) {
      // Use the properly formatted name from the JSON
      setName(matchingParticipant.participant_name);
      setFinalName(matchingParticipant.participant_name);
      setIsValidParticipant(true);
      setErrorMessage("");
      setShowModal(false);
    } else {
      setName(nameToCheck);
      setIsValidParticipant(false);
      setErrorMessage("Sorry, this name is not in our participant list.");
      // Keep modal open if name is from URL but invalid
      setShowModal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateParticipant(name);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current || !isValidParticipant) return;

    try {
      await document.fonts.ready;

      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 1414;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";

      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        const imagePath = window.location.origin + "/pc.png";
        img.src = imagePath;
      });

      await imageLoaded;

      ctx.drawImage(img, 0, 0, 2000, 1414);

      ctx.font = "bold 160px 'Tangerine', cursive";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      const textY = 750;

      ctx.fillText(finalName, 1000, textY);

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Zenotrone_Certificate_${finalName.replace(
        /\s+/g,
        "_"
      )}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert(
        "There was an error generating your certificate. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-gray-100 border rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
                placeholder="Enter your full name"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
              >
                Confirm & View Certificate
              </button>
            </form>
          </div>
        </div>
      )}

      {finalName && isValidParticipant && (
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div ref={certificateRef} className="relative w-full">
            <div className="relative">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "0",
                  paddingBottom: "70.7%",
                }}
              >
                <Image
                  src="/pc.png"
                  alt="Certificate Template"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center">
                <div className="lg:mt-[33%] sm:mt-[30%] md:mt-[34%] text-center w-full">
                  <h2
                    className="name-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic text-black"
                    style={{
                      fontFamily: "'Tangerine', cursive, serif",
                      fontWeight: 700,
                    }}
                  >
                    {finalName}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 mb-16">
            <button
              onClick={downloadCertificate}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Download Certificate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
