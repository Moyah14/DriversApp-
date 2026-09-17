export interface Transaction {
    id: string;
    date: string;
    time: string;
    amount: string;
    status: "Success" | "Pending" | "Failed";
    paymentMethod: string;
    location: string;
    description?: string;
  }
  
  // Generate mock transactions for a user
  export const generateMockTransactions = (userName: string, count: number = 25): Transaction[] => {
    const locations = [
      "Central Checkpoint", "North Gate", "South Gate", "East Gate", "West Gate",
      "Main Highway", "City Center", "Airport Road", "University Gate", "Market Square"
    ];
    
    const paymentMethods = ["Card", "Mobile Money", "Cash", "Bank Transfer"];
    const statuses: ("Success" | "Pending" | "Failed")[] = ["Success", "Pending", "Failed"];
    
    const transactions: Transaction[] = [];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
      
      const amount = Math.floor(Math.random() * 5000) + 500; // Random amount between 500-5500
      
      transactions.push({
        id: `TXN${String(i + 1).padStart(6, '0')}`,
        date: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        amount: `₦${amount.toLocaleString()}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
      });
    }
    
    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };