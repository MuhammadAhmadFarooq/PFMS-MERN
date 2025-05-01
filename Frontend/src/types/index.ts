export interface EggProduction {
    _id: string;
    date: string;
    totalEggs: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EggInventory {
    _id: string;
    totalEggs: number;
    soldEggs: Array<{
        buyer: {
            name: string;
            contact?: string;
        };
        quantity: number;
        saleDate: string;
    }>;
    remainingEggs: number;
    createdAt: string;
    updatedAt: string;
} 