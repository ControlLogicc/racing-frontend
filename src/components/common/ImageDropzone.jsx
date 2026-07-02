import { useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { CloudUploadFill } from 'react-bootstrap-icons';
import { uploadService } from '../../services/uploadService';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Kéo-thả hoặc bấm chọn ảnh → upload qua POST /api/uploads/images → trả imageUrl.
export default function ImageDropzone({ value, onUploaded, onError, size = 84, rounded = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.('Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onError?.('Ảnh không được vượt quá 5MB.');
      return;
    }
    setUploading(true);
    try {
      const { imageUrl } = await uploadService.uploadImage(file);
      onUploaded(imageUrl);
    } catch (err) {
      onError?.(err?.response?.data?.message || 'Tải ảnh lên thất bại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      title="Kéo-thả ảnh vào đây hoặc bấm để chọn"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        cursor: 'pointer',
        borderRadius: rounded ? '50%' : 12,
        border: `2px dashed ${dragOver ? '#D4AF37' : 'rgba(212,175,55,0.4)'}`,
        background: dragOver ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
      />
      {uploading ? (
        <Spinner animation="border" size="sm" style={{ color: '#D4AF37' }} />
      ) : value ? (
        <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <CloudUploadFill size={size >= 60 ? 22 : 16} style={{ color: 'rgba(212,175,55,0.7)' }} />
      )}
    </div>
  );
}
