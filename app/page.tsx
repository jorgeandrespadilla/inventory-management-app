'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Button, Input, Modal, Stack, TextField, Typography, Tooltip } from '@mui/material';
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from 'firebase/firestore';

interface InventoryItem {
  name: string;
  quantity: number;
  [key: string]: any;
}

const COLLECTION_NAME = 'inventory';

const InventoryItemComponent = ({ item, addItem, removeItem }: { item: InventoryItem, addItem: (name: string) => void, removeItem: (name: string) => void }) => {
  return (
    <Box
      key={item.name}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="#ffffff"
      p={2}
      m={1}
      borderRadius="8px"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
      sx={{
        transition: "transform 0.2s",
        '&:hover': {
          transform: "scale(1.02)"
        }
      }}
    >
      <Stack direction="column" spacing={1} alignItems="start">
        <Typography variant="h5" color="#333" sx={{
          fontWeight: 600,
          '&:hover': {
            color: "#007bff"
          }
        }}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Typography>
        <Typography variant="h6" color="#333" sx={{
          fontWeight: 500,
          '&:hover': {
            color: "#007bff"
          }
        }}>
          {item.quantity}
        </Typography>
      </Stack>
      <Stack gap={1} direction="row">
        <Tooltip title="Add">
          <Button variant="contained" onClick={() => addItem(item.name)} sx={{
            minWidth: "0px",
            paddingInline: "1.15rem",
            fontSize: "18px",
            fontWeight: 700,
            bgcolor: "#4caf50",
            '&:hover': {
              bgcolor: "#45a049"
            }
          }}>
            +
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <Button variant="contained" onClick={() => removeItem(item.name)} sx={{
            minWidth: "0px",
            paddingInline: "1.15rem",
            fontSize: "18px",
            fontWeight: 700,
            bgcolor: "#f44336",
            '&:hover': {
              bgcolor: "#e53935"
            }
          }}>
            -
          </Button>
        </Tooltip>
      </Stack>
    </Box>
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
      })
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
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    }
    else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item: string) => {
    const docRef = doc(collection(firestore, COLLECTION_NAME), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity == 1) {
        await deleteDoc(docRef);
      }
      else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedItemFilter(itemFilter), 500);
    return () => clearTimeout(timeout);
  }, [itemFilter]);

  useEffect(() => {
    updateInventory();
  }, [debouncedItemFilter]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      p={4}
      bgcolor="#f5f5f5"
    >
      <Typography variant="h1" color="#333" gutterBottom>
        Inventory Management
      </Typography>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        New Item
      </Button>
      <Box
        border="2px solid #333"
        width="800px"
        bgcolor="#fff"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        borderRadius="8px"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
        p={2}
      >
        <Typography variant='h4' color='#333' p={2}>
          Items
        </Typography>
        <Box width="100%" p={2}>
          <Input
            placeholder="Search items"
            value={itemFilter}
            onChange={e => setItemFilter(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Box>
        <Stack
          width="100%"
          bgcolor="white"
          maxHeight="250px"
          spacing={2}
          overflow="auto"
          p={2}
        >
          {inventory.map(item => (
            <InventoryItemComponent
              key={item.name}
              item={item}
              addItem={addItem}
              removeItem={removeItem}
            />
          ))}
        </Stack>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid black"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
            borderRadius: "8px"
          }}
        >
          <Typography variant="h5">Add item</Typography>
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
            <Button variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}