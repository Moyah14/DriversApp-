export interface UnionHeadType {
    id: number | string;
    name: string;
    phone: string;
    address: string;
    park: string;
    driversCount: number;
    dateRegistered: string;
    registeredBy: string;
    status: "Active" | "Suspended";
    totalRevenue: string;
    commission: string;
  }