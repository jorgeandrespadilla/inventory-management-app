import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { InventoryItemData } from '@/types/inventory';

interface DeleteItemDialogProps {
  open: boolean;
  onClose: () => void;
  currentItem: InventoryItemData | null;
  deleteItem: (item: InventoryItemData) => void;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({ open, onClose, currentItem, deleteItem }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this item?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => {
          if (currentItem) {
            deleteItem(currentItem);
          }
          onClose();
        }} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteItemDialog;