export interface AgentType {
    id: number | string;
    name: string;
    email: string;
    phone: string;
    address: string;
    driversRegistered: number;
    level: string;
    dateRegistered: string;
    registeredBy: string;
    status: "Active" | "Suspended";
    totalEarnings: string;
    commission: string;
  }