"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  query,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch inventory items from Firestore
  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, "inventory"));
      const docs = await getDocs(snapshot);
      const inventoryList = docs.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  // Update the filtered inventory based on search query
  const handleSearch = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = inventory.filter((item) =>
      item.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredInventory(filtered);
  };

  // Add item
  const addItem = async (item) => {
    if (!item) return;

    try {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      await updateInventory();
    }
  };

  // Remove item
  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      await updateInventory();
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column">
      <Navbar onAddItemClick={handleOpen} />

      {/* Modal for adding items */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Search bar */}
      <Box width="800px" mx="auto" marginTop="5vmin" mb={2}>
        <TextField
          fullWidth
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">🔍</InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Inventory display */}
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box
          width="800px"
          height="100px"
          bgcolor="#405D72"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2}
          borderRadius={2}
        >
          <Typography variant="h4" color="#FFF">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" spacing={1} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="75px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={3}
              borderRadius={1}
              boxShadow={1}
            >
              <Typography variant="h5" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h5" color="#333">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
