import React, { useState } from "react";
import { uploadUserAvatar } from "../api/client";

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  onSuccess?: (newAvatarUrl: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onSuccess,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo.");
        return;
      }

      setError(null);
      setPreviewUrl(URL.createObjectURL(file));
      setLoading(true);

      try {
        const data = await uploadUserAvatar(file);
        if (onSuccess) onSuccess(data.avatarUrl);
      } catch (err: any) {
        setError(err.response?.data?.error || "Erreur lors du téléversement");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Cercle d'avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center relative">
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400">Avatar</span>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
            ...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="cursor-pointer text-xs font-semibold px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded-md text-gray-700">
          Changer la photo
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};