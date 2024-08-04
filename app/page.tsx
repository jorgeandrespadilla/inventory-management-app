'use client';

import { useState, useEffect } from 'react';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { Box, Button, Input, Modal, Stack, TextField, Typography, Tooltip, Container, Paper, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { collection, getDocs, query, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';

interface InventoryItem {
  name: string;
  quantity: number;
  [key: string]: any;
}

const COLLECTION_NAME = 'inventory';

const InventoryItemComponent = ({ item, openEditModal, openDeleteDialog }: { item: InventoryItem, openEditModal: (item: InventoryItem) => void, openDeleteDialog: (item: InventoryItem) => void }) => {
  return (
    <Paper
      key={item.name}
      elevation={3}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        m: 1,
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <Stack direction="column" spacing={1} alignItems="start">
        <Typography variant="h5" color="textPrimary">
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Quantity: {item.quantity}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="primary" startIcon={<Edit />} onClick={() => openEditModal(item)}>
          Edit
        </Button>
        <Button variant="contained" color="secondary" startIcon={<Delete />} onClick={() => openDeleteDialog(item)}>
          Delete
        </Button>
      </Stack>
    </Paper>
  );
};

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemFilter, setItemFilter] = useState('');
  const [debouncedItemFilter, setDebouncedItemFilter] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, COLLECTION_NAME));
    const docs = await getDocs(snapshot);
    const inventoryList: InventoryItem[] = [];
    docs.forEach((doc) => {
      const docData = doc.data();
      inventoryList.push({
        name: doc.id,
        quantity: docData.quantity,
      });
    });
    if (debouncedItemFilter === '') {
      setInventory(inventoryList);
      return;
    }
    const filteredInventory = inventoryList.filter(item => item.name.toLowerCase().includes(debouncedItemFilter.toLowerCase()));
    setInventory(filteredInventory);
  };

  const addItem = async (item: string) => {
    const docRef = doc(collection(firestore, COLLECTION_NAME), item);
    await setDoc(docRef, { quantity: 0 });
    await updateInventory();
  };

  const updateItemQuantity = async (item: string, quantity: number) => {
    const docRef = doc(collection(firestore, COLLECTION_NAME), item);
    await setDoc(docRef, { quantity });
    await updateInventory();
  };

  const deleteItem = async (item: string) => {
    const docRef = doc(collection(firestore, COLLECTION_NAME), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedItemFilter(itemFilter), 300);
    return () => clearTimeout(timeout);
  }, [itemFilter]);

  useEffect(() => {
    updateInventory();
  }, [debouncedItemFilter]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditModalOpen = (item: InventoryItem) => {
    setCurrentItem(item);
    setItemQuantity(item.quantity);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setCurrentItem(null);
  };

  const handleDeleteDialogOpen = (item: InventoryItem) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCurrentItem(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h2" color="#666" gutterBottom>
        Inventory
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<Add />} 
        onClick={handleOpen} 
        sx={{ mb: 2 }}
      >
        New Item
      </Button>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Box width="100%" p={2}>
          <TextField
            type="search"
            variant="outlined"
            placeholder="Search items"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            value={itemFilter}
            onChange={e => setItemFilter(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Box>
        <Stack
          width="100%"
          maxHeight="250px"
          spacing={2}
          overflow="auto"
          p={2}
        >
          {inventory.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              No items found
              </Typography>
          )}
          {inventory.map(item => (
            <InventoryItemComponent
              key={item.name}
              item={item}
              openEditModal={handleEditModalOpen}
              openDeleteDialog={handleDeleteDialogOpen}
            />
          ))}
        </Stack>
      </Paper>

      <Modal open={open} onClose={handleClose}>
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
            direction="row"
            spacing={2}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={editModalOpen} onClose={handleEditModalClose}>
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
              variant="outlined"
              fullWidth
              value={itemQuantity}
              onChange={e => setItemQuantity(Number(e.target.value))}
              type="number"
            />
            <Button variant="contained" color="primary" onClick={() => {
              if (currentItem) {
                updateItemQuantity(currentItem.name, itemQuantity);
              }
              handleEditModalClose();
            }}>
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            if (currentItem) {
              deleteItem(currentItem.name);
            }
            handleDeleteDialogClose();
          }} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}