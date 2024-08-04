import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { InventoryItemData } from '@/types/inventory';

interface EditItemModalProps {
  open: boolean;
  onClose: () => void;
  currentItem: InventoryItemData | null;
  updateItemQuantity: (item: string, quantity: number) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ open, onClose, currentItem, updateItemQuantity }) => {
  const [itemQuantity, setItemQuantity] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentItem) {
      setItemQuantity(currentItem.quantity);
      setError('');
    }
  }, [currentItem]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 0) {
      setError('Quantity cannot be negative');
    } else {
      setError('');
    }
    setItemQuantity(value);
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
        <Typography variant="h5">Edit Item</Typography>
        <Stack
          width="100%"
          direction="column"
          spacing={2}
        >
          <TextField
            label="Quantity"
            variant="outlined"
            fullWidth
            value={itemQuantity}
            onChange={handleQuantityChange}
            type="number"
            error={!!error}
            helperText={error}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (currentItem) {
                updateItemQuantity(currentItem.name, itemQuantity);
              }
              onClose();
            }}
            disabled={!!error}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditItemModal;