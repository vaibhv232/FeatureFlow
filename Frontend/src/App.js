import React, { useState } from "react";
import UploadSection from "./components/UploadSection";
import OutputSection from "./components/OutputSection";
import Modal from "./components/Modal";

function App() {
  const [instructions, setInstructions] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateInstructions = (generatedInstructions) => {
    setInstructions(generatedInstructions);
    setIsModalOpen(true); // Open modal when instructions are received
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <nav className="bg-white dark:bg-gray-800 shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="text-2xl font-bold dark:text-white text-gray-900">
            TestGen
          </div>

          <button
            onClick={toggleDarkMode}
            className="bg-gray-800 text-white px-4 py-2 rounded-md dark:bg-white dark:text-gray-800"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center mb-8">
          <h1 className="text-4xl font-bold text-center dark:text-white">
            Feature Testing Instructions Generator
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6 mb-8">
          <UploadSection onGenerate={handleGenerateInstructions} />
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Open Output
          </button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {instructions ? (
            <OutputSection instructions={instructions} />
          ) : (
            <div className="text-center dark:text-white">
              <p>
                No instructions available. Please generate instructions first.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default App;
