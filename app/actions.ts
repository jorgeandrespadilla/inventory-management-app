'use server';

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { query, collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { InventoryItemData } from '@/types/inventory';
import { INVENTORY_COLLECTION_NAME } from '@/app/constants';
import { createStreamableValue } from 'ai/rsc';

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const getProducts = async () => {
    const snapshot = query(collection(firestore, INVENTORY_COLLECTION_NAME));
    const docs = await getDocs(snapshot);
    const inventoryList: InventoryItemData[] = [];
    docs.forEach((doc) => {
      const docData = doc.data();
      inventoryList.push({
        name: doc.id,
        quantity: docData.quantity,
        image: docData.image ?? null,
      });
    });
    return inventoryList;
}

export async function generateRecipe() {
    console.log(process.env.OPENROUTER_API_KEY);
    const products = await getProducts();
    const formattedProductList = products.map((ingredient) => `-${ingredient.name} (Quantity: ${ingredient.quantity})`).join("\n");
    const result = await streamText({
        model: openai("meta-llama/llama-3.1-8b-instruct:free"),
        messages: [
            {
                role: "system",
                content: "You are a chef who is trying to create a new recipe using only the available products in your pantry. Here are the ingredients you have:\n" + formattedProductList + "\n\nPlease create a recipe using these ingredients, where you include a list of the ingredients and the steps to prepare the dish. Use markdown to format your response."
            }
        ]
    });
    const stream = createStreamableValue(result.textStream);
    return stream.value;
}