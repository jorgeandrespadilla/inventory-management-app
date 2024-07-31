'use client';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Button, Input, Modal, Stack, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from 'firebase/firestore';

interface InventoryItem {
  name: string;
  [key: string]: any; // Allows adding properties dynamically
}

const COLLECTION_NAME = 'inventory';

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
    docs.forEach((doc) =>
      inventoryList.push({ name: doc.id, ...doc.data() })
    );

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
    >
      <Typography variant="h1">Inventory Management</Typography>
      <Button variant="contained" onClick={handleOpen}>New Item</Button>
      <Box
        border="2px solid #333"
        width="800px"
        bgcolor="#ADD8E6"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant='h4' color='#333' p={2}>
          Items
        </Typography>

        <Box width="100%" p={2}>
          <Input
            placeholder="Search items"
            value={itemFilter}
            onChange={e => setItemFilter(e.target.value)}
          />
        </Box>

        <Stack
          width="100%"
          bgcolor="white"
          maxHeight="250px"
          spacing={2}
          overflow="auto"
        >
          {inventory.map(item => (
            <Box
              key={item.name}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#f0f0f0"
              p={5}
            >
              <Typography variant="h5" color="#333" textAlign='center'>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
              <Typography variant="h6" color="#333" textAlign='center'>
                {item.quantity}
              </Typography>
              <Stack gap={1} direction="row">
                <Button title="Add" variant="contained" onClick={() => addItem(item.name)} sx={{
                  minWidth: "0px",
                  paddingInline: "1.15rem",
                  fontSize: "18px",
                  fontWeight: 700
                }}>
                  +
                </Button>
                <Button title="Remove" variant="contained" onClick={() => removeItem(item.name)} sx={{
                  minWidth: "0px",
                  paddingInline: "1.15rem",
                  fontSize: "18px",
                  fontWeight: 700
                }}>
                  -
                </Button>
              </Stack>
            </Box>
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
            transform: "translate(-50%,-50%)"
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
