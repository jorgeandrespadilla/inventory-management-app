import { InventoryItemData } from "@/types/inventory";
import { Delete, Edit } from "@mui/icons-material";
import { Button, Paper, Stack, Typography } from "@mui/material";

interface InventoryItemProps {
  item: InventoryItemData;
  openEditModal: (item: InventoryItemData) => void;
  openDeleteDialog: (item: InventoryItemData) => void;
}

const InventoryItem = ({ 
  item,
  openEditModal,
  openDeleteDialog 
}: InventoryItemProps) => {
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

export default InventoryItem;