import React, { useState } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { AddItemData } from '@/types/inventory';
import ImageUploader from '@/components/common/image-uploader';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  addItem: (item: AddItemData) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, addItem }) => {
  const [itemName, setItemName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleAddItem = () => {
    addItem({
      name: itemName,
      image: imageUrl,
    });
    setItemName('');
    setImageUrl(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={400}
        bgcolor="background.paper"
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          transform: 'translate(-50%, -50%)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5">Add Item</Typography>
        <Stack
          width="100%"
          direction="column"
          spacing={2}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />
          <ImageUploader onImageChange={setImageUrl} />
          <Button variant="contained" color="primary" onClick={handleAddItem}>
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default AddItemModal;