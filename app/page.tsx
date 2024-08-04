'use client';

import { useState, useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { Box, Button, Input, Modal, Stack, TextField, Typography, Tooltip, Container, Paper, InputAdornment } from '@mui/material';
import { collection, getDocs, query, setDoc, doc } from 'firebase/firestore';
import { firestore } from '@/firebase';

interface InventoryItem {
  name: string;
  quantity: number;
  [key: string]: any;
}

const COLLECTION_NAME = 'inventory';

const InventoryItemComponent = ({ item, updateItemQuantity }: { item: InventoryItem, updateItemQuantity: (name: string, quantity: number) => void }) => {
  const [quantity, setQuantity] = useState(item.quantity);

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
        <TextField
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          variant="outlined"
          size="small"
        />
      </Stack>
      <Button variant="contained" color="primary" onClick={() => updateItemQuantity(item.name, quantity)}>
        Save
      </Button>
    </Paper>
  );
};

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
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

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedItemFilter(itemFilter), 300);
    return () => clearTimeout(timeout);
  }, [itemFilter]);

  useEffect(() => {
    updateInventory();
  }, [debouncedItemFilter]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          <Input
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            placeholder="Search items"
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
          {inventory.map(item => (
            <InventoryItemComponent
              key={item.name}
              item={item}
              updateItemQuantity={updateItemQuantity}
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
    </Container>
  );
}