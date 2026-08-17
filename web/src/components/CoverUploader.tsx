import React, { useState } from "react";
import { uploadStoryCover } from "../api/client";

interface CoverUploaderProps {
  storyId: string;
  currentCoverUrl?: string;
  onSuccess?: (newCoverUrl: string) => void;
}

export const CoverUploader: React.FC<CoverUploaderProps> = ({
  storyId,
  currentCoverUrl,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo.");
        return;
      }

      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const data = await uploadStoryCover(storyId, selectedFile);
      setSelectedFile(null);
      if (onSuccess) onSuccess(data.coverUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors du téléversement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-lg max-w-xs bg-white">
      {/* Aperçu de la couverture */}
      <div className="w-36 h-52 bg-gray-100 rounded-md overflow-hidden relative border flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="Couverture" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400 text-center px-2">Aucune couverture</span>
        )}
      </div>

      {/* Sélection de fichier */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Bouton d'envoi */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium disabled:opacity-50"
        >
          {loading ? "Téléversement..." : "Changer la couverture"}
        </button>
      )}
    </div>
  );
};