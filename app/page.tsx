'use client';

import { useState, useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { Box, Button, Stack, TextField, Typography, Container, Paper, InputAdornment } from '@mui/material';
import { collection, getDocs, query, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage } from '@/firebase';
import { AddItemData, EditItemData, InventoryItemData } from '@/types/inventory';
import InventoryItem from '@/components/inventory/inventory-item';
import DeleteItemDialog from '@/components/inventory/delete-item-dialog';
import EditItemModal from '@/components/inventory/edit-item-modal';
import AddItemModal from '@/components/inventory/add-item-modal';
import { deleteObject, ref } from 'firebase/storage';
import { INVENTORY_COLLECTION_NAME } from '@/app/constants';
import RecipeGenerator from '@/components/inventory/recipe-generator';

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItemData[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItemData | null>(null);
  const [itemFilter, setItemFilter] = useState('');
  const [debouncedItemFilter, setDebouncedItemFilter] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, INVENTORY_COLLECTION_NAME));
    const docs = await getDocs(snapshot);
    const inventoryList: InventoryItemData[] = [];
    docs.forEach((doc) => {
      const docData = doc.data();
      inventoryList.push({
        name: doc.id,
        quantity: docData.quantity,
        image: docData.image ?? null
      });
    });
    if (debouncedItemFilter === '') {
      setInventory(inventoryList);
      return;
    }
    const filteredInventory = inventoryList.filter(item => item.name.toLowerCase().includes(debouncedItemFilter.toLowerCase()));
    setInventory(filteredInventory);
  };

  const addItem = async (item: AddItemData) => {
    const docRef = doc(collection(firestore, INVENTORY_COLLECTION_NAME), item.name);
    await setDoc(docRef, { 
      quantity: 1, 
      image: item.image ?? null
    });
    await updateInventory();
  };

  const updateItemQuantity = async (item: EditItemData) => {
    const docRef = doc(collection(firestore, INVENTORY_COLLECTION_NAME), item.name);
    await setDoc(docRef, { 
      quantity: item.quantity, 
      image: item.image ?? null
    });
    await updateInventory();
  };

  const deleteItem = async (item: InventoryItemData) => {
    const docRef = doc(collection(firestore, INVENTORY_COLLECTION_NAME), item.name);
    // Delete image from storage
    if (item.image) {
      try {
        const storageRef = ref(storage, item.image);
        await deleteObject(storageRef);
      }
      catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    // Delete item
    try {
      await deleteDoc(docRef);
    }
    catch (error) {
      console.error('Error deleting item:', error);
    }
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

  const handleEditModalOpen = (item: InventoryItemData) => {
    setCurrentItem(item);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setCurrentItem(null);
  };

  const handleDeleteDialogOpen = (item: InventoryItemData) => {
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
            <InventoryItem
              key={item.name}
              item={item}
              openEditModal={handleEditModalOpen}
              openDeleteDialog={handleDeleteDialogOpen}
            />
          ))}
        </Stack>
      </Paper>

      <RecipeGenerator />

      <AddItemModal
        open={open}
        onClose={handleClose}
        addItem={addItem}
      />

      <EditItemModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        currentItem={currentItem}
        editItem={updateItemQuantity}
      />

      <DeleteItemDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        currentItem={currentItem}
        deleteItem={deleteItem}
      />
    </Container>
  );
}