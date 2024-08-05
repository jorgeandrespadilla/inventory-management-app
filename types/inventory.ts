export interface InventoryItemData {
    name: string;
    quantity: number;
    image: string | null;
    [key: string]: any;
}

export interface AddItemData {
    name: string;
    image: string | null;
}

export interface EditItemData {
    name: string;
    quantity: number;
    image: string | null;
}