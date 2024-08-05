import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Delete } from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface ImageUploaderProps {
  initialImage?: string | null;
  onImageChange?: (imageUrl: string | null) => void;
}

const generateUniqueFileName = (file: File) => {
  const randomId = uuidv4();
  const extension = file.name.split('.').pop();
  return `${randomId}.${extension}`;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialImage, onImageChange }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage ?? null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLoading(true);
      const file = event.target.files[0];
      try {
        const uniqueFileName = generateUniqueFileName(file);
        const storageRef = ref(storage, `images/${uniqueFileName}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setImageUrl(downloadURL);
        if (onImageChange) {
          onImageChange(downloadURL);
        }
      }
      catch (error) {
        console.error('Error uploading image:', error);
      }
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) {
      return;
    }
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    setImageUrl(null);
    if (onImageChange) {
      onImageChange(null);
    }
    console.log('Image deleted successfully');
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUpload />}
      >
        Upload image
        <VisuallyHiddenInput type="file" onChange={handleFileChange} />
      </Button>
      {loading ? <Typography variant="body2">Uploading image...</Typography> : (
        imageUrl && (
          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
            <Box position="relative" width={200} sx={{ aspectRatio: '1 / 1' }}>
              <Image src={imageUrl} alt="Image preview" fill />
            </Box>
            <Tooltip title="Remove image" arrow>
              <IconButton
                color="secondary"
                onClick={handleRemoveImage}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )
      )}
    </Box>
  );
};

export default ImageUploader;